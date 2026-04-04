const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const Helper = require('../models/Helper');
const { parseTextWithAI } = require('../services/aiService');

// POST /api/transactions/parse
router.post('/parse', async (req, res) => {
  try {
    const { raw_text } = req.body;
    if (!raw_text) return res.status(400).json({ error: 'raw_text is required' });

    const parsed = await parseTextWithAI(raw_text);
    res.json(parsed);
  } catch (error) {
    console.error("Parse Error:", error);
    res.status(500).json({ error: 'Failed to parse text' });
  }
});

// POST /api/transactions
router.post('/', async (req, res) => {
  try {
    const { amount, type, category, payment_method, raw_text, notes, product_name } = req.body;
    
    if (amount === undefined || !type || !category || !payment_method) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let user_id = req.user.id;
    let helper_id = null;

    // If helper role, get owner's ID
    if (req.user.role === 'helper') {
      helper_id = req.user.id;
      user_id = req.user.owner_id;
    }

    // Create transaction
    const transaction = await Transaction.create({
      user_id,
      helper_id,
      amount,
      type,
      category,
      payment_method,
      raw_text: raw_text || "",
      notes: notes ? `${notes} ${product_name || ''}`.trim() : (product_name || ""),
      logged_by_role: req.user.role,
      logged_by_name: req.user.role === 'helper' ? req.user.name : 'Owner'
    });

    // Update inventory if product_name provided and income
    if (product_name && type === "income") {
      const product = await Product.findOne({
        user_id,
        product_name: { $regex: product_name, $options: 'i' }
      });
      
      if (product) {
        product.current_stock = Math.max(0, (product.current_stock || 1) - 1);
        await product.save();
      }
    }

    res.json(transaction);
  } catch (error) {
    console.error("Insert Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/transactions/today
router.get('/today', async (req, res) => {
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
    }).sort({ created_at: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/transactions/week
router.get('/week', async (req, res) => {
  try {
    let user_id = req.user.id;

    if (req.user.role === 'helper') {
      user_id = req.user.owner_id;
    }

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const transactions = await Transaction.find({
      user_id,
      created_at: { $gte: sevenDaysAgo }
    });

    const daysMap = {};
    
    // Initialize last 7 days
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().split("T")[0];
      
      daysMap[key] = {
        date: key,
        income: 0,
        expenses: 0,
        net: 0
      };
    }

    // Aggregate transactions by day
    transactions.forEach(t => {
      const tDate = new Date(t.created_at);
      tDate.setHours(0, 0, 0, 0);
      const key = tDate.toISOString().split("T")[0];
      
      if (!daysMap[key]) {
        daysMap[key] = {
          date: key,
          income: 0,
          expenses: 0,
          net: 0
        };
      }

      const amt = Number(t.amount) || 0;
      if (t.type === 'income') daysMap[key].income += amt;
      if (t.type === 'expense') daysMap[key].expenses += amt;
      daysMap[key].net = daysMap[key].income - daysMap[key].expenses;
    });

    const responseArray = Object.values(daysMap).sort((a, b) => a.date.localeCompare(b.date));
    res.json(responseArray);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/transactions/dashboard
router.get('/dashboard', async (req, res) => {
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

    let totalSales = 0;
    let totalExpense = 0;
    let cash = 0;
    let upi = 0;
    let udhari = 0;

    transactions.forEach(t => {
      const amt = Number(t.amount) || 0;

      if (t.type === 'income') totalSales += amt;
      else totalExpense += amt;

      const delta = t.type === 'income' ? amt : -amt;
      if (t.payment_method === 'cash') cash += delta;
      if (t.payment_method === 'upi') upi += delta;
      if (t.payment_method === 'udhari') udhari += delta;
    });

    res.json({
      totalSales,
      totalExpense,
      profit: totalSales - totalExpense,
      cash,
      upi,
      udhari,
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
