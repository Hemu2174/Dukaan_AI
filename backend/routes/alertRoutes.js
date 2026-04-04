const express = require('express');
const router = express.Router();
const { collections } = require('../utils/mongoClient');
const { generateAlert } = require('../services/aiService');
const { resolveOwnerId } = require('../utils/authHelpers');
const { getDemoTransactions } = require('../utils/demoTransactions');

// POST /api/alerts/weekly
router.post('/weekly', async (req, res) => {
  try {
    const ownerId = await resolveOwnerId(req);

    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);

    const existingAlerts = await collections.alerts()
      .find({
        user_id: ownerId,
        created_at: { $gte: todayObj },
      })
      .sort({ created_at: 1 })
      .toArray();

    if (existingAlerts.length > 0) {
      return res.json({ alert: existingAlerts[existingAlerts.length - 1] });
    }

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    let transactions = await collections.transactions()
      .find({
        user_id: ownerId,
        created_at: { $gte: sevenDaysAgo },
      })
      .toArray();

    if (!transactions || transactions.length < 3) {
      transactions = getDemoTransactions(ownerId);
    }

    const daysMap = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      daysMap[dStr] = { date: dStr, income: 0, expenses: 0, net: 0, udhari: 0 };
    }

    transactions.forEach((t) => {
      const localDate = new Date(t.created_at || t.createdAt);
      const key = new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
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
    const activeDays = weekData.filter((d) => d.income > 0 || d.expenses > 0).length;
    if (activeDays < 3) {
      transactions = getDemoTransactions(ownerId);
      Object.keys(daysMap).forEach((key) => {
        daysMap[key] = { date: key, income: 0, expenses: 0, net: 0, udhari: 0 };
      });
      transactions.forEach((t) => {
        const localDate = new Date(t.created_at || t.createdAt);
        const key = new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
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
    }

    const alertText = await generateAlert(weekData);
    const alertDoc = {
      user_id: ownerId,
      alert_text: alertText,
      created_at: new Date(),
    };

    const result = await collections.alerts().insertOne(alertDoc);
    return res.json({ alert: { id: result.insertedId.toString(), ...alertDoc } });
  } catch (error) {
    console.error('Alert generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/alerts
router.get('/', async (req, res) => {
  try {
    const ownerId = await resolveOwnerId(req);

    const data = await collections.alerts()
      .find({ user_id: ownerId })
      .sort({ created_at: -1 })
      .toArray();

    res.json(data.map((doc) => ({ id: doc._id.toString(), ...doc })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
