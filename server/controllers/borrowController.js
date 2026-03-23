const { Op } = require('sequelize');
const { Borrow, Book, User, Fine, Notification, ActivityLog } = require('../models');

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, user_id } = req.query;
    const where = {};

    if (status) where.status = status;
    if (user_id) where.user_id = user_id;

    // Students can only see their own borrows
    if (req.user.role === 'student') {
      where.user_id = req.user.id;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { rows: borrows, count: total } = await Borrow.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'student_id'] },
        {
          model: Book,
          as: 'book',
          attributes: ['id', 'title', 'author', 'cover_url', 'isbn'],
        },
        { model: Fine, as: 'fines' },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      borrows,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.issueBook = async (req, res, next) => {
  try {
    const { user_id, book_id } = req.body;
    const durationDays = parseInt(process.env.BORROW_DURATION_DAYS) || 14;
    const maxLimit = parseInt(process.env.MAX_BORROW_LIMIT) || 5;

    // Check book availability
    const book = await Book.findByPk(book_id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.available_copies <= 0) {
      return res.status(400).json({ message: 'No copies available' });
    }

    // Check user exists
    const user = await User.findByPk(user_id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check borrow limit
    const activeCount = await Borrow.count({
      where: { user_id, status: 'active' },
    });
    if (activeCount >= maxLimit) {
      return res.status(400).json({
        message: `Borrow limit reached (max ${maxLimit} books)`,
      });
    }

    // Check if already borrowing this book
    const existingBorrow = await Borrow.findOne({
      where: { user_id, book_id, status: 'active' },
    });
    if (existingBorrow) {
      return res.status(400).json({ message: 'User already has this book borrowed' });
    }

    const borrowDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + durationDays);

    const borrow = await Borrow.create({
      user_id,
      book_id,
      borrow_date: borrowDate,
      due_date: dueDate,
      status: 'active',
      issued_by: req.user.id,
    });

    // Decrease available copies
    await book.update({ available_copies: book.available_copies - 1 });

    // Create notification
    await Notification.create({
      user_id,
      title: 'Book Issued',
      message: `"${book.title}" has been issued to you. Due date: ${dueDate.toLocaleDateString()}`,
      type: 'success',
    });

    await ActivityLog.create({
      user_id: req.user.id,
      action: 'issue',
      entity_type: 'borrow',
      entity_id: borrow.id,
      description: `Issued "${book.title}" to ${user.name}`,
    });

    const fullBorrow = await Borrow.findByPk(borrow.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Book, as: 'book', attributes: ['id', 'title', 'author', 'cover_url'] },
      ],
    });

    res.status(201).json({ borrow: fullBorrow });
  } catch (error) {
    next(error);
  }
};

exports.returnBook = async (req, res, next) => {
  try {
    const borrow = await Borrow.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user' },
        { model: Book, as: 'book' },
      ],
    });

    if (!borrow) return res.status(404).json({ message: 'Borrow record not found' });
    if (borrow.status === 'returned') {
      return res.status(400).json({ message: 'Book already returned' });
    }

    const returnDate = new Date();
    const dueDate = new Date(borrow.due_date);
    let fineCreated = null;

    // Calculate fine if overdue
    if (returnDate > dueDate) {
      const diffTime = returnDate - dueDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const finePerDay = parseFloat(process.env.FINE_PER_DAY) || 1.0;
      const amount = diffDays * finePerDay;

      fineCreated = await Fine.create({
        borrow_id: borrow.id,
        user_id: borrow.user_id,
        amount,
        reason: `Overdue by ${diffDays} day(s)`,
        status: 'pending',
      });

      await Notification.create({
        user_id: borrow.user_id,
        title: 'Fine Generated',
        message: `A fine of ₹${amount.toFixed(2)} has been generated for late return of "${borrow.book.title}"`,
        type: 'warning',
      });
    }

    await borrow.update({ return_date: returnDate, status: 'returned' });

    // Increase available copies
    await borrow.book.update({
      available_copies: borrow.book.available_copies + 1,
    });

    await Notification.create({
      user_id: borrow.user_id,
      title: 'Book Returned',
      message: `"${borrow.book.title}" has been returned successfully.`,
      type: 'success',
    });

    await ActivityLog.create({
      user_id: req.user.id,
      action: 'return',
      entity_type: 'borrow',
      entity_id: borrow.id,
      description: `Returned "${borrow.book.title}" from ${borrow.user.name}`,
    });

    res.json({ borrow, fine: fineCreated });
  } catch (error) {
    next(error);
  }
};

exports.getMyBorrows = async (req, res, next) => {
  try {
    const borrows = await Borrow.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Book,
          as: 'book',
          include: [{ model: require('../models/Category'), as: 'category', attributes: ['id', 'name', 'color'] }],
        },
        { model: Fine, as: 'fines' },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json({ borrows });
  } catch (error) {
    next(error);
  }
};
