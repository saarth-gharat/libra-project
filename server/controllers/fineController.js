const { Fine, Borrow, Book, User } = require('../models');

exports.getAll = async (req, res, next) => {
  try {
    const { status, user_id } = req.query;
    const where = {};

    if (status) where.status = status;
    if (user_id) where.user_id = user_id;

    // Students only see their own fines
    if (req.user.role === 'student') {
      where.user_id = req.user.id;
    }

    const fines = await Fine.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'student_id'] },
        {
          model: Borrow,
          as: 'borrow',
          include: [{ model: Book, as: 'book', attributes: ['id', 'title'] }],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json({ fines });
  } catch (error) {
    next(error);
  }
};

exports.payFine = async (req, res, next) => {
  try {
    const fine = await Fine.findByPk(req.params.id);
    if (!fine) return res.status(404).json({ message: 'Fine not found' });

    await fine.update({ status: 'paid', paid_date: new Date() });
    res.json({ fine });
  } catch (error) {
    next(error);
  }
};

exports.waiveFine = async (req, res, next) => {
  try {
    const fine = await Fine.findByPk(req.params.id);
    if (!fine) return res.status(404).json({ message: 'Fine not found' });

    await fine.update({ status: 'waived' });
    res.json({ fine });
  } catch (error) {
    next(error);
  }
};
