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

    const split = {
      cash: 0,
      upi: 0,
      udhari: 0
    };

    data.forEach(t => {
      // If it's an expense, depending on business logic you might subtract. 
      // But usually 'payment split' means collection split (income).
      // Assuming we just accumulate income:
      if (t.type === 'income') {
        const method = t.payment_method?.toLowerCase();
        if (split[method] !== undefined) {
          split[method] += Number(t.amount) || 0;
        }
      }
    });

    res.json(split);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
