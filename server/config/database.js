require('dotenv').config();
const path = require('path');
const { Sequelize } = require('sequelize');

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = isProduction
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      logging: false,
      define: {
        timestamps: true,
        underscored: true,
        paranoid: true,
      },
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '..', 'database.sqlite'),
      logging: false,
      define: {
        timestamps: true,
        underscored: true,
        paranoid: true,
      },
    });

module.exports = sequelize;