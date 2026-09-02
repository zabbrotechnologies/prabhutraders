/**
 * Format price in Indian Rupees
 */
export const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Truncate text to n chars
 */
export const truncate = (str, n = 60) =>
  str?.length > n ? str.substring(0, n) + '…' : str;

/**
 * Get order status badge color
 */
export const getStatusColor = (status) => {
  const map = {
    placed: 'bg-blue-50 text-blue-700',
    confirmed: 'bg-indigo-50 text-indigo-700',
    crafting: 'bg-amber-50 text-amber-700',
    shipped: 'bg-purple-50 text-purple-700',
    delivered: 'bg-green-50 text-green-700',
    cancelled: 'bg-red-50 text-red-700',
  };
  return map[status] || 'bg-surface-container text-on-surface';
};

/**
 * Order status steps for timeline
 */
export const ORDER_STEPS = ['placed', 'confirmed', 'crafting', 'shipped', 'delivered'];

export const getStepIndex = (status) => ORDER_STEPS.indexOf(status);

/**
 * Indian states list
 */
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli',
  'Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
  'Lakshadweep', 'Puducherry',
];

/**
 * Product categories
 */
export const CATEGORIES = [
  { value: 'all', label: 'All Products' },
  { value: 'slippers', label: 'Slippers & Mules' },
  { value: 'sandals', label: 'Sandals' },
  { value: 'belts', label: 'Belts' },
  { value: 'wallets', label: 'Wallets' },
];

/**
 * Shoe sizes (Indian)
 */
export const SHOE_SIZES = ['6', '7', '8', '9', '10', '11', '12'];
