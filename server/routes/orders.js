import express from 'express';
import { db } from '../firebase-admin.js';
import { verifyToken, requireAdmin, optionalAuth } from '../middleware/auth.js';
import admin from '../firebase-admin.js';

const router = express.Router();

// GET /api/orders/stats/overview — admin dashboard stats overview
router.get('/stats/overview', verifyToken, requireAdmin, async (req, res) => {
  try {
    if (!db) {
      return res.json({
        totalRevenue: 125800,
        totalOrders: 42,
        activeOrders: 8,
        totalCustomers: 36,
        avgOrderValue: 2995,
      });
    }

    const ordersSnapshot = await db.collection('orders').get();
    const orders = ordersSnapshot.docs.map((doc) => doc.data());

    const totalOrders = orders.length;
    const validOrders = orders.filter((o) => o.status !== 'cancelled');
    const totalRevenue = validOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    const activeOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length;
    const uniqueCustomers = new Set(orders.map((o) => o.userId || o.userEmail)).size;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / (validOrders.length || 1)) : 0;

    res.json({
      totalRevenue,
      totalOrders,
      activeOrders,
      totalCustomers: uniqueCustomers,
      avgOrderValue,
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ error: 'Failed to fetch order statistics' });
  }
});

// POST /api/orders — place a new order (100% Cash on Delivery)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod = 'cod', shippingCost = 0, couponCode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one valid item' });
    }
    if (!shippingAddress || typeof shippingAddress !== 'object') {
      return res.status(400).json({ error: 'Shipping address details are required' });
    }

    const { firstName, lastName, fullName, phone, email, address, city, state, pincode } = shippingAddress;
    const customerName = fullName || `${firstName || ''} ${lastName || ''}`.trim() || 'Customer';
    
    if (!address || !city || !state || !pincode) {
      return res.status(400).json({ error: 'Incomplete shipping address (street, city, state, and pincode required)' });
    }

    let calculatedSubtotal = 0;
    const sanitizedItems = [];

    // Verify item prices & stock against DB
    if (db) {
      for (const item of items) {
        const qty = parseInt(item.qty) || 1;
        if (qty <= 0) {
          return res.status(400).json({ error: 'Item quantity must be a positive number' });
        }

        const productDoc = await db.collection('products').doc(item.productId || item.id).get();
        if (!productDoc.exists) {
          return res.status(400).json({ error: `Product ID ${item.productId || item.id} not found` });
        }

        const productData = productDoc.data();
        const currentStock = productData.stock ?? 10;
        if (currentStock < qty) {
          return res.status(400).json({ error: `Insufficient stock for "${productData.name}". Available: ${currentStock}` });
        }

        const unitPrice = parseFloat(productData.price) || 0;
        calculatedSubtotal += unitPrice * qty;

        sanitizedItems.push({
          productId: productDoc.id,
          name: productData.name,
          price: unitPrice,
          qty,
          size: item.size || item.selectedSize || 'Standard',
          color: item.color || item.selectedColor || '',
          image: item.image || productData.images?.[0] || '',
        });
      }
    } else {
      // Mock / fallback mode
      for (const item of items) {
        const qty = parseInt(item.qty) || 1;
        const unitPrice = parseFloat(item.price) || 0;
        calculatedSubtotal += unitPrice * qty;
        sanitizedItems.push({
          productId: item.productId || item.id || `p-${Math.random()}`,
          name: item.name || 'Leather Item',
          price: unitPrice,
          qty,
          size: item.size || item.selectedSize || 'Standard',
          color: item.color || item.selectedColor || '',
          image: item.image || '',
        });
      }
    }

    const calculatedShippingCost = parseFloat(shippingCost) || (calculatedSubtotal >= 1999 ? 0 : 0);
    const calculatedTotal = calculatedSubtotal + calculatedShippingCost;

    // Generate readable order ID (PT-Timestamp-Code)
    const orderId = `PT-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;

    const orderData = {
      orderId,
      userId: req.user?.uid || 'guest',
      userEmail: req.user?.email || email || '',
      userName: customerName,
      userPhone: phone || '',
      items: sanitizedItems,
      shippingAddress: {
        firstName: firstName || '',
        lastName: lastName || '',
        fullName: customerName,
        phone: phone || '',
        email: email || req.user?.email || '',
        address,
        city,
        state,
        pincode,
      },
      payment: {
        method: 'cod',
        status: 'pending',
      },
      status: 'placed',
      subtotal: calculatedSubtotal,
      shippingCost: calculatedShippingCost,
      total: calculatedTotal,
      couponCode: couponCode || null,
      createdAt: admin.firestore?.FieldValue?.serverTimestamp?.() || new Date(),
      updatedAt: admin.firestore?.FieldValue?.serverTimestamp?.() || new Date(),
    };

    if (db) {
      // Save order and decrement product stock in DB
      const batch = db.batch();
      const orderRef = db.collection('orders').doc();
      batch.set(orderRef, orderData);

      for (const item of sanitizedItems) {
        const pRef = db.collection('products').doc(item.productId);
        batch.update(pRef, {
          stock: admin.firestore.FieldValue.increment(-item.qty),
        });
      }

      await batch.commit();
      console.log(`🛒 New Order created in Firestore with ID: ${orderRef.id} (${orderId}), stock updated`);
      return res.status(201).json({ id: orderRef.id, ...orderData, orderId });
    }

    // Fallback
    res.status(201).json({ id: `mock-${Date.now()}`, ...orderData });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// GET /api/orders — admin get all orders
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    if (!db) return res.json({ orders: [] });

    const { status } = req.query;
    let query = db.collection('orders');

    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.get();
    let orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // In-memory sort by newest first
    orders.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/my — current user's orders
router.get('/my', verifyToken, async (req, res) => {
  try {
    if (!db) return res.json({ orders: [] });

    const snapshot = await db.collection('orders')
      .where('userId', '==', req.user.uid)
      .get();

    let orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    orders.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    res.json({ orders });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id — single order
router.get('/:id', verifyToken, async (req, res) => {
  try {
    if (!db) return res.status(404).json({ error: 'Order not found' });

    const doc = await db.collection('orders').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Order not found' });

    const order = { id: doc.id, ...doc.data() };

    // Only admin or order owner can view
    if (order.userId !== req.user.uid && req.user.role !== 'admin' && req.user.email !== 'admin@prabhu.com') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// PUT /api/orders/:id/status — admin update order status
router.put('/:id/status', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['placed', 'confirmed', 'crafting', 'dispatched', 'delivered', 'cancelled'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    if (!db) return res.json({ message: 'Status updated (mock mode)' });

    const orderRef = db.collection('orders').doc(req.params.id);
    await orderRef.update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ message: 'Order status updated successfully', status });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
