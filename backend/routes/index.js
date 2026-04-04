const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const transactionRoutes = require('./transactionRoutes');
const paymentRoutes = require('./paymentRoutes');
const summaryRoutes = require('./summaryRoutes');
const alertRoutes = require('./alertRoutes');
const { protect, allowRoles } = require('../middlewares/authMiddleware');

// Helper to return mock response for stubbed routes
const stubRoute = (req, res) => {
  res.json({ message: "Route working", user: req.user });
};

// API Auth routes
router.use('/auth', authRoutes);

// API Transactions routes (Owner and Helper)
router.use('/transactions', protect, allowRoles('owner', 'helper', 'demo'), transactionRoutes);

// API Payments routes (Owner only)
router.use('/payments', protect, allowRoles('owner', 'demo'), paymentRoutes);

// API Products routes (Owner only)
const productRoutes = require('./productRoutes');
router.use('/products', protect, allowRoles('owner', 'demo'), productRoutes);

// API Distributors routes (Owner only)
router.use('/distributors', protect, allowRoles('owner', 'demo'), stubRoute);

// API Summary routes (Owner only)
router.use('/summary', protect, allowRoles('owner', 'demo'), summaryRoutes);

// API Alerts routes (Owner and Helper)
router.use('/alerts', protect, allowRoles('owner', 'helper', 'demo'), alertRoutes);

// API Charts routes (Owner and Helper)
const chartRoutes = require('./chartRoutes');
router.use('/charts', protect, allowRoles('owner', 'helper', 'demo'), chartRoutes);

// API Reports routes (Owner only)
const reportsRoutes = require('./reportsRoutes');
router.use('/reports', protect, allowRoles('owner', 'demo'), reportsRoutes);

module.exports = router;
