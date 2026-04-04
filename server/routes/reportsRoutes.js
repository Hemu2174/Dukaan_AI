const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { generateSummary } = require('../services/aiService');

// GET /api/reports/daily-summary
router.get('/daily-summary', async (req, res) => {
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

    let income = 0;
    let expense = 0;
    let cash_total = 0;
    let upi_total = 0;
    let udhari_total = 0;

    transactions.forEach(t => {
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

    if (transactions.length < 3) {
      return res.json({
        income,
        expense,
        profit,
        cash_total,
        upi_total,
        udhari_total,
        summary_text: "కొన్ని ట్రాన్సాక్షన్లు నమోదు చేయండి. అప్పుడు పూర్తి సారాంశం వస్తుంది."
      });
    }

    const metrics = { income, expense, profit, cash_total, upi_total, udhari_total };
    let summaryText = await generateSummary(metrics);

    const extractedNumbers = summaryText.match(/\d+(?:\.\d+)?/g) || [];
    
    const baseRequired = [income, expense, profit];
    let isHallucinated = false;
    
    for (const val of baseRequired) {
      if (val === 0) continue;
      const hasMatched = extractedNumbers.some(numStr => {
        const num = parseFloat(numStr);
        const diff = Math.abs(num - val);
        return (diff / val) <= 0.01;
      });

      if (!hasMatched) {
        isHallucinated = true;
        break;
      }
    }

    let finalSummary = summaryText;
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
      summary_text: finalSummary
    });
  } catch (error) {
    console.error("Summary error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
