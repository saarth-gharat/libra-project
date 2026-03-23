const { Op } = require('sequelize');
const { Book, Category, Borrow, ActivityLog } = require('../models');

exports.getAll = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      available,
      sort = 'created_at',
      order = 'DESC',
    } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { author: { [Op.like]: `%${search}%` } },
        { isbn: { [Op.like]: `%${search}%` } },
      ];
    }
    if (category) where.category_id = category;
    if (available === 'true') where.available_copies = { [Op.gt]: 0 };

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { rows: books, count: total } = await Book.findAndCountAll({
      where,
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'color'] }],
      order: [[sort, order.toUpperCase()]],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      books,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        {
          model: Borrow,
          as: 'borrows',
          where: { status: 'active' },
          required: false,
          attributes: ['id', 'user_id', 'borrow_date', 'due_date', 'status'],
        },
      ],
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ book });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const book = await Book.create(req.body);

    await ActivityLog.create({
      user_id: req.user.id,
      action: 'create',
      entity_type: 'book',
      entity_id: book.id,
      description: `Added book "${book.title}"`,
    });

    const fullBook = await Book.findByPk(book.id, {
      include: [{ model: Category, as: 'category' }],
    });

    res.status(201).json({ book: fullBook });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await book.update(req.body);

    await ActivityLog.create({
      user_id: req.user.id,
      action: 'update',
      entity_type: 'book',
      entity_id: book.id,
      description: `Updated book "${book.title}"`,
    });

    const fullBook = await Book.findByPk(book.id, {
      include: [{ model: Category, as: 'category' }],
    });

    res.json({ book: fullBook });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const activeBorrows = await Borrow.count({
      where: { book_id: book.id, status: 'active' },
    });

    if (activeBorrows > 0) {
      return res.status(400).json({ message: 'Cannot delete book with active borrows' });
    }

    await ActivityLog.create({
      user_id: req.user.id,
      action: 'delete',
      entity_type: 'book',
      entity_id: book.id,
      description: `Deleted book "${book.title}"`,
    });

    await book.destroy();
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.search = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ books: [] });
    }

    const books = await Book.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${q}%` } },
          { author: { [Op.like]: `%${q}%` } },
          { isbn: { [Op.like]: `%${q}%` } },
        ],
      },
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'color'] }],
      limit: 10,
      order: [['title', 'ASC']],
    });

    res.json({ books });
  } catch (error) {
    next(error);
  }
};
