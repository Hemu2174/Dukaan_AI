const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const Transaction = require('../models/Transaction');
const { generateAlert } = require('../services/aiService');

// POST /api/alerts/weekly
router.post('/weekly', async (req, res) => {
  try {
    let user_id = req.user.id;

    if (req.user.role === 'helper') {
      user_id = req.user.owner_id;
    }

    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);

    // 1. Check if today's alert exists
    const existingAlerts = await Alert.findOne({
      user_id,
      created_at: { $gte: todayObj }
    }).sort({ created_at: -1 });

    if (existingAlerts) {
      return res.json({ alert: existingAlerts });
    }

    // 2. Fetch last 7 days of data
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const transactions = await Transaction.find({
      user_id,
      created_at: { $gte: sevenDaysAgo }
    });

    // Group by Day
    const daysMap = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dStr = d.toISOString().split("T")[0];
      daysMap[dStr] = { date: dStr, income: 0, expenses: 0, net: 0, udhari: 0 };
    }

    transactions.forEach(t => {
      const tDate = new Date(t.created_at);
      tDate.setHours(0, 0, 0, 0);
      const key = tDate.toISOString().split("T")[0];
      
      if (!daysMap[key]) return;

      const amt = Number(t.amount) || 0;
      if (t.type === 'income') {
        daysMap[key].income += amt;
        if (t.payment_method === 'udhari') {
          daysMap[key].udhari += amt;
        }
      }
      if (t.type === 'expense') daysMap[key].expenses += amt;
      daysMap[key].net = daysMap[key].income - daysMap[key].expenses;
    });

    const weekData = Object.values(daysMap).sort((a, b) => a.date.localeCompare(b.date));

    // Check if enough data exists
    const activeDays = weekData.filter(d => d.income > 0 || d.expenses > 0).length;
    if (activeDays < 3) {
      return res.json({ skip: true, message: "Not enough days with data to form an anomaly pattern." });
    }

    // 3. Groq Anomaly Detection
    const alertText = await generateAlert(weekData);

    // 4. Store in DB
    const alert = await Alert.create({
      user_id,
      alert_text: alertText,
      type: 'warning'
    });

    return res.json({ alert });

  } catch (error) {
    console.error("Alert generation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/alerts
router.get('/', async (req, res) => {
  try {
    let user_id = req.user.id;
    if (req.user.role === 'helper') {
      user_id = req.user.owner_id;
    }

    const alerts = await Alert.find({ user_id })
      .sort({ created_at: -1 });

    res.json(alerts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
