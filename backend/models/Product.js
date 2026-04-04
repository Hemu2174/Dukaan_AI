const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product_name: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  current_stock: { type: Number, default: 0 },
  reorder_level: { type: Number, default: 10 },
  price: Number,
  category: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Index for faster queries
productSchema.index({ user_id: 1, product_name: 1 });

module.exports = mongoose.model('Product', productSchema);
