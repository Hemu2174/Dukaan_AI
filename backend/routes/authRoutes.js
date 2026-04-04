const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const { collections, ObjectId } = require('../utils/mongoClient');
const { findOwnerByReference } = require('../utils/authHelpers');

// Owner Signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !password || !name) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }

    const users = collections.users();
    const existingUser = await users.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const storeId = `STORE-${new ObjectId().toString().slice(-8).toUpperCase()}`;

    const result = await users.insertOne({
      name,
      email: normalizedEmail,
      password_hash: passwordHash,
      role: 'owner',
      store_id: storeId,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const user = {
      id: result.insertedId.toString(),
      name,
      email: normalizedEmail,
      role: 'owner',
      store_id: storeId,
    };

    const token = generateToken({ id: user.id }, 'owner');

    res.json({
      user,
      token,
      role: 'owner',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Owner Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const userDoc = await collections.users().findOne({ email: normalizedEmail, role: 'owner' });

    if (!userDoc) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, userDoc.password_hash || '');
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken({ id: userDoc._id.toString() }, 'owner');

    res.json({
      user: {
        id: userDoc._id.toString(),
        name: userDoc.name,
        email: userDoc.email,
        role: 'owner',
        store_id: userDoc.store_id,
      },
      token,
      role: 'owner',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper Login
router.post('/helper-login', async (req, res) => {
  try {
    const { owner_user_id, pin } = req.body;

    if (!owner_user_id || !pin) {
      return res.status(400).json({ error: 'owner_user_id and pin are required' });
    }

    const owner = await findOwnerByReference(owner_user_id);

    if (!owner) {
      return res.status(401).json({ error: 'Invalid helper credentials' });
    }

    const helperDoc = await collections.helpers().findOne({
      owner_user_id: owner._id.toString(),
      is_active: true,
    });

    if (!helperDoc) {
      return res.status(401).json({ error: 'Invalid helper credentials' });
    }

    const isMatch = await bcrypt.compare(pin, helperDoc.pin_hash || '');

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid pin' });
    }

    const token = generateToken({ id: helperDoc._id.toString() }, 'helper');

    res.json({
      token,
      role: 'helper',
      helper_name: helperDoc.helper_name,
      owner_user_id: owner._id.toString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
