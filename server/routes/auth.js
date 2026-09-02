import express from 'express';
import { db, auth } from '../firebase-admin.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import admin from '../firebase-admin.js';

const router = express.Router();

// POST /api/auth/verify — verify Firebase token + upsert user in Firestore
router.post('/verify', verifyToken, async (req, res) => {
  try {
    const { uid, email } = req.user;
    const { name, phone } = req.body;

    if (!db) {
      return res.json({ uid, email, role: 'user', name: name || '' });
    }

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // First time login — create user doc
      const newUser = {
        uid,
        email,
        name: name || (email === 'admin@prabhu.com' ? 'Admin' : ''),
        phone: phone || '',
        role: email === 'admin@prabhu.com' ? 'admin' : 'user',
        addresses: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      await userRef.set(newUser);
      return res.json(newUser);
    }

    const userData = userDoc.data();
    let updates = {};

    // Update name/phone if provided
    if (name && !userData.name) {
      updates.name = name;
    }

    // Force admin role for this specific email
    if (email === 'admin@prabhu.com' && userData.role !== 'admin') {
      updates.role = 'admin';
    }

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      await userRef.update(updates);
      Object.assign(userData, updates);
    }

    res.json({ uid, email, ...userData });
  } catch (error) {
    console.error('Auth verify error:', error);
    res.status(500).json({ error: 'Failed to verify user' });
  }
});

// GET /api/auth/profile — get current user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    if (!db) {
      return res.json({ uid: req.user.uid, email: req.user.email, role: 'user' });
    }

    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json({ uid: req.user.uid, ...userDoc.data() });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/auth/profile — update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, phone, addresses } = req.body;

    if (!db) {
      return res.json({ uid: req.user.uid, name, phone });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (addresses !== undefined) updates.addresses = addresses;
    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await db.collection('users').doc(req.user.uid).update(updates);
    const updated = await db.collection('users').doc(req.user.uid).get();
    res.json({ uid: req.user.uid, ...updated.data() });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/auth/customers — admin: list all customers
router.get('/customers', verifyToken, requireAdmin, async (req, res) => {
  try {
    if (!db) return res.json({ customers: [] });

    const snapshot = await db.collection('users').where('role', '==', 'user').get();
    const customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ customers });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

export default router;
