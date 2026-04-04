const express = require('express');
const router = express.Router();
const { collections, ObjectId } = require('../utils/mongoClient');
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
    
    // Ensure all required fields exist
    if (amount === undefined || !type || !category || !payment_method) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Role-based logging context
    const user_id = req.user.user_id; 
    let ownerId = user_id;
    let helperName = null;

    if (req.user.role === 'helper') {
      const { data: helper } = await supabase
        .from('helpers')
        .select('*')
        .eq('id', user_id)
        .single();
        
      if (helper) {
        ownerId = helper.owner_user_id;
        helperName = helper.helper_name;
      }
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        user_id: ownerId,
        amount,
        type,
        category,
        payment_method,
        raw_text: raw_text || "",
        notes: notes ? `${notes} ${product_name || ''}`.trim() : (product_name || ""),
        logged_by_role: req.user.role,
        logged_by_name: helperName || 'Owner'
      }])
      .select();

    if (error) throw error;

    // STEP 3 - TRACK SALES IMPACT (Module M8)
    if (product_name && type === "income") {
        // Decrease stock by 1 for MVP representation when product name matches
        // Find product by name and owner (simple approach)
        const { data: prods } = await supabase
            .from('products')
            .select('id, current_stock')
            .eq('user_id', ownerId)
            .ilike('product_name', product_name)
            .limit(1);
        
        if (prods && prods.length > 0) {
            const p = prods[0];
            await supabase
                .from('products')
                .update({ current_stock: (Number(p.current_stock) || 0) - 1 })
                .eq('id', p.id);
        }
    }

    res.json(data[0]);
  } catch (error) {
    console.error("Insert Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/transactions/today
router.get('/today', async (req, res) => {
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

    // Get start and end of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', ownerId)
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/transactions/week
router.get('/week', async (req, res) => {
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
    // Move to end of today to capture all of today's records easily
    // Wait, the prompt asked to just use:
    // const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(today.getDate() - 6);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', ownerId)
      .gte('created_at', sevenDaysAgo.toISOString());

    if (error) throw error;

    const daysMap = {};
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const key = d.toISOString().split("T")[0]; // YYYY-MM-DD local logic via UTC if we are careful, but server runs local time
        // Better: d.toLocaleDateString('en-CA') effectively gets YYYY-MM-DD locally, but standard toISOString().split('T')[0] works for demo.
        const dStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split("T")[0]; // Timezone safe
        
        daysMap[dStr] = {
            date: dStr,
            income: 0,
            expenses: 0,
            net: 0
        };
    }

    data.forEach(t => {
      // Supabase created_at is UTC string e.g., 2026-04-03T18:00...
      // Parse local: 
      const localDate = new Date(t.created_at);
      const key = new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000)).toISOString().split("T")[0];
      
      if (!daysMap[key]) return;

      const amt = Number(t.amount) || 0;
      if (t.type === 'income') daysMap[key].income += amt;
      if (t.type === 'expense') daysMap[key].expenses += amt;

      daysMap[key].net = daysMap[key].income - daysMap[key].expenses;
    });

    // Return array, sort chronologically starting from 7 days ago ascending
    const responseArray = Object.values(daysMap).sort((a, b) => a.date.localeCompare(b.date));

    res.json(responseArray);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/transactions/dashboard — live summary for dashboard cards
router.get('/dashboard', async (req, res) => {
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

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', ownerId)
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString());

    if (error) throw error;

    let totalSales = 0;
    let totalExpense = 0;
    let cash = 0;
    let upi = 0;
    let udhari = 0;

    (data || []).forEach(t => {
      const amt = Number(t.amount) || 0;

      if (t.type === 'income') totalSales += amt;
      else totalExpense += amt;

      const delta = t.type === 'income' ? amt : -amt;
      if (t.payment_method === 'cash')   cash   += delta;
      if (t.payment_method === 'upi')    upi    += delta;
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
