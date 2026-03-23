const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  author: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  isbn: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  cover_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  publisher: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  published_year: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  total_copies: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  available_copies: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'categories', key: 'id' },
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Shelf/rack location in library',
  },
}, {
  tableName: 'books',
  indexes: [
    { fields: ['title'] },
    { fields: ['author'] },
    { fields: ['isbn'] },
    { fields: ['category_id'] },
  ],
});

module.exports = Book;
