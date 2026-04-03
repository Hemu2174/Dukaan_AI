const express = require('express');
const router = express.Router();
const { supabase } = require('../utils/supabaseClient');
const { generateAlert } = require('../services/aiService');

// POST /api/alerts/weekly
router.post('/weekly', async (req, res) => {
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

    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);

    // 1. Check if today's alert exists
    const { data: existingAlerts, error: fetchErr } = await supabase
      .from('daily_alerts')
      .select('*')
      .eq('user_id', ownerId)
      .gte('created_at', todayObj.toISOString());

    if (fetchErr) {
        // If table doesn't exist yet, we catch it but don't crash
        console.error("Checking existing alerts failed:", fetchErr);
    }

    if (existingAlerts && existingAlerts.length > 0) {
      return res.json({ alert: existingAlerts[existingAlerts.length - 1] }); // return latest if multiple
    }

    // 2. Fetch last 7 days of data
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', ownerId)
      .gte('created_at', sevenDaysAgo.toISOString());

    if (txError) throw txError;

    // Group by Day
    const daysMap = {};
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split("T")[0];
        daysMap[dStr] = { date: dStr, income: 0, expenses: 0, net: 0, udhari: 0 };
    }

    transactions.forEach(t => {
      const localDate = new Date(t.created_at);
      const key = new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000)).toISOString().split("T")[0];
      if (!daysMap[key]) return;

      const amt = Number(t.amount) || 0;
      if (t.type === 'income') {
          daysMap[key].income += amt;
          if (t.payment_method === 'udhari') {
              daysMap[key].udhari += amt;
          }
      }
      if (t.type === 'expense') daysMap[key].expenses += amt;
      daysMap[key].net = daysMap[key].income - daysMap[key].expenses;
    });

    const weekData = Object.values(daysMap).sort((a, b) => a.date.localeCompare(b.date));

    // CHECK CONDITIONS - Only run if at least 3-7 days of data exists (Using 3 to ensure Hackathon Demo doesn't randomly block)
    const activeDays = weekData.filter(d => d.income > 0 || d.expenses > 0).length;
    if (activeDays < 3) {
        return res.json({ skip: true, message: "Not enough days with data to form an anomaly pattern." });
    }

    // 3. Groq Anomaly Detection
    const alertText = await generateAlert(weekData);

    // 4. Store in DB
    const { data: inserted, error: insertErr } = await supabase
        .from('daily_alerts')
        .insert({
            user_id: ownerId,
            alert_text: alertText
        })
        .select();

    if (insertErr) {
        console.error("Warning: Could not save alert to DB:", insertErr);
        // Fallback for demo in case setup.sql was not run: construct a mock DB response
        return res.json({
            alert: {
                id: 'demo-fallback-id',
                user_id: ownerId,
                alert_text: alertText,
                created_at: new Date().toISOString()
            }
        });
    }

    return res.json({ alert: inserted[0] });

  } catch (error) {
    console.error("Alert generation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/alerts
router.get('/', async (req, res) => {
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

        const { data, error } = await supabase
            .from('daily_alerts')
            .select('*')
            .eq('user_id', ownerId)
            .order('created_at', { ascending: false });

        if (error) {
             console.log("No daily_alerts table yet?");
             return res.json([]);
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
