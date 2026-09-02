import { useState, useEffect, useCallback } from 'react';
import AdminLayout from './Layout.jsx';
import { getAllOrders, updateOrderStatus } from '../../lib/api.js';
import { formatPrice, formatDate, getStatusColor } from '../../lib/utils.js';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['placed', 'confirmed', 'crafting', 'dispatched', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [updating, setUpdating] = useState(null);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    getAllOrders({ limit: 100 })
      .then((d) => setOrders(d.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.title = 'Customer Orders | Admin – Prabhu Traders';
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId, docId, newStatus) => {
    setUpdating(docId);
    try {
      await updateOrderStatus(docId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === docId ? { ...o, status: newStatus } : o)));
      toast.success(`Order ${orderId} status set to: ${newStatus}`);
    } catch {
      toast.error('Failed to update status.');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      o.orderId?.toLowerCase().includes(q) ||
      o.userEmail?.toLowerCase().includes(q) ||
      o.userName?.toLowerCase().includes(q) ||
      o.shippingAddress?.fullName?.toLowerCase().includes(q) ||
      o.shippingAddress?.phone?.includes(q);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-primary font-bold">Customer Orders</h1>
          <p className="text-on-surface-variant text-xs sm:text-sm mt-1">{orders.length} total live orders in database</p>
        </div>
        <button
          onClick={fetchOrders}
          className="btn-secondary text-xs h-10 px-4 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">refresh</span>
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-outline-variant/40 shadow-lux p-4 sm:p-5 mb-6 rounded-2xl flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, name, phone, email..."
            className="w-full input-hairline py-2 pl-9 pr-4 text-xs"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto pb-1">
          <span className="text-[10px] font-sans uppercase tracking-wider text-on-surface-variant font-bold">Status:</span>
          {['all', ...STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-[11px] font-sans uppercase tracking-wider rounded-full transition-colors ${
                statusFilter === s ? 'bg-primary text-white font-bold' : 'border border-outline-variant/60 text-on-surface hover:border-primary'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Container */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 space-y-3 bg-white rounded-2xl border border-outline-variant/30">{[1, 2, 3].map((i) => <div key={i} className="h-20 skeleton" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant bg-white rounded-2xl border border-outline-variant/30">
            <span className="material-symbols-outlined text-4xl block mb-2 text-outline">inbox</span>
            <p className="text-sm font-bold text-primary">No orders match your filter.</p>
          </div>
        ) : (
          filtered.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-outline-variant/40 rounded-2xl shadow-lux overflow-hidden transition-all duration-200"
            >
              {/* Order Card Summary Row */}
              <div
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer hover:bg-surface-container-low/40"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-container flex items-center justify-center rounded-xl text-primary font-bold">
                    <span className="material-symbols-outlined text-xl text-secondary">shopping_bag</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-primary">{order.orderId}</span>
                      <span className={`px-2 py-0.5 text-[9px] font-sans uppercase tracking-wider font-bold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {order.shippingAddress?.fullName || order.userName || 'Customer'} · {order.shippingAddress?.phone || 'No phone'} · {formatDate(order.createdAt?.toDate?.() || order.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-0 border-outline-variant/20">
                  <div className="text-left sm:text-right">
                    <span className="font-bold text-sm sm:text-base text-primary block">{formatPrice(order.total)}</span>
                    <span className="text-[10px] text-green-700 font-bold uppercase tracking-wider">COD</span>
                  </div>
                  <button className="text-secondary flex items-center gap-0.5 text-xs font-bold">
                    <span>{expandedId === order.id ? 'Close' : 'Manage'}</span>
                    <span className="material-symbols-outlined text-base">{expandedId === order.id ? 'expand_less' : 'expand_more'}</span>
                  </button>
                </div>
              </div>

              {/* Expanded Order Fulfillment Details */}
              {expandedId === order.id && (
                <div className="p-4 sm:p-6 bg-surface-container-low border-t border-outline-variant/30 space-y-6">
                  {/* Ordered Products */}
                  <div>
                    <h4 className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-3">
                      Ordered Products ({order.items?.length || 0})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(order.items || []).map((item, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-outline-variant/30">
                          {item.image && <img src={item.image} alt="" className="w-12 h-14 object-cover rounded-lg" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-primary truncate">{item.name}</p>
                            <p className="text-[11px] text-on-surface-variant">Size {item.size || 'Standard'} {item.color ? `· ${item.color}` : ''}</p>
                            <p className="text-xs font-bold text-secondary">{formatPrice(item.price)} × {item.qty}</p>
                          </div>
                          <span className="text-xs font-bold text-primary">{formatPrice(item.price * item.qty)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Contact & Delivery Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-outline-variant/30">
                      <h4 className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2">Customer & Contact</h4>
                      <p className="text-xs font-bold text-primary">{order.shippingAddress?.fullName || order.userName}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">📞 Phone: <a href={`tel:${order.shippingAddress?.phone}`} className="text-secondary font-bold hover:underline">{order.shippingAddress?.phone || 'N/A'}</a></p>
                      <p className="text-xs text-on-surface-variant">✉️ Email: {order.userEmail || 'N/A'}</p>
                      <div className="mt-2 pt-2 border-t border-outline-variant/20 flex gap-2">
                        {order.shippingAddress?.phone && (
                          <a
                            href={`https://wa.me/${order.shippingAddress.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(order.shippingAddress.fullName || '')},%20regarding%20your%20Prabhu%20Traders%20order%20${order.orderId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200 hover:bg-green-100"
                          >
                            <span className="material-symbols-outlined text-sm">chat</span>
                            <span>WhatsApp Customer</span>
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-outline-variant/30">
                      <h4 className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2">Shipping Destination</h4>
                      <p className="text-xs text-on-surface leading-relaxed">
                        {order.shippingAddress?.address}<br />
                        {order.shippingAddress?.city}, {order.shippingAddress?.state} - <strong>{order.shippingAddress?.pincode}</strong>
                      </p>
                      <p className="text-[11px] text-on-surface-variant mt-2">
                        Payment: <strong>Cash on Delivery (COD)</strong>
                      </p>
                    </div>
                  </div>

                  {/* Update Order Status Buttons */}
                  <div>
                    <h4 className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2.5">
                      Update Order Status:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusUpdate(order.orderId, order.id, s)}
                          disabled={order.status === s || updating === order.id}
                          className={`px-3 py-1.5 text-xs font-sans uppercase tracking-wider font-bold rounded-full transition-colors ${
                            order.status === s
                              ? 'bg-primary text-white shadow-md'
                              : 'bg-white border border-outline-variant/60 text-on-surface hover:border-primary disabled:opacity-40'
                          }`}
                        >
                          {updating === order.id && order.status !== s ? 'Updating...' : s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
