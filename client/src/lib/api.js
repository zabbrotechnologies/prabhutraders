import axios from 'axios';
import { auth } from '../firebase.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

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

// Products API (Cached for instant browsing)
export const getProducts = async (params = {}) => {
  const cacheKey = `products_${JSON.stringify(params)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await api.get('/products', { params });
  setCached(cacheKey, res.data);
  return res.data;
};

export const getProduct = async (id) => {
  const cacheKey = `product_${id}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await api.get(`/products/${id}`);
  setCached(cacheKey, res.data);
  return res.data;
};

export const createProduct = async (data) => {
  clearApiCache();
  const res = await api.post('/products', data);
  return res.data;
};

export const updateProduct = async (id, data) => {
  clearApiCache();
  const res = await api.put(`/products/${id}`, data);
  return res.data;
};

export const deleteProduct = async (id) => {
  clearApiCache();
  const res = await api.delete(`/products/${id}`);
  return res.data;
};

// Orders API
export const placeOrder = (data) => api.post('/orders', data).then((r) => r.data);
export const getMyOrders = () => api.get('/orders/my').then((r) => r.data);
export const getAllOrders = (params = {}) => api.get('/orders', { params }).then((r) => r.data);
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status }).then((r) => r.data);
export const getOrderStats = () => api.get('/orders/stats/overview').then((r) => r.data);

// Auth & Customers
export const getUserProfile = () => api.get('/auth/profile').then((r) => r.data);
export const updateUserProfile = (data) => api.put('/auth/profile', data).then((r) => r.data);
export const getAllCustomers = () => api.get('/auth/customers').then((r) => r.data);

export default api;
