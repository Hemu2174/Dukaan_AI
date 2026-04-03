const express = require('express');
const router = express.Router();
const { supabase } = require('../utils/supabaseClient');
const { generateSummary } = require('../services/aiService');

// POST /api/summary/daily
router.post('/daily', async (req, res) => {
  try {
    let ownerId = req.user.user_id;

    if (req.user.role === 'helper') {
        const { data: helper } = await supabase
          .from('helpers')
          .select('owner_user_id')
          .eq('id', req.user.user_id)
          .single();
        if (helper) ownerId = helper.owner_user_id;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', ownerId)
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString());

    if (error) throw error;

    let income = 0;
    let expenses = 0;
    let cash = 0;
    let upi = 0;
    let udhari = 0;
    
    // For top categories calculation
    const categoryTotals = {};

    transactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') {
        income += amt;
        const method = t.payment_method?.toLowerCase();
        if (method === 'cash') cash += amt;
        if (method === 'upi') upi += amt;
        if (method === 'udhari') udhari += amt;

        // Categorize income
        const cat = t.category || "General";
        categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
      } else if (t.type === 'expense') {
        expenses += amt;
      }
    });

    const net = income - expenses;

    // Build category summary
    const sortedCats = Object.entries(categoryTotals).sort((a,b) => b[1] - a[1]);
    const categories_summary = sortedCats.slice(0, 3).map(c => `${c[0]} (₹${c[1]})`).join(', ');

    // Fallback Rule for < 3 transactions
    if (transactions.length < 3) {
      return res.json({
        summary: "కొన్ని లావాదేవీలు ఇంకా నమోదు చేయండి (Please log a few more transactions for a full summary).",
        metrics: { income, expenses, net, cash, upi, udhari }
      });
    }

    const dataPayload = { income, expenses, net, cash, upi, udhari, categories_summary: categories_summary || "No specific top categories" };
    let summaryText = await generateSummary(dataPayload);

    // AI Safety & Arithmetic Validation
    // Extract numbers to verify if they are completely hallucinated
    // Simple safety rule: check if the exact string forms of income, expenses, net exist.
    const mustInclude = [income.toString(), expenses.toString(), net.toString()];
    let isMismatch = false;
    for (const val of mustInclude) {
        if (!summaryText.includes(val)) {
            isMismatch = true;
            break;
        }
    }

    // Fallback AI failed validation => replace or append correct summary
    if (isMismatch || !summaryText) {
        // Fallback explicit text
        summaryText = `ఈరోజు మొత్తం ఆదాయం ₹${income}, ఖర్చులు ₹${expenses}, లాభం ₹${net}. ` + 
        `నగదు: ₹${cash}, UPI: ₹${upi}, ఉధారి: ₹${udhari}. అత్యధిక అమ్మకాలు: ${dataPayload.categories_summary}. ` +
        `\n\n(AI generated text fell back to exact totals due to mismatch)`;
    }

    res.json({
      summary: summaryText,
      metrics: dataPayload
    });

  } catch (error) {
    console.error("Summary error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
