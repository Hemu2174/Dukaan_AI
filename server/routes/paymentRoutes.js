const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// GET /api/payments/split
router.get('/split', async (req, res) => {
  try {
    let user_id = req.user.id;

    if (req.user.role === 'helper') {
      user_id = req.user.owner_id;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const transactions = await Transaction.find({
      user_id,
      created_at: { $gte: today, $lt: tomorrow }
    });

    let cashIncome = 0;
    let cashExpense = 0;
    let upiIncome = 0;
    let upiExpense = 0;
    let udhariIncome = 0;

    transactions.forEach(t => {
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

    const response = {
      cash: {
        income: cashIncome,
        expense: cashExpense,
        net: cashIncome - cashExpense
      },
      upi: {
        income: upiIncome,
        expense: upiExpense,
        net: upiIncome - upiExpense
      },
      udhari: udhariIncome,
      totals: {
        income: cashIncome + upiIncome + udhariIncome,
        expense: cashExpense + upiExpense
      }
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
