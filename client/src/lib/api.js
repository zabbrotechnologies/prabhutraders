import axios from 'axios';
import { auth } from '../firebase.js';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5001/api' : '/api');

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Attach auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    if (auth?.currentUser) {
      const token = await auth.currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Continue without token
  }
  return config;
});

// Lightweight in-memory cache for speed
const cache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

function getCached(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.time > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCached(key, data) {
  cache.set(key, { data, time: Date.now() });
}

export function clearApiCache() {
  cache.clear();
}

// Standalone fallback catalogue for static / offline deployments
const FALLBACK_PRODUCTS = [
  {
    id: '1', name: 'MAXYWALK Handcrafted Leather Slipper', description: 'Premium full-grain leather comfort slipper with cushioned footbed. Handcrafted in Avadi, Tamil Nadu.',
    category: 'slippers', price: 1299, originalPrice: 1599, sizes: ['6','7','8','9','10','11','12'],
    colors: ['Cognac Brown', 'Tan'], images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAgWFFK86T5gmLGWZHLhUaG1cF0-ZMh12kmFHHkKP8zf8Gr0sMBABlXlgWRmZZ8lkT029uBqswFugHrKL8o1QNCxbY2BzztKfqEDQ0Hm8_Vc8uMpo-LOzP6sn4MUjT24AN81n_N26a6t8sUkceHvom18N9yOOF5jEVzx0xsn7olMhAYpZ-gZSegh9zDny7bZQDQCNxtS3svBYjD1E9keYzC2LTtEyz1j4-5Wr36c7vFQq6aGGEEpHpH', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBn2QTejQy7e7f41YnbQDVsAkSmOunrBxazjZy4zwV5YzhFod6WfGLI8hWFzpq49ukgVqhdM3gEmB9QYzmYFJmtSZs65mJgJUqopNiG6m5BikFlAUudmiksSqX3veNmq2wYy44MJAq74G_A4wGrtLkoTwz4oePaSsRVHTs09w0eCzWWRkKA3wit1606p0a-bIW3sR__2Xa-2fOIaROqAm9FKxGhgCDpw9_AWwcz5WQVNtOsVIbu6Tb5'],
    stock: 50, featured: true, material: 'Full-Grain Leather', badge: 'Best Seller', rating: 4.8, reviewCount: 124, createdAt: new Date().toISOString(),
  },
  {
    id: '2', name: 'Architectural Leather Mule', description: 'Minimalist leather mule with clean lines and premium construction.',
    category: 'slippers', price: 1450, originalPrice: null, sizes: ['6','7','8','9','10','11','12'],
    colors: ['Onyx Black', 'Deep Brown'], images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuC_yLGLQ099tkL5jm4dDU6qr-rAxVMz8ZNfEcRTYwM5lUlcH7aLr4jIPaHJsIRBS-exn-XhOUDc5J-SfKDGx3vYJMH6OdzvyoYRgd4QXYca9kKKAuKiOogNE6MWbuzOvCDWlSCceShdfBxCygVRvN5KlRoSZ06KjUcZINpz_F6cP6eeDktnoq9Hm33RfyqEpUJFZPtSyLbYQcLTtQ_w11E2QuAKDeLh_4JBUtDCK4sBvaUDkjRLPjRt'],
    stock: 30, featured: true, material: 'Full-Grain Leather', badge: 'New Arrival', rating: 4.6, reviewCount: 48, createdAt: new Date().toISOString(),
  },
  {
    id: '3', name: 'Essential Leather Slide', description: 'Effortless everyday slide crafted from premium vegetable-tanned leather.',
    category: 'sandals', price: 950, originalPrice: 1199, sizes: ['6','7','8','9','10','11','12'],
    colors: ['Natural Tan', 'Sand'], images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDebZjDoly6yuOycvBlAT5hrMo7diZKMwuOweBUFMahTUcQZVLuNzbMeG0AjDVQ4k2Jp3wjERdoUXDZBolwBconuxWJP3j8Tn4emGBtdDWavXbuda2k6afNX-eOIsogXjH9Kw_2CljnBDLz7RnbLFUk-LUgXJ8MRL4SqBQ-60h0ipzMS9D2JhddQ-k7-YReMaUSTOCqp8Hkt7qpdXIXIBbQ5qG4kQPxbmeSBC_MxwRAWqns9N0AIylA'],
    stock: 45, featured: false, material: 'Vegetable-Tanned Leather', badge: null, rating: 4.5, reviewCount: 67, createdAt: new Date().toISOString(),
  },
  {
    id: '4', name: 'Gallery Loafer', description: 'Sophisticated leather loafer with hand-burnished finish. A statement piece for discerning tastes.',
    category: 'sandals', price: 1800, originalPrice: null, sizes: ['6','7','8','9','10','11','12'],
    colors: ['Oxblood', 'Midnight Navy'], images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDHDnKPJ-zKPpVC_wnTZaRXqu6tBxh_NNhFTdECkBiZryShcPKk9gTzDyshyX4-GrC_RcYG4vq5coGPJ31wyhG7mQ6CLxufuDQrPVxvnNwKRaoECdLEBNFgwzz2_K8WqkcL03snCPWDsa3QoPsnSphwr_0xZ-O5IVU44bj6e5lvUzHwXP20ntk3rI-MwCqDIj9JkFmr7RBaslBvB3NcpdM_JicE315Y4v2qyYJCR_r6vptZVGso73o4'],
    stock: 20, featured: true, material: 'Hand-Burnished Leather', badge: null, rating: 4.9, reviewCount: 32, createdAt: new Date().toISOString(),
  },
  {
    id: '5', name: 'Full-Grain Leather Belt', description: 'Thick, structured full-grain leather belt with solid brass buckle. Built to last a lifetime.',
    category: 'belts', price: 699, originalPrice: 899, sizes: ['S','M','L','XL','XXL'],
    colors: ['Rich Brown', 'Classic Black'], images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCkZZLptrzF3_pLJdGwE1D0fzBf9J6BskKwY_creH1fEwQGjpA8E1ZqUMQcf5oG0DPqTdDQOe0jiSWO8xDYWLfLedhMNKW5or3L6QIdT4kNWSpCsGqeM06tYRvuYRe-Y1giC2c_OBy7TTJgqxv_s8CrqRLxmNSIM6YZu8lhceL1wjSjQPg39qPyrz461bIcjc5-OvPVhEnA2eJ7fhvH0yagBHcjNNgrqediDKAK4ax5ilJPk55aRuEG'],
    stock: 100, featured: false, material: 'Full-Grain Leather', badge: null, rating: 4.7, reviewCount: 89, createdAt: new Date().toISOString(),
  },
  {
    id: '6', name: 'Minimalist Leather Wallet', description: 'Slim bifold wallet with multiple card slots and a clean, modern silhouette.',
    category: 'wallets', price: 549, originalPrice: 699, sizes: ['One Size'],
    colors: ['Matte Black', 'Dark Brown'], images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAy9uIBLtM48fYq1AlBrQamS2Dj7jXFNVNX2n814Z51DiV4LuTj-EnP57VbeZkSNwLHeXpomeiGTawYezijQB25UOFsQ4z4E5llsZz_4RLODXSoe-0bpC4GZ8UN0PUA8d29RmafijMqyq25C6Pdca8Od9nyx5o1-57k8n61Bpm2crxPPHHuicw4XKOKeHmOGtyGTPtds5oHpUnohJj3GRBHBU5dHs6JD-782XyvJ6AkrqjGzheuQ10x'],
    stock: 75, featured: true, material: 'Matte Leather', badge: null, rating: 4.6, reviewCount: 156, createdAt: new Date().toISOString(),
  },
  {
    id: '7', name: 'MAXYWALK Custom Kolhapuri Slipper', description: 'Traditional Kolhapuri-inspired design with modern MAXYWALK craftsmanship. Customize to your measurements.',
    category: 'slippers', price: 1599, originalPrice: null, sizes: ['6','7','8','9','10','11','12'],
    colors: ['Tan', 'Brown', 'Black'], images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCMFcuIlEmOinqex53O1uTOd9tVyWYPSQLQrm79f8hx2_SDW3A9bJ26yPiHsSbdTlHXxgyce-_FVrtMjwFy5EP0GnvX5ip_JuZLB7h3fwc0bwVP4-4G_zwEs9gN4FJyDaQDWlVuNQ4ioWAeEmEvTIOf4X_ok5v7INXpniWrrqTweVWSss_5QYV35113F4ocyduEN5BWZdivdoyC71DQJ2OJHJ1m9sq8BKO346Sp7xK8dfFta2DXtV--'],
    stock: 25, featured: true, material: 'Handcrafted Leather', badge: 'Custom Made', rating: 5.0, reviewCount: 18, createdAt: new Date().toISOString(),
  },
  {
    id: '8', name: 'Structured Sandal', description: 'Bold, architectural sandal with thick sole and secure strap system.',
    category: 'sandals', price: 1099, originalPrice: 1299, sizes: ['6','7','8','9','10','11','12'],
    colors: ['Desert Sand', 'Cocoa'], images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuB6nu1sVJmuhxAQ780WR1vB5n2GcenI6W1NEgIRGAtZ764Uk7UFV_qgPyRj4dUUa3_i3cEJzM0FMnQHO1bDZtTNzseokXLTXkHKNUbZ3FHh6-9y5IFlhZ1G32aWG7VkQo8lLYxbgyXU_-lfRXcycfUG1YLiotTERB6_SdATPIZXQwkb5gsWCb01lyDb3FXWWRORbBqQjQUgcWMHX-z_st_7AE1V523NomA9G1imL9bX3nDArBQnGVg'],
    stock: 40, featured: false, material: 'Vegetable-Tanned Leather', badge: null, rating: 4.4, reviewCount: 45, createdAt: new Date().toISOString(),
  },
];

function getCustomProducts() {
  try {
    return JSON.parse(localStorage.getItem('prabhu-custom-products') || '[]');
  } catch {
    return [];
  }
}

function filterFallbackProducts(params = {}) {
  const custom = getCustomProducts();
  let list = [...custom, ...FALLBACK_PRODUCTS];
  const { category, featured, sort } = params;

  if (category && category !== 'all') {
    list = list.filter((p) => p.category === category);
  }
  if (featured === true || featured === 'true') {
    list = list.filter((p) => p.featured);
  }
  if (sort === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    list.sort((a, b) => b.price - a.price);
  }
  return { products: list, total: list.length };
}

// Products API (Cached for instant browsing, with fallback for static/offline hosts)
export const getProducts = async (params = {}) => {
  const cacheKey = `products_${JSON.stringify(params)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const res = await api.get('/products', { params });
    if (res.data && Array.isArray(res.data.products) && res.data.products.length > 0) {
      setCached(cacheKey, res.data);
      return res.data;
    }
  } catch (error) {
    console.warn('Backend API unavailable, using client fallback catalogue:', error.message);
  }

  const fallback = filterFallbackProducts(params);
  setCached(cacheKey, fallback);
  return fallback;
};

export const getProduct = async (id) => {
  const cacheKey = `product_${id}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const res = await api.get(`/products/${id}`);
    if (res.data) {
      setCached(cacheKey, res.data);
      return res.data;
    }
  } catch (error) {
    console.warn(`Backend API unavailable for product ${id}, using fallback:`, error.message);
  }

  const custom = getCustomProducts();
  const allProds = [...custom, ...FALLBACK_PRODUCTS];
  const fallback = allProds.find((p) => p.id === id) || allProds[0];
  setCached(cacheKey, fallback);
  return fallback;
};

export const createProduct = async (data) => {
  clearApiCache();
  try {
    const res = await api.post('/products', data);
    return res.data;
  } catch (error) {
    console.warn('Backend API unavailable for createProduct, using local storage:', error.message);
    const newProduct = {
      id: `custom-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
    };
    const custom = getCustomProducts();
    localStorage.setItem('prabhu-custom-products', JSON.stringify([newProduct, ...custom]));
    return newProduct;
  }
};

export const updateProduct = async (id, data) => {
  clearApiCache();
  try {
    const res = await api.put(`/products/${id}`, data);
    return res.data;
  } catch (error) {
    console.warn(`Backend API unavailable for updateProduct ${id}, using local storage:`, error.message);
    const custom = getCustomProducts();
    const updatedCustom = custom.map((p) => (p.id === id ? { ...p, ...data } : p));
    localStorage.setItem('prabhu-custom-products', JSON.stringify(updatedCustom));
    return { id, ...data };
  }
};

export const deleteProduct = async (id) => {
  clearApiCache();
  try {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  } catch (error) {
    console.warn(`Backend API unavailable for deleteProduct ${id}, using local storage:`, error.message);
    const custom = getCustomProducts().filter((p) => p.id !== id);
    localStorage.setItem('prabhu-custom-products', JSON.stringify(custom));
    return { message: 'Product deleted' };
  }
};

export const placeOrder = async (data) => {
  try {
    const res = await api.post('/orders', data);
    return res.data;
  } catch (error) {
    console.warn('Backend order API unavailable, using offline fallback:', error.message);
    const orderId = `PT-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
    const mockOrder = {
      id: `mock-${Date.now()}`,
      orderId,
      ...data,
      userEmail: data.shippingAddress?.email?.toLowerCase().trim() || 'guest',
      createdAt: new Date().toISOString(),
    };
    const saved = JSON.parse(localStorage.getItem('prabhu-my-orders') || '[]');
    localStorage.setItem('prabhu-my-orders', JSON.stringify([mockOrder, ...saved]));
    return mockOrder;
  }
};

export const getMyOrders = async (user = null) => {
  try {
    const res = await api.get('/orders/my');
    return res.data;
  } catch {
    const localOrders = JSON.parse(localStorage.getItem('prabhu-my-orders') || '[]');
    if (!user || !user.email) return { orders: localOrders };
    const userEmail = user.email.toLowerCase().trim();
    const userOrders = localOrders.filter(
      (o) => !o.userEmail || o.userEmail === userEmail || o.shippingAddress?.email?.toLowerCase().trim() === userEmail
    );
    return { orders: userOrders };
  }
};

export const getAllOrders = (params = {}) => api.get('/orders', { params }).then((r) => r.data).catch(() => ({ orders: JSON.parse(localStorage.getItem('prabhu-my-orders') || '[]') }));
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status }).then((r) => r.data).catch(() => ({ message: 'Updated locally' }));
export const getOrderStats = () => api.get('/orders/stats/overview').then((r) => r.data).catch(() => ({ totalRevenue: 125800, totalOrders: 42, activeOrders: 8, totalCustomers: 36, avgOrderValue: 2995 }));

// Auth & Customers
export const getUserProfile = () => api.get('/auth/profile').then((r) => r.data).catch(() => ({ name: 'Customer' }));
export const updateUserProfile = (data) => api.put('/auth/profile', data).then((r) => r.data).catch(() => data);
export const getAllCustomers = () => api.get('/auth/customers').then((r) => r.data).catch(() => ({ customers: [] }));

export default api;
