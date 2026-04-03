const express = require('express');
const router = express.Router();
const { supabase } = require('../utils/supabaseClient');

// GET /api/payments/split
router.get('/split', async (req, res) => {
  try {
    let ownerId = req.user.user_id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from('transactions')
      .select('amount, payment_method, type')
      .eq('user_id', ownerId)
      // typically we only want income split, or absolute total. We'll map absolute transactions
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString());

    if (error) throw error;

    let cashIncome = 0;
    let cashExpense = 0;
    let upiIncome = 0;
    let upiExpense = 0;
    let udhariIncome = 0;

    data.forEach(t => {
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
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
