require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');
const { sequelize } = require('./models');
const errorHandler = require('./middleware/errorHandler');
const schedulerService = require('./services/schedulerService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/borrows', require('./routes/borrows'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/users', require('./routes/users'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/fines', require('./routes/fines'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/verification', require('./routes/verification'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Start
const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Sync database - only create tables if they don't exist
    await sequelize.sync();
    console.log('Database synced');

    app.listen(PORT, () => {
      console.log(`LIBRA.ONE server running on port ${PORT}`);

      // Self ping every 10 minutes to prevent Render free tier sleep
      setInterval(() => {
        https.get('https://libra-backend-i309.onrender.com/api/health', (res) => {
          console.log('Self ping status:', res.statusCode);
        }).on('error', (e) => {
          console.log('Self ping error:', e.message);
        });
      }, 10 * 60 * 1000);
    });

    // Start notification scheduler
    schedulerService.start();
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

start();