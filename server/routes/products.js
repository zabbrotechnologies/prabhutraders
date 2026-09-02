import express from 'express';
import { db } from '../firebase-admin.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import admin from '../firebase-admin.js';

const router = express.Router();

// Helper to sanitize product data
const sanitizeProduct = (id, data) => ({
  id,
  name: data.name || '',
  description: data.description || '',
  category: data.category || 'slippers',
  price: data.price || 0,
  originalPrice: data.originalPrice || null,
  sizes: data.sizes || [],
  colors: data.colors || [],
  images: data.images || [],
  stock: data.stock ?? 10,
  featured: data.featured || false,
  material: data.material || 'Genuine Leather',
  badge: data.badge || null,
  rating: data.rating || 4.5,
  reviewCount: data.reviewCount || 0,
  createdAt: data.createdAt?.toDate?.() || new Date(),
});

// GET /api/products — list products with optional filters
router.get('/', async (req, res) => {
  try {
    if (!db) {
      return res.json({ products: getMockProducts(), total: getMockProducts().length });
    }

    let query = db.collection('products');

    const { category, featured, sort, limit = 50, offset = 0 } = req.query;

    if (category && category !== 'all') {
      query = query.where('category', '==', category);
    }
    if (featured === 'true') {
      query = query.where('featured', '==', true);
    }

    const snapshot = await query.get();
    let products = snapshot.docs.map(doc => sanitizeProduct(doc.id, doc.data()));

    // In-memory sorting (avoids Firestore composite index requirements)
    if (sort === 'price_asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      products.sort((a, b) => b.price - a.price);
    } else {
      // Default / newest
      products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json({ products, total: products.length });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:id — single product
router.get('/:id', async (req, res) => {
  try {
    if (!db) {
      const mock = getMockProducts().find(p => p.id === req.params.id);
      if (!mock) return res.status(404).json({ error: 'Product not found' });
      return res.json(mock);
    }

    const doc = await db.collection('products').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Product not found' });

    res.json(sanitizeProduct(doc.id, doc.data()));
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST /api/products — admin create
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, category, price, originalPrice, sizes, colors, images, stock, featured, material, badge } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    if (!db) return res.status(503).json({ error: 'Database not configured' });

    const productData = {
      name, description, category: category || 'slippers',
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      sizes: sizes || [], colors: colors || [], images: images || [],
      stock: parseInt(stock) || 10,
      featured: featured || false,
      material: material || 'Genuine Leather',
      badge: badge || null,
      rating: 0, reviewCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('products').add(productData);
    res.status(201).json({ id: docRef.id, ...productData });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/products/:id — admin update
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: 'Database not configured' });

    const docRef = db.collection('products').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Product not found' });

    const updates = { ...req.body, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    if (updates.price) updates.price = parseFloat(updates.price);
    if (updates.stock) updates.stock = parseInt(updates.stock);

    await docRef.update(updates);
    const updated = await docRef.get();
    res.json(sanitizeProduct(updated.id, updated.data()));
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/products/:id — admin delete
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: 'Database not configured' });

    const docRef = db.collection('products').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Product not found' });

    await docRef.delete();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Mock products for when Firebase is not configured
function getMockProducts() {
  return [
    {
      id: '1', name: 'MAXYWALK Handcrafted Leather Slipper', description: 'Premium full-grain leather comfort slipper with cushioned footbed. Handcrafted in Avadi, Tamil Nadu.',
      category: 'slippers', price: 1299, originalPrice: 1599, sizes: ['6','7','8','9','10','11','12'],
      colors: ['Cognac Brown', 'Tan'], images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAgWFFK86T5gmLGWZHLhUaG1cF0-ZMh12kmFHHkKP8zf8Gr0sMBABlXlgWRmZZ8lkT029uBqswFugHrKL8o1QNCxbY2BzztKfqEDQ0Hm8_Vc8uMpo-LOzP6sn4MUjT24AN81n_N26a6t8sUkceHvom18N9yOOF5jEVzx0xsn7olMhAYpZ-gZSegh9zDny7bZQDQCNxtS3svBYjD1E9keYzC2LTtEyz1j4-5Wr36c7vFQq6aGGEEpHpH', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBn2QTejQy7e7f41YnbQDVsAkSmOunrBxazjZy4zwV5YzhFod6WfGLI8hWFzpq49ukgVqhdM3gEmB9QYzmYFJmtSZs65mJgJUqopNiG6m5BikFlAUudmiksSqX3veNmq2wYy44MJAq74G_A4wGrtLkoTwz4oePaSsRVHTs09w0eCzWWRkKA3wit1606p0a-bIW3sR__2Xa-2fOIaROqAm9FKxGhgCDpw9_AWwcz5WQVNtOsVIbu6Tb5'],
      stock: 50, featured: true, material: 'Full-Grain Leather', badge: 'Best Seller', rating: 4.8, reviewCount: 124, createdAt: new Date(),
    },
    {
      id: '2', name: 'Architectural Leather Mule', description: 'Minimalist leather mule with clean lines and premium construction.',
      category: 'slippers', price: 1450, originalPrice: null, sizes: ['6','7','8','9','10','11','12'],
      colors: ['Onyx Black', 'Deep Brown'], images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuC_yLGLQ099tkL5jm4dDU6qr-rAxVMz8ZNfEcRTYwM5lUlcH7aLr4jIPaHJsIRBS-exn-XhOUDc5J-SfKDGx3vYJMH6OdzvyoYRgd4QXYca9kKKAuKiOogNE6MWbuzOvCDWlSCceShdfBxCygVRvN5KlRoSZ06KjUcZINpz_F6cP6eeDktnoq9Hm33RfyqEpUJFZPtSyLbYQcLTtQ_w11E2QuAKDeLh_4JBUtDCK4sBvaUDkjRLPjRt'],
      stock: 30, featured: true, material: 'Full-Grain Leather', badge: 'New Arrival', rating: 4.6, reviewCount: 48, createdAt: new Date(),
    },
    {
      id: '3', name: 'Essential Leather Slide', description: 'Effortless everyday slide crafted from premium vegetable-tanned leather.',
      category: 'sandals', price: 950, originalPrice: 1199, sizes: ['6','7','8','9','10','11','12'],
      colors: ['Natural Tan', 'Sand'], images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDebZjDoly6yuOycvBlAT5hrMo7diZKMwuOweBUFMahTUcQZVLuNzbMeG0AjDVQ4k2Jp3wjERdoUXDZBolwBconuxWJP3j8Tn4emGBtdDWavXbuda2k6afNX-eOIsogXjH9Kw_2CljnBDLz7RnbLFUk-LUgXJ8MRL4SqBQ-60h0ipzMS9D2JhddQ-k7-YReMaUSTOCqp8Hkt7qpdXIXIBbQ5qG4kQPxbmeSBC_MxwRAWqns9N0AIylA'],
      stock: 45, featured: false, material: 'Vegetable-Tanned Leather', badge: null, rating: 4.5, reviewCount: 67, createdAt: new Date(),
    },
    {
      id: '4', name: 'Gallery Loafer', description: 'Sophisticated leather loafer with hand-burnished finish. A statement piece for discerning tastes.',
      category: 'sandals', price: 1800, originalPrice: null, sizes: ['6','7','8','9','10','11','12'],
      colors: ['Oxblood', 'Midnight Navy'], images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDHDnKPJ-zKPpVC_wnTZaRXqu6tBxh_NNhFTdECkBiZryShcPKk9gTzDyshyX4-GrC_RcYG4vq5coGPJ31wyhG7mQ6CLxufuDQrPVxvnNwKRaoECdLEBNFgwzz2_K8WqkcL03snCPWDsa3QoPsnSphwr_0xZ-O5IVU44bj6e5lvUzHwXP20ntk3rI-MwCqDIj9JkFmr7RBaslBvB3NcpdM_JicE315Y4v2qyYJCR_r6vptZVGso73o4'],
      stock: 20, featured: true, material: 'Hand-Burnished Leather', badge: null, rating: 4.9, reviewCount: 32, createdAt: new Date(),
    },
    {
      id: '5', name: 'Full-Grain Leather Belt', description: 'Thick, structured full-grain leather belt with solid brass buckle. Built to last a lifetime.',
      category: 'belts', price: 699, originalPrice: 899, sizes: ['S','M','L','XL','XXL'],
      colors: ['Rich Brown', 'Classic Black'], images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCkZZLptrzF3_pLJdGwE1D0fzBf9J6BskKwY_creH1fEwQGjpA8E1ZqUMQcf5oG0DPqTdDQOe0jiSWO8xDYWLfLedhMNKW5or3L6QIdT4kNWSpCsGqeM06tYRvuYRe-Y1giC2c_OBy7TTJgqxv_s8CrqRLxmNSIM6YZu8lhceL1wjSjQPg39qPyrz461bIcjc5-OvPVhEnA2eJ7fhvH0yagBHcjNNgrqediDKAK4ax5ilJPk55aRuEG'],
      stock: 100, featured: false, material: 'Full-Grain Leather', badge: null, rating: 4.7, reviewCount: 89, createdAt: new Date(),
    },
    {
      id: '6', name: 'Minimalist Leather Wallet', description: 'Slim bifold wallet with multiple card slots and a clean, modern silhouette.',
      category: 'wallets', price: 549, originalPrice: 699, sizes: ['One Size'],
      colors: ['Matte Black', 'Dark Brown'], images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAy9uIBLtM48fYq1AlBrQamS2Dj7jXFNVNX2n814Z51DiV4LuTj-EnP57VbeZkSNwLHeXpomeiGTawYezijQB25UOFsQ4z4E5llsZz_4RLODXSoe-0bpC4GZ8UN0PUA8d29RmafijMqyq25C6Pdca8Od9nyx5o1-57k8n61Bpm2crxPPHHuicw4XKOKeHmOGtyGTPtds5oHpUnohJj3GRBHBU5dHs6JD-782XyvJ6AkrqjGzheuQ10x'],
      stock: 75, featured: true, material: 'Matte Leather', badge: null, rating: 4.6, reviewCount: 156, createdAt: new Date(),
    },
    {
      id: '7', name: 'MAXYWALK Custom Kolhapuri Slipper', description: 'Traditional Kolhapuri-inspired design with modern MAXYWALK craftsmanship. Customize to your measurements.',
      category: 'slippers', price: 1599, originalPrice: null, sizes: ['6','7','8','9','10','11','12'],
      colors: ['Tan', 'Brown', 'Black'], images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCMFcuIlEmOinqex53O1uTOd9tVyWYPSQLQrm79f8hx2_SDW3A9bJ26yPiHsSbdTlHXxgyce-_FVrtMjwFy5EP0GnvX5ip_JuZLB7h3fwc0bwVP4-4G_zwEs9gN4FJyDaQDWlVuNQ4ioWAeEmEvTIOf4X_ok5v7INXpniWrrqTweVWSss_5QYV35113F4ocyduEN5BWZdivdoyC71DQJ2OJHJ1m9sq8BKO346Sp7xK8dfFta2DXtV--'],
      stock: 25, featured: true, material: 'Handcrafted Leather', badge: 'Custom Made', rating: 5.0, reviewCount: 18, createdAt: new Date(),
    },
    {
      id: '8', name: 'Structured Sandal', description: 'Bold, architectural sandal with thick sole and secure strap system.',
      category: 'sandals', price: 1099, originalPrice: 1299, sizes: ['6','7','8','9','10','11','12'],
      colors: ['Desert Sand', 'Cocoa'], images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuB6nu1sVJmuhxAQ780WR1vB5n2GcenI6W1NEgIRGAtZ764Uk7UFV_qgPyRj4dUUa3_i3cEJzM0FMnQHO1bDZtTNzseokXLTXkHKNUbZ3FHh6-9y5IFlhZ1G32aWG7VkQo8lLYxbgyXU_-lfRXcycfUG1YLiotTERB6_SdATPIZXQwkb5gsWCb01lyDb3FXWWRORbBqQjQUgcWMHX-z_st_7AE1V523NomA9G1imL9bX3nDArBQnGVg'],
      stock: 40, featured: false, material: 'Vegetable-Tanned Leather', badge: null, rating: 4.4, reviewCount: 45, createdAt: new Date(),
    },
  ];
}

export default router;
