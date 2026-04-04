const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, required: true },
  payment_method: { type: String, enum: ['cash', 'upi', 'udhari'], required: true },
  raw_text: String,
  notes: String,
  product_name: String,
  logged_by_role: { type: String, default: 'owner', enum: ['owner', 'helper'] },
  logged_by_name: String,
  helper_id: mongoose.Schema.Types.ObjectId,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Index for faster queries
transactionSchema.index({ user_id: 1, created_at: -1 });
transactionSchema.index({ user_id: 1, type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
