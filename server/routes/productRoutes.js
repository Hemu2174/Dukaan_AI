const express = require('express');
const router = express.Router();
const { collections, ObjectId } = require('../utils/mongoClient');
const { generateReorderAlert } = require('../services/aiService');

// Helper to resolve ownerId
async function resolveOwnerId(req) {
  let ownerId = req.user.user_id;
  if (req.user.role === 'helper') {
    const { data: helper } = await supabase
      .from('helpers')
      .select('owner_user_id')
      .eq('id', req.user.user_id)
      .single();
    if (helper) ownerId = helper.owner_user_id;
  }
  return ownerId;
}

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const ownerId = await resolveOwnerId(req);
    const { data, error } = await supabase
      .from('products')
      .select('*, distributors(distributor_name, mobile_number)')
      .eq('user_id', ownerId);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products
router.post('/', async (req, res) => {
  try {
    const ownerId = await resolveOwnerId(req);
    const { product_name, current_stock, unit, avg_daily_sales, reorder_threshold_days, distributor_id } = req.body;

    if (!product_name) return res.status(400).json({ error: 'product_name is required' });

    const payload = {
      user_id: ownerId,
      product_name,
      current_stock: current_stock || 0,
      unit: unit || 'packets',
      avg_daily_sales: avg_daily_sales || 0, // Fallback if dynamically calculating later
      reorder_threshold_days: reorder_threshold_days || 2,
    };

    if (distributor_id) payload.distributor_id = distributor_id;

    const { data, error } = await supabase
      .from('products')
      .insert(payload)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/reorder-alerts
router.get('/reorder-alerts', async (req, res) => {
  try {
    const ownerId = await resolveOwnerId(req);

    // 1. Fetch products and left join distributors
    const { data: products, error } = await supabase
      .from('products')
      .select('*, distributors(id, distributor_name, mobile_number)')
      .eq('user_id', ownerId);

    if (error) {
        // Fallback for demo if products table doesn't exist
        console.error(error);
        return res.json([]);
    }

    const alerts = [];

    // 2. Iterate and evaluate stock
    for (const p of products) {
        // Core formula: days_remaining = current_stock / avg_daily_sales
        const avg = Number(p.avg_daily_sales) || 0;
        const stock = Number(p.current_stock) || 0;
        const threshold = Number(p.reorder_threshold_days) || 2;

        if (avg > 0) {
            const daysRemaining = Math.floor(stock / avg);

            // Trigger conditional push logic
            if (daysRemaining <= threshold) {
                // Generate groq telugu alert message
                const teluguAlert = await generateReorderAlert(p.product_name, daysRemaining);

                alerts.push({
                    id: p.id,
                    product_name: p.product_name,
                    days_remaining: daysRemaining,
                    distributor_name: p.distributors ? p.distributors.distributor_name : 'No Distributor Assigned',
                    phone: p.distributors ? p.distributors.mobile_number : null,
                    alert_message: teluguAlert
                });
            }
        } else if (stock <= 0) {
            // Out of stock explicitly, regardless of avg
            const teluguAlert = await generateReorderAlert(p.product_name, 0);
            alerts.push({
                id: p.id,
                product_name: p.product_name,
                days_remaining: 0,
                distributor_name: p.distributors ? p.distributors.distributor_name : 'No Distributor',
                phone: p.distributors ? p.distributors.mobile_number : null,
                alert_message: teluguAlert
            });
        }
    }

    res.json(alerts);
  } catch (err) {
    console.error("Reorder alert err:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
