const express = require('express');
const router = express.Router();
const { supabase } = require('../utils/supabaseClient');
const { generateSummary } = require('../services/aiService');

// GET /api/reports/daily-summary
router.get('/daily-summary', async (req, res) => {
  try {
    let ownerId = req.user.user_id;

    // Determine owner ID if caller is a helper
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
      .select('amount, type, payment_method')
      .eq('user_id', ownerId)
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString());

    if (error) throw error;

    // Strict Backend Logic
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

    // Fallback Rule
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

    // AI Call
    const metrics = { income, expense, profit, cash_total, upi_total, udhari_total };
    let summaryText = await generateSummary(metrics);

    // Validation (VERY IMPORTANT)
    // Check if AI numbers match backend.
    const expected = { income, expense, profit, cash_total, upi_total, udhari_total };
    
    // We fed explicit string digits. Let's see if 1% mismatch rule triggers.
    // Given the prompt asks to check mismatch > 1%:
    let isHallucinated = false;
    let finalSummary = summaryText;

    // Use a regex to extract all numbers from the text
    const extractedNumbers = summaryText.match(/\d+(?:\.\d+)?/g) || [];
    
    // Just to perfectly abide by "If mismatch > 1%, replace":
    // It's safest to simply append the backend verified sentence entirely and replace the AI's math segment 
    // if any core number isn't perfectly present.
    // (A 1% mismatch logic is explicitly requested)

    const baseRequired = [income, expense, profit];
    for (const val of baseRequired) {
        if (val === 0) continue; // 0 might be omitted or written as word sometimes
        // Is there any extracted number within 1% of val?
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

    if (isHallucinated) {
        // REPLACE numbers by giving a fully overridden summary appended 
        // Or literally string-replacing any numbers (dangerous to telugu text flow).
        // Let's strip all numbers from the AI text (or replace them) and attach the true exact metric sentence!
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
