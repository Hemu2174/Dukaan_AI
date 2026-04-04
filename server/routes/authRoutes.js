const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const User = require('../models/User');
const Helper = require('../models/Helper');

// Owner Signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name required' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    user = new User({ email, password, name });
    await user.save();

    const token = generateToken({ id: user._id }, 'owner');
    
    res.json({
      user: { id: user._id, email: user.email, name: user.name },
      token,
      role: 'owner'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Owner Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({ id: user._id }, 'owner');
    
    res.json({
      user: { id: user._id, email: user.email, name: user.name },
      token,
      role: 'owner'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Helper Login
router.post('/helper-login', async (req, res) => {
  try {
    const { owner_user_id, pin } = req.body;
    
    if (!owner_user_id || !pin) {
      return res.status(400).json({ error: 'Owner ID and PIN required' });
    }

    const helper = await Helper.findOne({ 
      owner_id: owner_user_id, 
      is_active: true 
    });

    if (!helper) {
      return res.status(401).json({ error: 'Invalid helper credentials' });
    }

    const isMatch = await helper.comparePIN(pin);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid PIN' });
    }

    const token = generateToken({ id: helper._id, owner_id: owner_user_id }, 'helper');
    
    res.json({
      token,
      role: 'helper',
      helper_name: helper.helper_name,
      owner_id: owner_user_id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
