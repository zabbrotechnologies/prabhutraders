import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useCartStore from '../store/cartStore.js';
import useAuthStore from '../store/authStore.js';
import useWishlistStore from '../store/wishlistStore.js';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { items, openCart } = useCartStore();
  const { user, isAdmin, logout } = useAuthStore();
  const userWishlists = useWishlistStore((s) => s.userWishlists);
  const wishlistItems = userWishlists?.[user?.uid || 'guest'] || [];

  const itemCount = items.reduce((s, i) => s + (i.qty || 1), 0);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { to: '/shop', label: 'Shop All' },
    { to: '/shop?category=slippers', label: 'Slippers' },
    { to: '/shop?category=sandals', label: 'Sandals' },
    { to: '/shop?category=belts', label: 'Belts' },
    { to: '/shop?category=wallets', label: 'Wallets' },
  ];

  const isActive = (to) => location.pathname + location.search === to;

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="w-full bg-primary text-white text-center py-2 px-3 overflow-hidden">
        <p className="font-sans text-[11px] sm:text-xs tracking-wider uppercase truncate">
          ✨ 100% Cash on Delivery · Free Pan-India Delivery on Orders above ₹1,999
        </p>
      </div>

      {/* Main Navbar */}
      <nav
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lux border-b border-outline-variant/30'
            : 'bg-white border-b border-outline-variant/30'
        }`}
      >
        <div className="container-max">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* 3-Line Hamburger Menu Button for Mobile */}
            <div className="flex items-center gap-1 md:hidden">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 focus:outline-none"
                aria-label="Open mobile menu"
                id="mobile-menu-toggle"
              >
                <span
                  className={`w-6 h-0.5 bg-primary transition-all duration-300 transform ${
                    mobileOpen ? 'rotate-45 translate-y-2' : ''
                  }`}
                />
                <span
                  className={`w-6 h-0.5 bg-primary transition-all duration-300 ${
                    mobileOpen ? 'opacity-0' : ''
                  }`}
                />
                <span
                  className={`w-6 h-0.5 bg-primary transition-all duration-300 transform ${
                    mobileOpen ? '-rotate-45 -translate-y-2' : ''
                  }`}
                />
              </button>

              {/* Mobile search trigger */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-10 h-10 flex items-center justify-center text-primary"
                aria-label="Search"
              >
                <span className="material-symbols-outlined text-[22px]">search</span>
              </button>
            </div>

            {/* Brand Logo */}
            <Link
              to="/"
              className="font-display text-lg sm:text-xl md:text-2xl tracking-[0.15em] text-primary font-bold hover:text-secondary transition-colors text-center"
            >
              PRABHU TRADERS
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8 h-full">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`font-sans text-button-text uppercase tracking-wider h-full flex items-center border-b-2 transition-all duration-200 text-xs lg:text-sm ${
                    isActive(link.to)
                      ? 'border-secondary text-secondary font-semibold'
                      : 'border-transparent text-on-surface hover:text-secondary hover:border-secondary/50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Desktop Search Icon */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="btn-icon hidden md:flex"
                aria-label="Search"
              >
                <span className="material-symbols-outlined text-[22px]">search</span>
              </button>

              {/* ADMIN VIEW vs CUSTOMER VIEW */}
              {user ? (
                isAdmin ? (
                  /* Admin Direct Access */
                  <div className="relative group hidden sm:block">
                    <Link
                      to="/admin"
                      className="px-3 py-1.5 bg-primary text-white text-[11px] font-sans uppercase tracking-wider font-bold rounded-full flex items-center gap-1 hover:bg-secondary transition-colors shadow-sm"
                    >
                      <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                      <span>Admin Panel</span>
                    </Link>
                    <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-outline-variant/40 shadow-lux-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 rounded-2xl overflow-hidden p-1.5">
                      <div className="px-3 py-2 border-b border-outline-variant/20 bg-surface-container-low rounded-xl mb-1">
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Logged In Administrator</p>
                        <p className="text-xs font-bold text-primary truncate">{user.email}</p>
                      </div>
                      <Link to="/admin" className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-primary hover:bg-surface-container-low rounded-xl transition-colors">
                        <span className="material-symbols-outlined text-base">dashboard</span>
                        <span>Dashboard</span>
                      </Link>
                      <Link to="/admin/orders" className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-primary hover:bg-surface-container-low rounded-xl transition-colors">
                        <span className="material-symbols-outlined text-base">shopping_bag</span>
                        <span>Manage All Orders</span>
                      </Link>
                      <Link to="/admin/products" className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-primary hover:bg-surface-container-low rounded-xl transition-colors">
                        <span className="material-symbols-outlined text-base">inventory_2</span>
                        <span>Manage Products</span>
                      </Link>
                      <Link to="/admin/customers" className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-primary hover:bg-surface-container-low rounded-xl transition-colors">
                        <span className="material-symbols-outlined text-base">group</span>
                        <span>Customers CRM</span>
                      </Link>
                      <hr className="border-outline-variant/20 my-1" />
                      <button
                        onClick={logout}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs text-error font-bold hover:bg-error-container/40 rounded-xl transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">logout</span>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Customer Account Menu */
                  <div className="relative group hidden sm:block">
                    <Link to="/account" className="btn-icon" aria-label="Account">
                      <span className="material-symbols-outlined text-[22px]">person</span>
                    </Link>
                    <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-outline-variant/40 shadow-lux-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 rounded-2xl overflow-hidden p-1.5">
                      <Link to="/account" className="block px-3 py-2 text-xs font-bold text-primary hover:bg-surface-container-low rounded-xl transition-colors">
                        My Account
                      </Link>
                      <Link to="/account?tab=orders" className="block px-3 py-2 text-xs text-on-surface hover:bg-surface-container-low rounded-xl transition-colors">
                        My Orders
                      </Link>
                      <Link to="/account?tab=wishlist" className="block px-3 py-2 text-xs text-on-surface hover:bg-surface-container-low rounded-xl transition-colors">
                        Saved Wishlist ({wishlistItems.length})
                      </Link>
                      <hr className="border-outline-variant/20 my-1" />
                      <button
                        onClick={logout}
                        className="block w-full text-left px-3 py-2 text-xs text-error font-bold hover:bg-error-container/40 rounded-xl transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <Link to="/login" className="btn-icon hidden sm:flex" aria-label="Login">
                  <span className="material-symbols-outlined text-[22px]">person</span>
                </Link>
              )}

              {/* Wishlist Icon (Only for regular customers/guests) */}
              {!isAdmin && (
                <Link to="/account?tab=wishlist" className="btn-icon hidden sm:flex relative" aria-label="Wishlist">
                  <span className="material-symbols-outlined text-[22px]">favorite_border</span>
                  {wishlistItems.length > 0 && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-secondary text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>
              )}

              {/* Shopping Cart Button with Badge */}
              <button
                onClick={openCart}
                className="w-10 h-10 flex items-center justify-center relative text-primary hover:text-secondary transition-colors"
                aria-label="Open cart"
                id="nav-cart-btn"
              >
                <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
                {itemCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-secondary text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm animate-pulse">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile / Desktop Search Bar */}
        {searchOpen && (
          <div className="border-t border-outline-variant/30 bg-surface-container-lowest px-4 py-3 shadow-inner">
            <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-xl mx-auto w-full">
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search slippers, sandals, belts..."
                className="flex-1 input-hairline text-sm py-2 px-3 focus:outline-none"
              />
              <button type="submit" className="btn-primary py-0 px-4 h-9 text-xs flex-shrink-0">
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:text-primary flex-shrink-0"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </form>
          </div>
        )}
      </nav>

      {/* Mobile Drawer (Left Slide-Over) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-[85%] max-w-xs bg-white h-full flex flex-col shadow-2xl z-10 animate-slide-in overflow-y-auto">
            {/* Header */}
            <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low">
              <div>
                <span className="font-display text-base font-bold tracking-widest text-primary block">
                  PRABHU TRADERS
                </span>
                <span className="font-sans text-[10px] uppercase tracking-wider text-on-surface-variant block">
                  MAXYWALK Leather
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Navigation Links */}
            <div className="py-4 px-3 flex-1 space-y-1">
              {isAdmin ? (
                /* Admin Nav in Mobile Drawer */
                <>
                  <div className="px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-widest text-secondary">
                    Admin Tools
                  </div>
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 font-sans text-xs uppercase tracking-wider font-bold text-primary hover:bg-surface-container-low rounded-xl"
                  >
                    <span className="material-symbols-outlined text-lg text-secondary">dashboard</span>
                    <span>Admin Dashboard</span>
                  </Link>
                  <Link
                    to="/admin/orders"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 font-sans text-xs uppercase tracking-wider font-bold text-primary hover:bg-surface-container-low rounded-xl"
                  >
                    <span className="material-symbols-outlined text-lg text-secondary">shopping_bag</span>
                    <span>Customer Orders</span>
                  </Link>
                  <Link
                    to="/admin/products"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 font-sans text-xs uppercase tracking-wider font-bold text-primary hover:bg-surface-container-low rounded-xl"
                  >
                    <span className="material-symbols-outlined text-lg text-secondary">inventory_2</span>
                    <span>Products Inventory</span>
                  </Link>
                  <Link
                    to="/admin/customers"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 font-sans text-xs uppercase tracking-wider font-bold text-primary hover:bg-surface-container-low rounded-xl"
                  >
                    <span className="material-symbols-outlined text-lg text-secondary">group</span>
                    <span>Customers CRM</span>
                  </Link>
                  <hr className="border-outline-variant/20 my-2" />
                </>
              ) : null}

              <div className="px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Product Categories
              </div>
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 font-sans text-xs tracking-wider uppercase transition-colors rounded-xl ${
                    isActive(link.to)
                      ? 'bg-secondary/10 text-secondary font-bold border-l-4 border-secondary'
                      : 'text-primary hover:bg-surface-container-low'
                  }`}
                >
                  <span>{link.label}</span>
                  <span className="material-symbols-outlined text-sm text-outline-variant">chevron_right</span>
                </Link>
              ))}

              {!isAdmin && (
                <>
                  <div className="pt-3 px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Customer Care
                  </div>
                  <a
                    href="https://wa.me/919444743465?text=Hi%20Prabhu%20Traders!%20I%20have%20an%20inquiry."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 text-xs text-green-700 font-bold hover:bg-green-50 rounded-xl"
                  >
                    <span className="material-symbols-outlined text-base">chat</span>
                    <span>WhatsApp Orders</span>
                  </a>
                </>
              )}
            </div>

            {/* Account & Footer Action in Drawer */}
            <div className="p-4 border-t border-outline-variant/30 bg-surface-container-low space-y-2">
              {user ? (
                <>
                  <div className="text-[11px] text-on-surface-variant truncate">
                    {isAdmin ? 'Admin Mode: ' : 'User: '} <strong className="text-primary">{user.email}</strong>
                  </div>
                  {isAdmin ? (
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="btn-primary w-full justify-center text-xs h-10 bg-secondary"
                    >
                      Go to Admin Panel
                    </Link>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to="/account"
                        onClick={() => setMobileOpen(false)}
                        className="btn-secondary py-0 h-10 text-xs justify-center"
                      >
                        My Account
                      </Link>
                      <Link
                        to="/account?tab=orders"
                        onClick={() => setMobileOpen(false)}
                        className="btn-primary py-0 h-10 text-xs justify-center"
                      >
                        Orders
                      </Link>
                    </div>
                  )}
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="w-full text-center py-1.5 text-xs text-error font-bold"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="btn-primary w-full justify-center text-xs h-11"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="btn-secondary w-full justify-center text-xs h-11"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
