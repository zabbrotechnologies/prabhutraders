import { useState, useEffect } from 'react';
import AdminLayout from './Layout.jsx';
import { getAllCustomers, getAllOrders } from '../../lib/api.js';
import { formatPrice, formatDate } from '../../lib/utils.js';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    document.title = 'Customers | Admin – Prabhu Traders';
    Promise.all([getAllCustomers(), getAllOrders({ limit: 500 })])
      .then(([custData, ordersData]) => {
        setCustomers(custData.customers || []);
        setOrders(ordersData.orders || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Merge order stats into customers
  const enrichedCustomers = customers.map((c) => {
    const custEmail = c.email?.toLowerCase().trim();
    const custOrders = orders.filter(
      (o) => (c.uid && o.userId === c.uid) || (custEmail && o.userEmail?.toLowerCase().trim() === custEmail) || (custEmail && o.shippingAddress?.email?.toLowerCase().trim() === custEmail)
    );
    return {
      ...c,
      orderCount: custOrders.length,
      totalSpend: custOrders.reduce((s, o) => s + (o.total || 0), 0),
      lastOrder: custOrders[0]?.createdAt,
    };
  });

  const filtered = enrichedCustomers.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
  });

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl text-primary">Customers</h1>
          <p className="text-on-surface-variant text-sm mt-1">{customers.length} registered customers</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-outline-variant/50 shadow-lux p-5 mb-6">
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full border border-outline-variant py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-outline-variant/50 shadow-lux overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-14 skeleton" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl block mb-3">person_off</span>
            No customers found.
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="grid grid-cols-[2fr_2fr_1fr_1.5fr_1.5fr] gap-2 px-5 py-3 border-b border-outline-variant/30 bg-surface-container-low">
              {['Name', 'Email', 'Orders', 'Total Spend', 'Member Since'].map((h) => (
                <div key={h} className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant">{h}</div>
              ))}
            </div>

            {filtered.map((customer) => (
              <div key={customer.id} className="grid grid-cols-[2fr_2fr_1fr_1.5fr_1.5fr] gap-2 px-5 py-4 border-b border-outline-variant/10 hover:bg-surface-container-low/50 items-center">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-surface-container-high flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-on-surface-variant">
                      {(customer.name || customer.email || '?')[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-primary">{customer.name || '—'}</p>
                    <p className="text-xs text-on-surface-variant">{customer.phone || ''}</p>
                  </div>
                </div>
                <div className="text-sm text-on-surface-variant truncate">{customer.email}</div>
                <div className="text-sm text-primary font-medium">{customer.orderCount}</div>
                <div className="text-sm font-medium text-primary">{formatPrice(customer.totalSpend)}</div>
                <div className="text-xs text-on-surface-variant">{formatDate(customer.createdAt?.toDate?.() || customer.createdAt)}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
