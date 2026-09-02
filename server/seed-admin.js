import admin, { auth, db } from './firebase-admin.js';

async function seedAdmin() {
  if (!auth || !db) {
    console.error('Firebase Admin is not connected.');
    process.exit(1);
  }

  const email = 'admin@prabhu.com';
  const password = 'Admin@12345';
  const displayName = 'Prabhu Admin';

  try {
    let user;
    try {
      user = await auth.getUserByEmail(email);
      console.log(`User ${email} already exists with UID:`, user.uid);
      // Update password
      await auth.updateUser(user.uid, { password, displayName });
      console.log('Password updated to:', password);
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        user = await auth.createUser({
          email,
          password,
          displayName,
        });
        console.log(`Created new admin user with UID:`, user.uid);
      } else {
        throw e;
      }
    }

    // Upsert into Firestore 'users' collection with role: 'admin'
    await db.collection('users').doc(user.uid).set({
      uid: user.uid,
      email: user.email,
      name: displayName,
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log('✅ Admin user successfully configured in Firebase Auth and Firestore!');

    // Also seed sample products if collection is empty
    const productsSnap = await db.collection('products').limit(1).get();
    if (productsSnap.empty) {
      console.log('📦 Seeding initial products...');
      const sampleProducts = [
        {
          name: 'Classic Full-Grain Leather Slippers',
          description: 'Handcrafted genuine leather slippers with ergonomic arch support and anti-skid TPR sole. Tailored for all-day comfort.',
          category: 'slippers',
          price: 1299,
          originalPrice: 1899,
          sizes: ['7', '8', '9', '10', '11'],
          colors: ['Cognac Brown', 'Matte Black', 'Tan'],
          images: [
            'https://lh3.googleusercontent.com/aida-public/AB6AXuCMFcuIlEmOinqex53O1uTOd9tVyWYPSQLQrm79f8hx2_SDW3A9bJ26yPiHsSbdTlHXxgyce-_FVrtMjwFy5EP0GnvX5ip_JuZLB7h3fwc0bwVP4-4G_zwEs9gN4FJyDaQDWlVuNQ4ioWAeEmEvTIOf4X_ok5v7INXpniWrrqTweVWSss_5QYV35113F4ocyduEN5BWZdivdoyC71DQJ2OJHJ1m9sq8BKO346Sp7xK8dfFta2DXtV--',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuAgWFFK86T5gmLGWZHLhUaG1cF0-ZMh12kmFHHkKP8zf8Gr0sMBABlXlgWRmZZ8lkT029uBqswFugHrKL8o1QNCxbY2BzztKfqEDQ0Hm8_Vc8uMpo-LOzP6sn4MUjT24AN81n_N26a6t8sUkceHvom18N9yOOF5jEVzx0xsn7olMhAYpZ-gZSegh9zDny7bZQDQCNxtS3svBYjD1E9keYzC2LTtEyz1j4-5Wr36c7vFQq6aGGEEpHpH'
          ],
          stock: 25,
          featured: true,
          material: 'Full-Grain Leather',
          badge: 'Bestseller',
          rating: 4.8,
          reviewCount: 64,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        {
          name: 'MAXYWALK Handcrafted Casual Sandals',
          description: 'Premium dual-strap leather sandals with brass buckle closure. Built for outdoor comfort and durability.',
          category: 'sandals',
          price: 1599,
          originalPrice: 2199,
          sizes: ['7', '8', '9', '10', '11'],
          colors: ['Dark Brown', 'Black'],
          images: [
            'https://lh3.googleusercontent.com/aida-public/AB6AXuB6nu1sVJmuhxAQ780WR1vB5n2GcenI6W1NEgIRGAtZ764Uk7UFV_qgPyRj4dUUa3_i3cEJzM0FMnQHO1bDZtTNzseokXLTXkHKNUbZ3FHh6-9y5IFlhZ1G32aWG7VkQo8lLYxbgyXU_-lfRXcycfUG1YLiotTERB6_SdATPIZXQwkb5gsWCb01lyDb3FXWWRORbBqQjQUgcWMHX-z_st_7AE1V523NomA9G1imL9bX3nDArBQnGVg'
          ],
          stock: 18,
          featured: true,
          material: 'Genuine Cowhide',
          badge: 'New Arrival',
          rating: 4.6,
          reviewCount: 38,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        {
          name: 'Artisan Full-Grain Leather Formal Belt',
          description: 'Hand-stitched 35mm wide full-grain leather belt featuring a solid brushed nickel buckle. Reversible and tailored to fit.',
          category: 'belts',
          price: 899,
          originalPrice: 1299,
          sizes: ['30', '32', '34', '36', '38', '40'],
          colors: ['Tan', 'Black'],
          images: [
            'https://lh3.googleusercontent.com/aida-public/AB6AXuCkZZLptrzF3_pLJdGwE1D0fzBf9J6BskKwY_creH1fEwQGjpA8E1ZqUMQcf5oG0DPqTdDQOe0jiSWO8xDYWLfLedhMNKW5or3L6QIdT4kNWSpCsGqeM06tYRvuYRe-Y1giC2c_OBy7TTJgqxv_s8CrqRLxmNSIM6YZu8lhceL1wjSjQPg39qPyrz461bIcjc5-OvPVhEnA2eJ7fhvH0yagBHcjNNgrqediDKAK4ax5ilJPk55aRuEG'
          ],
          stock: 40,
          featured: true,
          material: 'Vegetable-Tanned Leather',
          badge: 'Top Choice',
          rating: 4.9,
          reviewCount: 92,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        {
          name: 'Slim Bi-Fold Leather Wallet',
          description: 'Ultra-thin minimalist genuine leather wallet with 8 card slots, RFID protection, and dual currency compartments.',
          category: 'wallets',
          price: 699,
          originalPrice: 999,
          sizes: ['One Size'],
          colors: ['Cognac Brown', 'Charcoal Black'],
          images: [
            'https://lh3.googleusercontent.com/aida-public/AB6AXuAy9uIBLtM48fYq1AlBrQamS2Dj7jXFNVNX2n814Z51DiV4LuTj-EnP57VbeZkSNwLHeXpomeiGTawYezijQB25UOFsQ4z4E5llsZz_4RLODXSoe-0bpC4GZ8UN0PUA8d29RmafijMqyq25C6Pdca8Od9nyx5o1-57k8n61Bpm2crxPPHHuicw4XKOKeHmOGtyGTPtds5oHpUnohJj3GRBHBU5dHs6JD-782XyvJ6AkrqjGzheuQ10x'
          ],
          stock: 50,
          featured: true,
          material: 'Full-Grain Leather',
          badge: 'Popular',
          rating: 4.7,
          reviewCount: 54,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        }
      ];

      for (const prod of sampleProducts) {
        await db.collection('products').add(prod);
      }
      console.log('✅ Sample products seeded!');
    }

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seedAdmin();
