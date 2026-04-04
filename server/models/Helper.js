const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const helperSchema = new mongoose.Schema({
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  helper_name: { type: String, required: true },
  pin: { type: String, required: true },
  contact: String,
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Hash PIN before saving
helperSchema.pre('save', async function(next) {
  if (!this.isModified('pin')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.pin = await bcrypt.hash(this.pin, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare PIN
helperSchema.methods.comparePIN = async function(plainPIN) {
  return bcrypt.compare(plainPIN, this.pin);
};

module.exports = mongoose.model('Helper', helperSchema);
