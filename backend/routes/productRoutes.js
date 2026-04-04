const express = require('express');
const router = express.Router();
const { collections } = require('../utils/mongoClient');
const { generateReorderAlert } = require('../services/aiService');
const { resolveOwnerId, toObjectId } = require('../utils/authHelpers');

function serializeProduct(doc, distributorDoc) {
  const { _id, distributor_id, ...rest } = doc;
  const payload = { id: _id.toString(), distributor_id, ...rest };

  if (distributorDoc) {
    payload.distributors = {
      id: distributorDoc._id.toString(),
      distributor_name: distributorDoc.distributor_name,
      mobile_number: distributorDoc.mobile_number || distributorDoc.phone || null,
    };
  }

  return payload;
}

async function resolveDistributor(product) {
  if (!product.distributor_id) return null;

  const distributorObjectId = toObjectId(product.distributor_id);
  if (distributorObjectId) {
    return collections.distributors().findOne({ _id: distributorObjectId });
  }

  return collections.distributors().findOne({ id: product.distributor_id });
}

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const ownerId = await resolveOwnerId(req);
    const products = await collections.products().find({ user_id: ownerId }).toArray();

    const serialized = [];
    for (const product of products) {
      serialized.push(serializeProduct(product, await resolveDistributor(product)));
    }

    res.json(serialized);
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
      current_stock: Number(current_stock) || 0,
      unit: unit || 'packets',
      avg_daily_sales: Number(avg_daily_sales) || 0,
      reorder_threshold_days: Number(reorder_threshold_days) || 2,
      created_at: new Date(),
      updated_at: new Date(),
    };

    if (distributor_id) payload.distributor_id = distributor_id;

    const result = await collections.products().insertOne(payload);
    res.json({ id: result.insertedId.toString(), ...payload });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/reorder-alerts
router.get('/reorder-alerts', async (req, res) => {
  try {
    const ownerId = await resolveOwnerId(req);

    const products = await collections.products().find({ user_id: ownerId }).toArray();
    const alerts = [];

    for (const product of products) {
      const distributor = await resolveDistributor(product);
      const avg = Number(product.avg_daily_sales) || 0;
      const stock = Number(product.current_stock) || 0;
      const threshold = Number(product.reorder_threshold_days) || 2;

      if (avg > 0) {
        const daysRemaining = Math.floor(stock / avg);
        if (daysRemaining <= threshold) {
          const teluguAlert = await generateReorderAlert(product.product_name, daysRemaining);
          alerts.push({
            id: product._id.toString(),
            product_name: product.product_name,
            days_remaining: daysRemaining,
            distributor_name: distributor ? distributor.distributor_name : 'No Distributor Assigned',
            phone: distributor ? (distributor.mobile_number || distributor.phone || null) : null,
            alert_message: teluguAlert,
          });
        }
      } else if (stock <= 0) {
        const teluguAlert = await generateReorderAlert(product.product_name, 0);
        alerts.push({
          id: product._id.toString(),
          product_name: product.product_name,
          days_remaining: 0,
          distributor_name: distributor ? distributor.distributor_name : 'No Distributor',
          phone: distributor ? (distributor.mobile_number || distributor.phone || null) : null,
          alert_message: teluguAlert,
        });
      }
    }

    res.json(alerts);
  } catch (err) {
    console.error('Reorder alert err:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
