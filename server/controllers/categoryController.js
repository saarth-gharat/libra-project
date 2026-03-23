const { Category, Book } = require('../models');
const sequelize = require('../config/database');

exports.getAll = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      attributes: {
        include: [
          [sequelize.fn('COUNT', sequelize.col('books.id')), 'book_count'],
        ],
      },
      include: [{ model: Book, as: 'books', attributes: [] }],
      group: ['Category.id'],
      order: [['name', 'ASC']],
    });

    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ category });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    await category.update(req.body);
    res.json({ category });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    await category.destroy();
    res.json({ message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};
