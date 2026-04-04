const express = require('express');
const router = express.Router();
const { collections } = require('../utils/mongoClient');
const { resolveOwnerId } = require('../utils/authHelpers');

// GET /api/payments/split
router.get('/split', async (req, res) => {
  try {
    const ownerId = await resolveOwnerId(req);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const data = await collections.transactions()
      .find({
        user_id: ownerId,
        created_at: { $gte: today, $lt: tomorrow },
      })
      .project({ amount: 1, payment_method: 1, type: 1 })
      .toArray();

    let cashIncome = 0;
    let cashExpense = 0;
    let upiIncome = 0;
    let upiExpense = 0;
    let udhariIncome = 0;

    data.forEach((t) => {
      const amt = Number(t.amount) || 0;
      const method = t.payment_method?.toLowerCase();

      if (method === 'cash') {
        if (t.type === 'income') cashIncome += amt;
        else cashExpense += amt;
      } else if (method === 'upi') {
        if (t.type === 'income') upiIncome += amt;
        else upiExpense += amt;
      } else if (method === 'udhari') {
        if (t.type === 'income') udhariIncome += amt;
      }
    });

    res.json({
      cash: {
        income: cashIncome,
        expense: cashExpense,
        net: cashIncome - cashExpense,
      },
      upi: {
        income: upiIncome,
        expense: upiExpense,
        net: upiIncome - upiExpense,
      },
      udhari: udhariIncome,
      totals: {
        income: cashIncome + upiIncome + udhariIncome,
        expense: cashExpense + upiExpense,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
