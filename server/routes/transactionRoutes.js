const express = require('express');
const router = express.Router();
const { collections } = require('../utils/mongoClient');
const { parseTextWithAI } = require('../services/aiService');
const { resolveOwnerId, resolveHelperName } = require('../utils/authHelpers');

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toTransactionPayload(doc) {
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}

// POST /api/transactions/parse
router.post('/parse', async (req, res) => {
  try {
    const { raw_text } = req.body;
    if (!raw_text) return res.status(400).json({ error: 'raw_text is required' });

    const parsed = await parseTextWithAI(raw_text);
    res.json(parsed);
  } catch (error) {
    console.error('Parse Error:', error);
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

    const ownerId = await resolveOwnerId(req);
    const helperName = await resolveHelperName(req);

    const transactionDoc = {
      user_id: ownerId,
      amount: Number(amount) || 0,
      type,
      category,
      payment_method,
      raw_text: raw_text || '',
      notes: notes ? `${notes} ${product_name || ''}`.trim() : (product_name || ''),
      logged_by_role: req.user.role,
      logged_by_name: helperName,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await collections.transactions().insertOne(transactionDoc);
    const insertedTransaction = { ...transactionDoc, _id: result.insertedId };

    if (product_name && type === 'income') {
      const product = await collections.products().findOne({
        user_id: ownerId,
        product_name: new RegExp(`^${escapeRegex(product_name)}$`, 'i'),
      });

      if (product) {
        await collections.products().updateOne(
          { _id: product._id },
          { $inc: { current_stock: -1 }, $set: { updated_at: new Date() } }
        );
      }
    }

    res.json(toTransactionPayload(insertedTransaction));
  } catch (error) {
    console.error('Insert Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/transactions/today
router.get('/today', async (req, res) => {
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
      .sort({ created_at: -1 })
      .toArray();

    res.json(data.map(toTransactionPayload));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/transactions/week
router.get('/week', async (req, res) => {
  try {
    const ownerId = await resolveOwnerId(req);

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const data = await collections.transactions()
      .find({
        user_id: ownerId,
        created_at: { $gte: sevenDaysAgo },
      })
      .toArray();

    const daysMap = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      daysMap[dStr] = { date: dStr, income: 0, expenses: 0, net: 0 };
    }

    data.forEach((t) => {
      const localDate = new Date(t.created_at);
      const key = new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

      if (!daysMap[key]) return;

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
      .toArray();

    let totalSales = 0;
    let totalExpense = 0;
    let cash = 0;
    let upi = 0;
    let udhari = 0;

    data.forEach((t) => {
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
