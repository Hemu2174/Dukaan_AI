const express = require('express');
const router = express.Router();
const { collections } = require('../utils/mongoClient');
const { generateSummary } = require('../services/aiService');
const { resolveOwnerId } = require('../utils/authHelpers');
const { getDemoTransactions } = require('../utils/demoTransactions');

// POST /api/summary/daily
router.post('/daily', async (req, res) => {
  try {
    const ownerId = await resolveOwnerId(req);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let transactions = await collections.transactions()
      .find({
        user_id: ownerId,
        created_at: { $gte: today, $lt: tomorrow },
      })
      .toArray();

    if (!transactions || transactions.length < 3) {
      transactions = getDemoTransactions(ownerId);
    }

    let cashIncome = 0;
    let cashExpense = 0;
    let upiIncome = 0;
    let upiExpense = 0;
    let udhariIncome = 0;
    const categoryTotals = {};

    transactions.forEach((t) => {
      const amt = Number(t.amount) || 0;
      const method = t.payment_method?.toLowerCase();

      if (t.type === 'income') {
        if (method === 'cash') cashIncome += amt;
        else if (method === 'upi') upiIncome += amt;
        else if (method === 'udhari') udhariIncome += amt;

        const cat = t.category || 'General';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
      } else if (t.type === 'expense') {
        if (method === 'cash') cashExpense += amt;
        else if (method === 'upi') upiExpense += amt;
      }
    });

    const income = cashIncome + upiIncome + udhariIncome;
    const expenses = cashExpense + upiExpense;
    const net = income - expenses;
    const cashNet = cashIncome - cashExpense;
    const upiNet = upiIncome - upiExpense;

    const sortedCats = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const categories_summary = sortedCats.slice(0, 3).map((c) => `${c[0]} (₹${c[1]})`).join(', ');

    const dataPayload = {
      total_income: income,
      total_expense: expenses,
      cash_balance: cashNet,
      upi_balance: upiNet,
      categories_summary: categories_summary || 'No specific top categories',
    };

    let summaryText = await generateSummary(dataPayload);

    const mustInclude = [income.toString(), expenses.toString(), net.toString()];
    let isMismatch = false;
    for (const val of mustInclude) {
      if (!summaryText.includes(val)) {
        isMismatch = true;
        break;
      }
    }

    if (isMismatch || !summaryText) {
      summaryText = `ఈరోజు మొత్తం ఆదాయం ₹${income}, ఖర్చులు ₹${expenses}, లాభం ₹${net}. ` +
        `నగదు: ₹${cashNet}, UPI: ₹${upiNet}. అత్యధిక అమ్మకాలు: ${dataPayload.categories_summary}. ` +
        '\n\n(AI generated text fell back to exact totals due to mismatch)';
    }

    res.json({ summary: summaryText, metrics: dataPayload });
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
