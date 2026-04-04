const express = require('express');
const router = express.Router();
const { collections } = require('../utils/mongoClient');
const { generateSummary } = require('../services/aiService');
const { resolveOwnerId } = require('../utils/authHelpers');
const { getDemoTransactions } = require('../utils/demoTransactions');

// GET /api/reports/daily-summary
router.get('/daily-summary', async (req, res) => {
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
      .project({ amount: 1, type: 1, payment_method: 1 })
      .toArray();

    if (!transactions || transactions.length < 3) {
      transactions = getDemoTransactions(ownerId);
    }

    let income = 0;
    let expense = 0;
    let cash_total = 0;
    let upi_total = 0;
    let udhari_total = 0;

    transactions.forEach((t) => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') {
        income += amt;
        const method = t.payment_method?.toLowerCase();
        if (method === 'cash') cash_total += amt;
        if (method === 'upi') upi_total += amt;
        if (method === 'udhari') udhari_total += amt;
      } else if (t.type === 'expense') {
        expense += amt;
      }
    });

    const profit = income - expense;

    const metrics = { income, expense, profit, cash_total, upi_total, udhari_total };
    let summaryText = await generateSummary(metrics);

    const extractedNumbers = summaryText.match(/\d+(?:\.\d+)?/g) || [];
    let isHallucinated = false;
    let finalSummary = summaryText;

    const baseRequired = [income, expense, profit];
    for (const val of baseRequired) {
      if (val === 0) continue;
      const hasMatched = extractedNumbers.some((numStr) => {
        const num = parseFloat(numStr);
        const diff = Math.abs(num - val);
        return (diff / val) <= 0.01;
      });

      if (!hasMatched) {
        isHallucinated = true;
        break;
      }
    }

    if (isHallucinated) {
      finalSummary = summaryText.replace(/\d+(?:\.\d+)?/g, 'X') +
        `\n\n(సరిదిద్దిన లెక్కలు: ఆదాయం ₹${income}, ఖర్చులు ₹${expense}, లాభం ₹${profit})`;
    }

    res.json({
      income,
      expense,
      profit,
      cash_total,
      upi_total,
      udhari_total,
      summary_text: finalSummary,
    });
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
