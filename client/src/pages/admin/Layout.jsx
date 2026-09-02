import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore.js';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: 'bar_chart' },
  { to: '/admin/products', label: 'Products', icon: 'inventory_2' },
  { to: '/admin/orders', label: 'Orders', icon: 'package_2' },
  { to: '/admin/customers', label: 'Customers', icon: 'group' },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userProfile, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
        <Link to="/" className="font-display text-lg tracking-widest text-white">PRABHU TRADERS</Link>
        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white/60 hover:text-white">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="px-4 py-4">
        <span className="px-2 py-0.5 bg-secondary/20 text-secondary font-sans text-[10px] uppercase tracking-widest">Admin Panel</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV.map((item) => {
          const active = item.to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 font-sans text-sm transition-all rounded-none ${
                active
                  ? 'bg-white/10 text-white font-semibold border-l-2 border-secondary'
                  : 'text-white/60 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
              }`}
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <div className="mb-3">
          <p className="text-white text-sm font-medium">{userProfile?.name || 'Admin'}</p>
          <p className="text-white/40 text-xs">Administrator</p>
        </div>
        <Link to="/" className="flex items-center gap-2 text-xs text-white/40 hover:text-white mb-2 transition-colors">
          <span className="material-symbols-outlined text-sm">storefront</span> View Store
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-white/40 hover:text-error transition-colors">
          <span className="material-symbols-outlined text-sm">logout</span> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-surface-container-low overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 flex-shrink-0 bg-primary">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-60 bg-primary flex flex-col shadow-2xl">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-outline-variant/30 flex items-center px-5 gap-4 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-on-surface hover:text-primary">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="font-sans text-button-text text-on-surface-variant uppercase tracking-widest text-xs">
            {NAV.find((n) => n.to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(n.to))?.label || 'Admin'}
          </span>
          <div className="ml-auto flex items-center gap-3">
            <Link to="/shop" target="_blank" className="btn-secondary py-0 h-8 px-4 text-xs">View Store</Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
