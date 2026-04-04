const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  alert_text: { type: String, required: true },
  type: { type: String, enum: ['reorder', 'warning', 'info'], default: 'info' },
  product_id: mongoose.Schema.Types.ObjectId,
  is_read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Index for faster queries
alertSchema.index({ user_id: 1, created_at: -1 });

module.exports = mongoose.model('Alert', alertSchema);
