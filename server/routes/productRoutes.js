const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { generateReorderAlert } = require('../services/aiService');

// Helper to resolve userId
async function resolveUserId(req) {
  let user_id = req.user.id;
  if (req.user.role === 'helper') {
    user_id = req.user.owner_id;
  }
  return user_id;
}

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const user_id = await resolveUserId(req);
    const products = await Product.find({ user_id });

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products
router.post('/', async (req, res) => {
  try {
    const user_id = await resolveUserId(req);
    const { product_name, current_stock, quantity, reorder_level, category, price } = req.body;

    if (!product_name) return res.status(400).json({ error: 'product_name is required' });

    const product = await Product.create({
      user_id,
      product_name,
      current_stock: current_stock || quantity || 0,
      quantity: quantity || 0,
      reorder_level: reorder_level || 10,
      category,
      price
    });

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/reorder-alerts
router.get('/reorder-alerts', async (req, res) => {
  try {
    const user_id = await resolveUserId(req);

    const products = await Product.find({ user_id });

    const alerts = [];

    for (const p of products) {
      const stock = Number(p.current_stock) || 0;
      const reorder = Number(p.reorder_level) || 10;

      // Trigger alert if stock <= reorder level
      if (stock <= reorder) {
        const teluguAlert = await generateReorderAlert(p.product_name, stock);

        alerts.push({
          id: p._id,
          product_name: p.product_name,
          current_stock: stock,
          reorder_level: reorder,
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
