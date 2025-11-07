require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');

const { initializeDatabase } = require('./src/db/database');
const { seedDatabase } = require('./src/utils/seedDatabase');
const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/products');
const transactionRoutes = require('./src/routes/transactions');
const stockRoutes = require('./src/routes/stock');
const reportRoutes = require('./src/routes/reports');
const syncRoutes = require('./src/routes/sync');
const { authenticate } = require('./src/middleware/auth');
const { errorHandler } = require('./src/middleware/errorHandler');

const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize database and seed
initializeDatabase();
seedDatabase();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sync', syncRoutes);

// Protected routes
app.use(authenticate);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/reports', reportRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 POS Server running on port ${PORT}`);
});
