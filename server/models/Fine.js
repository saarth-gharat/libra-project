const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Fine = sequelize.define('Fine', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  borrow_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'borrows', key: 'id' },
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  reason: {
    type: DataTypes.STRING(255),
    defaultValue: 'Overdue return',
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'waived'),
    defaultValue: 'pending',
  },
  paid_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
}, {
  tableName: 'fines',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['status'] },
  ],
});

module.exports = Fine;
