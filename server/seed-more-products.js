import admin, { db } from './firebase-admin.js';

const FULL_CATALOG = [
  // ── SLIPPERS ──
  {
    name: 'MAXYWALK Classic Ortho Arch Slipper',
    description: 'Custom handcrafted full-grain leather slippers featuring cushioned medical-grade arch support and anti-skid TPR sole. Recommended for all-day comfort and foot relief.',
    category: 'slippers',
    price: 1399,
    originalPrice: 1999,
    sizes: ['6', '7', '8', '9', '10', '11', '12'],
    colors: ['Cognac Brown', 'Matte Black', 'Dark Tan'],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCMFcuIlEmOinqex53O1uTOd9tVyWYPSQLQrm79f8hx2_SDW3A9bJ26yPiHsSbdTlHXxgyce-_FVrtMjwFy5EP0GnvX5ip_JuZLB7h3fwc0bwVP4-4G_zwEs9gN4FJyDaQDWlVuNQ4ioWAeEmEvTIOf4X_ok5v7INXpniWrrqTweVWSss_5QYV35113F4ocyduEN5BWZdivdoyC71DQJ2OJHJ1m9sq8BKO346Sp7xK8dfFta2DXtV--',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAgWFFK86T5gmLGWZHLhUaG1cF0-ZMh12kmFHHkKP8zf8Gr0sMBABlXlgWRmZZ8lkT029uBqswFugHrKL8o1QNCxbY2BzztKfqEDQ0Hm8_Vc8uMpo-LOzP6sn4MUjT24AN81n_N26a6t8sUkceHvom18N9yOOF5jEVzx0xsn7olMhAYpZ-gZSegh9zDny7bZQDQCNxtS3svBYjD1E9keYzC2LTtEyz1j4-5Wr36c7vFQq6aGGEEpHpH'
    ],
    stock: 45,
    featured: true,
    material: 'Full-Grain Leather',
    badge: 'Bestseller',
    rating: 4.9,
    reviewCount: 128,
  },
  {
    name: 'Artisan Cross-Strap Leather Slide',
    description: 'Bespoke hand-stitched crossover leather slippers crafted from vegetable-tanned cowhide. Ergonomically shaped footbed that molds to your feet over time.',
    category: 'slippers',
    price: 1199,
    originalPrice: 1699,
    sizes: ['7', '8', '9', '10', '11'],
    colors: ['Saddle Brown', 'Onyx Black', 'Vintage Olive'],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAgWFFK86T5gmLGWZHLhUaG1cF0-ZMh12kmFHHkKP8zf8Gr0sMBABlXlgWRmZZ8lkT029uBqswFugHrKL8o1QNCxbY2BzztKfqEDQ0Hm8_Vc8uMpo-LOzP6sn4MUjT24AN81n_N26a6t8sUkceHvom18N9yOOF5jEVzx0xsn7olMhAYpZ-gZSegh9zDny7bZQDQCNxtS3svBYjD1E9keYzC2LTtEyz1j4-5Wr36c7vFQq6aGGEEpHpH',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCMFcuIlEmOinqex53O1uTOd9tVyWYPSQLQrm79f8hx2_SDW3A9bJ26yPiHsSbdTlHXxgyce-_FVrtMjwFy5EP0GnvX5ip_JuZLB7h3fwc0bwVP4-4G_zwEs9gN4FJyDaQDWlVuNQ4ioWAeEmEvTIOf4X_ok5v7INXpniWrrqTweVWSss_5QYV35113F4ocyduEN5BWZdivdoyC71DQJ2OJHJ1m9sq8BKO346Sp7xK8dfFta2DXtV--'
    ],
    stock: 32,
    featured: false,
    material: 'Vegetable-Tanned Leather',
    badge: 'Trending',
    rating: 4.7,
    reviewCount: 76,
  },
  {
    name: 'Traditional Handcrafted Toe-Ring Chappal',
    description: 'Heritage South Indian inspired genuine leather toe-ring slipper. Double-stitched leather upper with flexible high-density rubber sole.',
    category: 'slippers',
    price: 999,
    originalPrice: 1499,
    sizes: ['6', '7', '8', '9', '10', '11'],
    colors: ['Raw Tan', 'Dark Mahogany'],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCMFcuIlEmOinqex53O1uTOd9tVyWYPSQLQrm79f8hx2_SDW3A9bJ26yPiHsSbdTlHXxgyce-_FVrtMjwFy5EP0GnvX5ip_JuZLB7h3fwc0bwVP4-4G_zwEs9gN4FJyDaQDWlVuNQ4ioWAeEmEvTIOf4X_ok5v7INXpniWrrqTweVWSss_5QYV35113F4ocyduEN5BWZdivdoyC71DQJ2OJHJ1m9sq8BKO346Sp7xK8dfFta2DXtV--'
    ],
    stock: 28,
    featured: true,
    material: 'Full-Grain Leather',
    badge: 'Heritage',
    rating: 4.8,
    reviewCount: 94,
  },
  {
    name: 'Executive Soft Memory Foam Leather Slipper',
    description: 'Ultra-plush leather slipper engineered with dual-density memory foam padding. Perfect for work-from-home and indoor luxury relaxation.',
    category: 'slippers',
    price: 1499,
    originalPrice: 2199,
    sizes: ['7', '8', '9', '10', '11'],
    colors: ['Charcoal Black', 'Chocolate Brown'],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAgWFFK86T5gmLGWZHLhUaG1cF0-ZMh12kmFHHkKP8zf8Gr0sMBABlXlgWRmZZ8lkT029uBqswFugHrKL8o1QNCxbY2BzztKfqEDQ0Hm8_Vc8uMpo-LOzP6sn4MUjT24AN81n_N26a6t8sUkceHvom18N9yOOF5jEVzx0xsn7olMhAYpZ-gZSegh9zDny7bZQDQCNxtS3svBYjD1E9keYzC2LTtEyz1j4-5Wr36c7vFQq6aGGEEpHpH'
    ],
    stock: 20,
    featured: false,
    material: 'Nappa Soft Leather',
    badge: 'Comfort Plus',
    rating: 4.6,
    reviewCount: 42,
  },

  // ── SANDALS ──
  {
    name: 'MAXYWALK Rugged Dual-Buckle Outdoor Sandal',
    description: 'Heavy-duty genuine leather sandals fitted with antique brass adjustable buckles and deep lugged traction sole. Built for rugged daily wear.',
    category: 'sandals',
    price: 1699,
    originalPrice: 2399,
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: ['Dark Brown', 'Desert Tan', 'Matte Black'],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB6nu1sVJmuhxAQ780WR1vB5n2GcenI6W1NEgIRGAtZ764Uk7UFV_qgPyRj4dUUa3_i3cEJzM0FMnQHO1bDZtTNzseokXLTXkHKNUbZ3FHh6-9y5IFlhZ1G32aWG7VkQo8lLYxbgyXU_-lfRXcycfUG1YLiotTERB6_SdATPIZXQwkb5gsWCb01lyDb3FXWWRORbBqQjQUgcWMHX-z_st_7AE1V523NomA9G1imL9bX3nDArBQnGVg'
    ],
    stock: 35,
    featured: true,
    material: 'Genuine Cowhide',
    badge: 'Bestseller',
    rating: 4.8,
    reviewCount: 88,
  },
  {
    name: 'Artisan Woven Fisherman Leather Sandal',
    description: 'Classic closed-toe braided fisherman sandal with breathable cutouts and adjustable heel strap. Hand-stitched with bonded nylon thread for durability.',
    category: 'sandals',
    price: 1899,
    originalPrice: 2699,
    sizes: ['7', '8', '9', '10', '11'],
    colors: ['Cognac Tan', 'Deep Espresso'],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB6nu1sVJmuhxAQ780WR1vB5n2GcenI6W1NEgIRGAtZ764Uk7UFV_qgPyRj4dUUa3_i3cEJzM0FMnQHO1bDZtTNzseokXLTXkHKNUbZ3FHh6-9y5IFlhZ1G32aWG7VkQo8lLYxbgyXU_-lfRXcycfUG1YLiotTERB6_SdATPIZXQwkb5gsWCb01lyDb3FXWWRORbBqQjQUgcWMHX-z_st_7AE1V523NomA9G1imL9bX3nDArBQnGVg'
    ],
    stock: 22,
    featured: false,
    material: 'Full-Grain Leather',
    badge: 'New Arrival',
    rating: 4.7,
    reviewCount: 35,
  },
  {
    name: 'Semi-Formal Backstrap Leather Sandal',
    description: 'Sleek dress sandal with padded inner lining and secure Velcro backstrap closure. Transition seamlessly between ethnic ceremonies and casual evenings.',
    category: 'sandals',
    price: 1499,
    originalPrice: 2099,
    sizes: ['6', '7', '8', '9', '10', '11'],
    colors: ['Jet Black', 'Rich Tan'],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB6nu1sVJmuhxAQ780WR1vB5n2GcenI6W1NEgIRGAtZ764Uk7UFV_qgPyRj4dUUa3_i3cEJzM0FMnQHO1bDZtTNzseokXLTXkHKNUbZ3FHh6-9y5IFlhZ1G32aWG7VkQo8lLYxbgyXU_-lfRXcycfUG1YLiotTERB6_SdATPIZXQwkb5gsWCb01lyDb3FXWWRORbBqQjQUgcWMHX-z_st_7AE1V523NomA9G1imL9bX3nDArBQnGVg'
    ],
    stock: 26,
    featured: false,
    material: 'Genuine Leather',
    badge: 'Popular',
    rating: 4.5,
    reviewCount: 51,
  },

  // ── BELTS ──
  {
    name: 'Reversible Dual-Tone Full-Grain Formal Belt',
    description: 'Handcrafted 35mm wide full-grain leather belt with rotating solid alloy buckle. Reversible Black on one side and Cognac Brown on the other.',
    category: 'belts',
    price: 999,
    originalPrice: 1499,
    sizes: ['30', '32', '34', '36', '38', '40', '42'],
    colors: ['Black & Brown Reversible'],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCkZZLptrzF3_pLJdGwE1D0fzBf9J6BskKwY_creH1fEwQGjpA8E1ZqUMQcf5oG0DPqTdDQOe0jiSWO8xDYWLfLedhMNKW5or3L6QIdT4kNWSpCsGqeM06tYRvuYRe-Y1giC2c_OBy7TTJgqxv_s8CrqRLxmNSIM6YZu8lhceL1wjSjQPg39qPyrz461bIcjc5-OvPVhEnA2eJ7fhvH0yagBHcjNNgrqediDKAK4ax5ilJPk55aRuEG'
    ],
    stock: 60,
    featured: true,
    material: 'Full-Grain Italian Leather',
    badge: '2-in-1 Value',
    rating: 4.9,
    reviewCount: 142,
  },
  {
    name: 'Vintage Distressed Casual Jeans Belt',
    description: '40mm wide heavy-gauge cowhide leather belt with antique copper roller buckle and distressed patina edge treatment.',
    category: 'belts',
    price: 849,
    originalPrice: 1299,
    sizes: ['32', '34', '36', '38', '40'],
    colors: ['Rustic Tan', 'Dark Chestnut'],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCkZZLptrzF3_pLJdGwE1D0fzBf9J6BskKwY_creH1fEwQGjpA8E1ZqUMQcf5oG0DPqTdDQOe0jiSWO8xDYWLfLedhMNKW5or3L6QIdT4kNWSpCsGqeM06tYRvuYRe-Y1giC2c_OBy7TTJgqxv_s8CrqRLxmNSIM6YZu8lhceL1wjSjQPg39qPyrz461bIcjc5-OvPVhEnA2eJ7fhvH0yagBHcjNNgrqediDKAK4ax5ilJPk55aRuEG'
    ],
    stock: 40,
    featured: false,
    material: 'Heavy Cowhide',
    badge: 'Casual',
    rating: 4.6,
    reviewCount: 67,
  },
  {
    name: 'Artisan Braided Woven Leather Belt',
    description: 'Fully hand-braided vegetable-tanned leather belt with no punch holes required — insert the buckle tongue anywhere for a custom micro-fit.',
    category: 'belts',
    price: 1099,
    originalPrice: 1599,
    sizes: ['Free Size (Fits 28–42)'],
    colors: ['Walnut Tan', 'Midnight Black'],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCkZZLptrzF3_pLJdGwE1D0fzBf9J6BskKwY_creH1fEwQGjpA8E1ZqUMQcf5oG0DPqTdDQOe0jiSWO8xDYWLfLedhMNKW5or3L6QIdT4kNWSpCsGqeM06tYRvuYRe-Y1giC2c_OBy7TTJgqxv_s8CrqRLxmNSIM6YZu8lhceL1wjSjQPg39qPyrz461bIcjc5-OvPVhEnA2eJ7fhvH0yagBHcjNNgrqediDKAK4ax5ilJPk55aRuEG'
    ],
    stock: 25,
    featured: false,
    material: 'Vegetable-Tanned Leather',
    badge: 'Artisan',
    rating: 4.8,
    reviewCount: 48,
  },

  // ── WALLETS ──
  {
    name: 'Slim RFID-Blocking Bifold Wallet',
    description: 'Precision handcrafted slim leather wallet featuring 8 card slots, ID window, 2 currency compartments and military-grade RFID protection.',
    category: 'wallets',
    price: 699,
    originalPrice: 1099,
    sizes: ['One Size'],
    colors: ['Cognac Brown', 'Charcoal Black', 'Dark Brown'],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAy9uIBLtM48fYq1AlBrQamS2Dj7jXFNVNX2n814Z51DiV4LuTj-EnP57VbeZkSNwLHeXpomeiGTawYezijQB25UOFsQ4z4E5llsZz_4RLODXSoe-0bpC4GZ8UN0PUA8d29RmafijMqyq25C6Pdca8Od9nyx5o1-57k8n61Bpm2crxPPHHuicw4XKOKeHmOGtyGTPtds5oHpUnohJj3GRBHBU5dHs6JD-782XyvJ6AkrqjGzheuQ10x'
    ],
    stock: 75,
    featured: true,
    material: 'Full-Grain Leather',
    badge: 'Bestseller',
    rating: 4.9,
    reviewCount: 185,
  },
  {
    name: 'Minimalist Front-Pocket Cardholder Wallet',
    description: 'Ultra-compact card case with quick-draw thumb notch, cash strap, and space for 6 cards and folded notes. Slimmest profile for front pockets.',
    category: 'wallets',
    price: 499,
    originalPrice: 799,
    sizes: ['One Size'],
    colors: ['Tan', 'Black', 'Olive Brown'],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAy9uIBLtM48fYq1AlBrQamS2Dj7jXFNVNX2n814Z51DiV4LuTj-EnP57VbeZkSNwLHeXpomeiGTawYezijQB25UOFsQ4z4E5llsZz_4RLODXSoe-0bpC4GZ8UN0PUA8d29RmafijMqyq25C6Pdca8Od9nyx5o1-57k8n61Bpm2crxPPHHuicw4XKOKeHmOGtyGTPtds5oHpUnohJj3GRBHBU5dHs6JD-782XyvJ6AkrqjGzheuQ10x'
    ],
    stock: 50,
    featured: false,
    material: 'Full-Grain Leather',
    badge: 'Minimalist',
    rating: 4.7,
    reviewCount: 92,
  },
  {
    name: 'Hunter Leather Zip-Around Travel Wallet',
    description: 'Full-zip security wallet crafted from hunter vintage leather with dedicated passport slot, SIM card holder, coin pocket, and key leash.',
    category: 'wallets',
    price: 999,
    originalPrice: 1499,
    sizes: ['One Size'],
    colors: ['Vintage Hunter Tan', 'Onyx Black'],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAy9uIBLtM48fYq1AlBrQamS2Dj7jXFNVNX2n814Z51DiV4LuTj-EnP57VbeZkSNwLHeXpomeiGTawYezijQB25UOFsQ4z4E5llsZz_4RLODXSoe-0bpC4GZ8UN0PUA8d29RmafijMqyq25C6Pdca8Od9nyx5o1-57k8n61Bpm2crxPPHHuicw4XKOKeHmOGtyGTPtds5oHpUnohJj3GRBHBU5dHs6JD-782XyvJ6AkrqjGzheuQ10x'
    ],
    stock: 30,
    featured: false,
    material: 'Hunter Oil-Pullup Leather',
    badge: 'Travel Essential',
    rating: 4.8,
    reviewCount: 61,
  }
];

async function seedMoreProducts() {
  if (!db) {
    console.error('Firebase DB is not connected.');
    process.exit(1);
  }

  try {
    console.log(`🚀 Seeding ${FULL_CATALOG.length} products to Firestore...`);

    // Fetch existing names to avoid duplicates
    const existingSnap = await db.collection('products').get();
    const existingNames = new Set(existingSnap.docs.map((d) => d.data().name));

    let addedCount = 0;
    for (const prod of FULL_CATALOG) {
      if (!existingNames.has(prod.name)) {
        await db.collection('products').add({
          ...prod,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`✅ Added: ${prod.name}`);
        addedCount++;
      } else {
        console.log(`ℹ️ Already exists: ${prod.name}`);
      }
    }

    console.log(`🎉 Done! Added ${addedCount} new products. Total catalog is now updated.`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed products:', err);
    process.exit(1);
  }
}

seedMoreProducts();
