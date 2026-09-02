import { useState, useEffect } from 'react';
import AdminLayout from './Layout.jsx';
import { getOrderStats, getAllOrders } from '../../lib/api.js';
import { formatPrice, formatDate, getStatusColor } from '../../lib/utils.js';

const DATE_FILTERS = ['Today', '7 Days', '30 Days', '1 Year'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('30 Days');

  useEffect(() => {
    document.title = 'Admin Dashboard | Prabhu Traders';
    Promise.all([
      getOrderStats(),
      getAllOrders({ limit: 10 }),
    ]).then(([statsData, ordersData]) => {
      setStats(statsData);
      setRecentOrders(ordersData.orders || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const KPI_CARDS = stats ? [
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: 'currency_rupee', color: 'text-green-600', bg: 'bg-green-50', change: '+12.4%' },
    { label: 'Total Orders', value: stats.totalOrders.toLocaleString('en-IN'), icon: 'package_2', color: 'text-blue-600', bg: 'bg-blue-50', change: '+8.1%' },
    { label: 'Active Orders', value: stats.activeOrders.toLocaleString('en-IN'), icon: 'local_shipping', color: 'text-amber-600', bg: 'bg-amber-50', change: null },
    { label: 'Customers', value: stats.totalCustomers.toLocaleString('en-IN'), icon: 'group', color: 'text-purple-600', bg: 'bg-purple-50', change: '+5.3%' },
    { label: 'Avg. Order Value', value: formatPrice(stats.avgOrderValue), icon: 'trending_up', color: 'text-secondary', bg: 'bg-secondary/10', change: '+2.1%' },
  ] : [];

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl text-primary">Business Overview</h1>
          <p className="text-on-surface-variant text-sm mt-1">Prabhu Traders · MAXYWALK Brand</p>
        </div>
        <div className="flex items-center gap-2">
          {DATE_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setDateFilter(f)}
              className={`px-3 py-1.5 text-xs font-sans uppercase tracking-wider transition-colors ${
                dateFilter === f ? 'bg-primary text-white' : 'bg-white border border-outline-variant text-on-surface hover:border-primary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-gutter mb-8">
          {[1,2,3,4,5].map((i) => <div key={i} className="h-32 skeleton" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-gutter mb-8">
          {KPI_CARDS.map((card) => (
            <div key={card.label} className="bg-white border border-outline-variant/50 shadow-lux p-5 flex flex-col justify-between hover:border-primary/30 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <span className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant">{card.label}</span>
                <div className={`w-9 h-9 ${card.bg} flex items-center justify-center`}>
                  <span className={`material-symbols-outlined text-lg ${card.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{card.icon}</span>
                </div>
              </div>
              <div>
                <div className="font-display text-2xl text-primary mb-1">{card.value}</div>
                {card.change && (
                  <div className="flex items-center gap-1 text-green-600 text-xs">
                    <span className="material-symbols-outlined text-xs">trending_up</span>
                    {card.change} vs last period
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-8">
        <div className="lg:col-span-2 bg-white border border-outline-variant/50 shadow-lux p-6">
          <h3 className="font-display text-xl text-primary mb-4">Sales by Category</h3>
          <div className="space-y-4">
            {[
              { cat: 'Slippers', pct: 52, color: 'bg-secondary' },
              { cat: 'Sandals', pct: 23, color: 'bg-blue-400' },
              { cat: 'Belts', pct: 15, color: 'bg-amber-400' },
              { cat: 'Wallets', pct: 10, color: 'bg-purple-400' },
            ].map((c) => (
              <div key={c.cat}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-primary">{c.cat}</span>
                  <span className="text-on-surface-variant">{c.pct}%</span>
                </div>
                <div className="h-2 bg-surface-container-high">
                  <div className={`h-full ${c.color} transition-all duration-1000`} style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-outline-variant/50 shadow-lux p-6">
          <h3 className="font-display text-xl text-primary mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: 'Add New Product', to: '/admin/products', icon: 'add_box' },
              { label: 'View Pending Orders', to: '/admin/orders', icon: 'pending_actions' },
              { label: 'Customer List', to: '/admin/customers', icon: 'people' },
              { label: 'View Store', to: '/', icon: 'storefront' },
            ].map((a) => (
              <a key={a.label} href={a.to} className="flex items-center gap-3 p-3 hover:bg-surface-container-low transition-colors group">
                <span className="material-symbols-outlined text-secondary group-hover:text-primary transition-colors">{a.icon}</span>
                <span className="text-sm text-on-surface hover:text-primary">{a.label}</span>
                <span className="material-symbols-outlined text-sm text-outline-variant ml-auto">chevron_right</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-outline-variant/50 shadow-lux p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display text-xl text-primary">Recent Orders</h3>
          <a href="/admin/orders" className="text-sm text-secondary hover:underline">View All</a>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl block mb-3">inbox</span>
            No orders yet. Products will appear here when customers start ordering.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/30">
                  {['Order ID', 'Customer', 'Items', 'Status', 'Total', 'Date'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 font-sans text-[10px] uppercase tracking-widest text-on-surface-variant font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low/50">
                    <td className="py-3 px-4 font-medium text-primary">{order.orderId}</td>
                    <td className="py-3 px-4 text-on-surface-variant truncate max-w-[120px]">{order.userEmail}</td>
                    <td className="py-3 px-4 text-on-surface-variant">{order.items?.length || 0}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 text-[10px] font-sans uppercase tracking-wider ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-primary">{formatPrice(order.total)}</td>
                    <td className="py-3 px-4 text-on-surface-variant">{formatDate(order.createdAt?.toDate?.() || order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
