const express = require('express');
const router = express.Router();
const { getWeeklyChartData } = require('../controllers/chartController');
const { protect } = require('../middlewares/authMiddleware');

// GET /api/charts/weekly
router.get('/weekly', protect, getWeeklyChartData);

module.exports = router;
