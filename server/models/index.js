const sequelize = require('../config/database');
const User = require('./User');
const Book = require('./Book');
const Category = require('./Category');
const Borrow = require('./Borrow');
const Fine = require('./Fine');
const Notification = require('./Notification');
const ActivityLog = require('./ActivityLog');

// Associations
Category.hasMany(Book, { foreignKey: 'category_id', as: 'books' });
Book.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

User.hasMany(Borrow, { foreignKey: 'user_id', as: 'borrows' });
Borrow.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Book.hasMany(Borrow, { foreignKey: 'book_id', as: 'borrows' });
Borrow.belongsTo(Book, { foreignKey: 'book_id', as: 'book' });

Borrow.belongsTo(User, { foreignKey: 'issued_by', as: 'issuer' });

Borrow.hasMany(Fine, { foreignKey: 'borrow_id', as: 'fines' });
Fine.belongsTo(Borrow, { foreignKey: 'borrow_id', as: 'borrow' });

User.hasMany(Fine, { foreignKey: 'user_id', as: 'fines' });
Fine.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(ActivityLog, { foreignKey: 'user_id', as: 'activityLogs' });
ActivityLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Book,
  Category,
  Borrow,
  Fine,
  Notification,
  ActivityLog,
};
