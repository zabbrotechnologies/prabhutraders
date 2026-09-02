import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';
import useWishlistStore from '../store/wishlistStore.js';
import { getMyOrders, updateUserProfile, getProducts } from '../lib/api.js';
import { formatPrice, formatDate, getStatusColor, ORDER_STEPS } from '../lib/utils.js';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'orders', label: 'My Orders', icon: 'shopping_cart' },
  { id: 'wishlist', label: 'Wishlist', icon: 'favorite' },
  { id: 'addresses', label: 'Addresses', icon: 'location_on' },
  { id: 'profile', label: 'Profile', icon: 'person' },
];

export default function Account() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [orders, setOrders] = useState([]);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, userProfile, setUserProfile, logout } = useAuthStore();
  const userWishlists = useWishlistStore((s) => s.userWishlists);
  const wishlistIds = userWishlists?.[user?.uid || 'guest'] || [];
  const wishlistKey = wishlistIds.join(',');
  const [editName, setEditName] = useState(userProfile?.name || user?.displayName || '');
  const [editPhone, setEditPhone] = useState(userProfile?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => { document.title = 'My Account | PRABHU TRADERS'; }, []);

  useEffect(() => {
    const tab = searchParams.get('tab') || 'overview';
    setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === 'orders' || activeTab === 'overview') {
      setLoading(true);
      getMyOrders().then((d) => setOrders(d.orders || [])).catch(() => setOrders([])).finally(() => setLoading(false));
    }
    if (activeTab === 'wishlist' && wishlistIds.length > 0) {
      getProducts({ limit: 20 }).then((d) => setWishlistProducts((d.products || []).filter((p) => wishlistIds.includes(p.id)))).catch(() => setWishlistProducts([]));
    }
  }, [activeTab, wishlistKey]);

  const handleTabChange = (tab) => { setActiveTab(tab); setSearchParams({ tab }); };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await updateUserProfile({ name: editName, phone: editPhone });
      setUserProfile(updated);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile.'); }
    finally { setSavingProfile(false); }
  };

  const activeOrder = orders.find((o) => !['delivered', 'cancelled'].includes(o.status));

  return (
    <div className="page-enter w-full overflow-hidden">
      <div className="flex max-w-container mx-auto min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-60 flex-shrink-0 border-r border-outline-variant/30 py-8 px-4 sticky top-0 h-screen overflow-y-auto bg-white">
          <div className="mb-6 px-3">
            <div className="w-10 h-10 bg-surface-container-high flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-xl text-secondary">person</span>
            </div>
            <h2 className="font-display text-base font-bold text-primary">My Account</h2>
            <p className="text-xs text-on-surface-variant truncate">{userProfile?.name || user?.email}</p>
          </div>
          <nav className="flex flex-col gap-1 flex-1">
            {NAV_ITEMS.map((item) => (
              <button key={item.id} onClick={() => handleTabChange(item.id)} className={`admin-nav-item text-left text-xs ${activeTab === item.id ? 'active' : ''}`}>
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                <span className="font-sans uppercase tracking-wider">{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="mt-auto pt-4 border-t border-outline-variant/30 px-3">
            <button onClick={logout} className="flex items-center gap-2 text-xs text-error font-medium hover:text-error/80 transition-colors">
              <span className="material-symbols-outlined text-base">logout</span> Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile Top Tabs */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-outline-variant/30 flex z-40 shadow-lg">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} onClick={() => handleTabChange(item.id)} className={`flex-1 flex flex-col items-center py-2.5 gap-1 text-[10px] uppercase font-bold tracking-wider ${activeTab === item.id ? 'text-secondary border-t-2 border-secondary' : 'text-on-surface-variant'}`}>
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: activeTab === item.id ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
              <span className="truncate max-w-[60px]">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-8 py-6 pb-24 md:pb-8 w-full overflow-hidden">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Admin Banner if Admin */}
              {(isAdmin || user?.email?.toLowerCase().includes('admin')) && (
                <div className="bg-primary/10 border border-primary/30 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lux">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-primary">Administrator Account</h3>
                      <p className="text-xs text-on-surface-variant">Manage customer orders, products catalogue, and CRM overview.</p>
                    </div>
                  </div>
                  <Link to="/admin" className="btn-primary text-xs h-11 px-5 w-full sm:w-auto justify-center">
                    Open Admin Portal →
                  </Link>
                </div>
              )}

              <h1 className="font-display text-2xl sm:text-3xl text-primary font-bold">
                Welcome back, {(userProfile?.name || user?.displayName || 'Customer').split(' ')[0]}!
              </h1>

              {/* Stat Cards - 1 by 1 on Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Total Orders', value: orders.length, icon: 'shopping_bag' },
                  { label: 'Active Orders', value: orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length, icon: 'local_shipping', accent: true },
                  { label: 'Wishlist Items', value: wishlistIds.length, icon: 'favorite_border' },
                ].map((s) => (
                  <div key={s.label} className={`border border-outline-variant/40 p-5 flex flex-col justify-between h-32 ${s.accent ? 'bg-surface-container-low border-secondary/40' : 'bg-white'}`}>
                    <span className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">{s.label}</span>
                    <div className="flex items-end justify-between">
                      <span className="font-display text-3xl font-bold text-primary">{s.value}</span>
                      <span className="material-symbols-outlined text-2xl" style={{ color: s.accent ? '#934b19' : '#cfc4c5', fontVariationSettings: s.accent ? "'FILL' 1" : "'FILL' 0" }}>{s.icon}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Active Order Tracker */}
              {activeOrder && (
                <div className="bg-white border border-outline-variant/40 p-4 sm:p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-outline-variant/20">
                    <div>
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">Active Order</span>
                      <span className="font-bold text-primary text-sm">{activeOrder.orderId}</span>
                    </div>
                    <span className="text-sm font-bold text-secondary">{formatPrice(activeOrder.total)}</span>
                  </div>

                  <div className="relative pt-2 pb-2">
                    <div className="flex justify-between relative z-10">
                      {ORDER_STEPS.map((step, i) => {
                        const currentIdx = ORDER_STEPS.indexOf(activeOrder.status);
                        const done = i <= currentIdx;
                        return (
                          <div key={step} className="flex flex-col items-center text-center gap-1 flex-1">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${done ? 'bg-secondary text-white' : 'bg-white border border-outline-variant text-on-surface-variant'}`}>
                              {done && i < currentIdx ? <span className="material-symbols-outlined text-xs">check</span> : i + 1}
                            </div>
                            <span className={`text-[9px] uppercase font-bold tracking-wider ${done ? 'text-primary' : 'text-on-surface-variant/60'}`}>{step}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Orders List */}
              {orders.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-display text-lg font-bold text-primary">Recent Orders</h3>
                    <button onClick={() => handleTabChange('orders')} className="text-xs text-secondary font-bold hover:underline">View All</button>
                  </div>
                  <div className="space-y-2.5">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-outline-variant/30 bg-white gap-2">
                        <div>
                          <p className="text-xs font-bold text-primary">{order.orderId}</p>
                          <p className="text-[11px] text-on-surface-variant">{formatDate(order.createdAt?.toDate?.() || order.createdAt)} · {order.items?.length || 0} item(s)</p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-outline-variant/20">
                          <span className={`px-2 py-0.5 text-[10px] font-sans uppercase tracking-wider font-bold ${getStatusColor(order.status)}`}>{order.status}</span>
                          <span className="font-bold text-xs text-primary">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h1 className="font-display text-2xl font-bold text-primary">My Orders</h1>
              {loading ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 skeleton" />)}</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-white border border-outline-variant/30 p-6">
                  <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">shopping_bag</span>
                  <p className="text-xs text-on-surface-variant mb-4">You haven't placed any orders yet.</p>
                  <Link to="/shop" className="btn-primary text-xs h-11">Browse Footwear</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-outline-variant/30 bg-white p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-xs sm:text-sm text-primary">{order.orderId}</p>
                          <p className="text-[10px] text-on-surface-variant">{formatDate(order.createdAt?.toDate?.() || order.createdAt)}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-sans uppercase tracking-wider font-bold ${getStatusColor(order.status)}`}>{order.status}</span>
                      </div>
                      <div className="space-y-1.5 pt-2 border-t border-outline-variant/20">
                        {(order.items || []).map((item, i) => (
                          <div key={i} className="flex justify-between text-xs">
                            <span className="text-on-surface truncate max-w-[200px]">{item.name} {item.size && `(Size ${item.size})`} × {item.qty}</span>
                            <span className="font-bold text-primary">{formatPrice(item.price * item.qty)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-outline-variant/20">
                        <span className="text-xs text-on-surface-variant uppercase font-bold">Total Paid</span>
                        <span className="font-display text-base font-bold text-primary">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              <h1 className="font-display text-2xl font-bold text-primary">Saved Wishlist</h1>
              {wishlistIds.length === 0 ? (
                <div className="text-center py-16 bg-white border border-outline-variant/30 p-6">
                  <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">favorite_border</span>
                  <p className="text-xs text-on-surface-variant mb-4">No saved items in your wishlist.</p>
                  <Link to="/shop" className="btn-primary text-xs h-11">Explore Catalogue</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wishlistProducts.map((p) => (
                    <Link key={p.id} to={`/product/${p.id}`} className="p-3 bg-white border border-outline-variant/30 flex flex-col gap-2">
                      <div className="aspect-[4/5] bg-surface-container overflow-hidden">
                        <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <p className="font-display text-xs font-bold text-primary truncate">{p.name}</p>
                      <p className="text-xs font-bold text-secondary">{formatPrice(p.price)}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h1 className="font-display text-2xl font-bold text-primary">Personal Profile</h1>
              <form onSubmit={handleSaveProfile} className="max-w-md space-y-4 bg-white p-5 border border-outline-variant/30">
                <div>
                  <label className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-1">Full Name</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="input-hairline text-sm" />
                </div>
                <div>
                  <label className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-1">Email Address</label>
                  <input type="email" value={user?.email || ''} disabled className="input-hairline text-sm opacity-60 cursor-not-allowed" />
                </div>
                <div>
                  <label className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-1">Phone Number (WhatsApp)</label>
                  <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="input-hairline text-sm" placeholder="+91 98765 43210" />
                </div>
                <button type="submit" disabled={savingProfile} className="btn-primary w-full justify-center text-xs h-11 font-bold">
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <h1 className="font-display text-2xl font-bold text-primary">Saved Addresses</h1>
              <div className="bg-white border border-outline-variant/30 p-6 text-center">
                <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">location_on</span>
                <p className="text-xs text-on-surface-variant">Addresses are saved automatically when you place an order.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
