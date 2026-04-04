const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const { collections, ObjectId } = require('../utils/mongoClient');

// Owner Signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Use Supabase auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (error) return res.status(400).json({ error: error.message });

    const token = generateToken(data.user, 'owner');
    
    res.json({
      user: data.user,
      session: data.session,
      token,
      role: 'owner'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Owner Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) return res.status(401).json({ error: error.message });

    const token = generateToken(data.user, 'owner');
    
    res.json({
      user: data.user,
      session: data.session,
      token,
      role: 'owner'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper Login
router.post('/helper-login', async (req, res) => {
  try {
    const { owner_user_id, pin } = req.body;
    
    const { data: helper, error } = await supabase
      .from('helpers')
      .select('*')
      .eq('owner_user_id', owner_user_id)
      .eq('is_active', true)
      .single();

    if (error || !helper) {
      return res.status(401).json({ error: 'Invalid helper credentials' });
    }

    const isMatch = await bcrypt.compare(pin, helper.pin_hash);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid pin' });
    }

    const shadowUser = { id: helper.id }; // Helper doesn't have true auth ID, use helper ID
    const token = generateToken(shadowUser, 'helper');
    
    res.json({
      token,
      role: 'helper',
      helper_name: helper.helper_name
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
