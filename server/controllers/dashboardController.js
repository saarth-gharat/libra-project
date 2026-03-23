const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { User, Book, Borrow, Fine, ActivityLog, Category } = require('../models');

exports.adminStats = async (req, res, next) => {
  try {
    const [
      totalBooks,
      totalUsers,
      activeBorrows,
      overdueBorrows,
      totalFinesPending,
      categoryStats,
      recentActivity,
      monthlyBorrows,
    ] = await Promise.all([
      Book.sum('total_copies'),
      User.count({ where: { role: 'student' } }),
      Borrow.count({ where: { status: 'active' } }),
      Borrow.count({
        where: {
          status: 'active',
          due_date: { [Op.lt]: new Date() },
        },
      }),
      Fine.sum('amount', { where: { status: 'pending' } }),
      Category.findAll({
        attributes: [
          'id',
          'name',
          'color',
          [sequelize.fn('COUNT', sequelize.col('books.id')), 'book_count'],
        ],
        include: [{ model: Book, as: 'books', attributes: [] }],
        group: ['Category.id'],
        raw: true,
      }),
      ActivityLog.findAll({
        include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
        order: [['created_at', 'DESC']],
        limit: 20,
      }),
      // Monthly borrow stats for the last 6 months
      sequelize.query(
        `SELECT 
          strftime('%Y-%m', borrow_date) as month,
          COUNT(*) as count
        FROM borrows
        WHERE borrow_date >= date('now', '-6 months')
        GROUP BY strftime('%Y-%m', borrow_date)
        ORDER BY month ASC`,
        { type: sequelize.QueryTypes.SELECT }
      ),
    ]);

    res.json({
      stats: {
        totalBooks: totalBooks || 0,
        totalUsers,
        activeBorrows,
        overdueBorrows,
        totalFinesPending: totalFinesPending || 0,
      },
      categoryStats,
      recentActivity,
      monthlyBorrows,
    });
  } catch (error) {
    next(error);
  }
};

exports.studentStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [
      activeBorrows,
      totalBorrowed,
      pendingFines,
      currentBooks,
      recentHistory,
    ] = await Promise.all([
      Borrow.count({ where: { user_id: userId, status: 'active' } }),
      Borrow.count({ where: { user_id: userId } }),
      Fine.sum('amount', { where: { user_id: userId, status: 'pending' } }),
      Borrow.findAll({
        where: { user_id: userId, status: 'active' },
        include: [
          {
            model: Book,
            as: 'book',
            include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'color'] }],
          },
        ],
        order: [['due_date', 'ASC']],
      }),
      Borrow.findAll({
        where: { user_id: userId, status: 'returned' },
        include: [
          {
            model: Book,
            as: 'book',
            attributes: ['id', 'title', 'author', 'cover_url'],
          },
        ],
        order: [['return_date', 'DESC']],
        limit: 10,
      }),
    ]);

    res.json({
      stats: {
        activeBorrows,
        totalBorrowed,
        pendingFines: pendingFines || 0,
        maxBorrowLimit: parseInt(process.env.MAX_BORROW_LIMIT) || 5,
      },
      currentBooks,
      recentHistory,
    });
  } catch (error) {
    next(error);
  }
};
