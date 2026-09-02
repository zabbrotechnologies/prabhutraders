import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout (Loaded synchronously for instant shell)
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';

// Code-split User Pages (Lazy loaded on demand)
const Home = lazy(() => import('./pages/Home.jsx'));
const Shop = lazy(() => import('./pages/Shop.jsx'));
const ProductDetail = lazy(() => import('./pages/ProductDetail.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const Account = lazy(() => import('./pages/Account.jsx'));

// Code-split Admin Pages (Only downloaded when admin visits)
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard.jsx'));
const AdminProducts = lazy(() => import('./pages/admin/Products.jsx'));
const AdminOrders = lazy(() => import('./pages/admin/Orders.jsx'));
const AdminCustomers = lazy(() => import('./pages/admin/Customers.jsx'));

// Auth Store
import useAuthStore from './store/authStore.js';

// Fast loading skeleton spinner
function PageLoader() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-3 border-secondary border-t-transparent rounded-full animate-spin" />
      <span className="font-sans text-[11px] uppercase tracking-widest text-on-surface-variant font-bold">
        Loading...
      </span>
    </div>
  );
}

// Layout wrapper for public pages (with Navbar + Footer)
function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          {children}
        </Suspense>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}

// Checkout has its own header — no Navbar/Footer
function CheckoutLayout({ children }) {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
      <CartDrawer />
    </div>
  );
}

export default function App() {
  const { init } = useAuthStore();

  // Initialize Firebase auth listener once on mount
  useEffect(() => {
    const unsubscribe = init();
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'font-sans text-sm',
          style: {
            borderRadius: '12px',
            border: '1px solid #D8C7B3',
            background: '#ffffff',
            color: '#2D1910',
          },
          success: {
            iconTheme: { primary: '#A95A2A', secondary: '#ffffff' },
          },
        }}
      />

      <Routes>
        {/* Auth Pages — no public layout */}
        <Route
          path="/login"
          element={
            <Suspense fallback={<PageLoader />}>
              <Login />
            </Suspense>
          }
        />
        <Route
          path="/register"
          element={
            <Suspense fallback={<PageLoader />}>
              <Register />
            </Suspense>
          }
        />

        {/* Checkout — custom layout */}
        <Route
          path="/checkout"
          element={
            <CheckoutLayout>
              <Checkout />
            </CheckoutLayout>
          }
        />

        {/* Admin Routes — protected, code-split */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Suspense fallback={<PageLoader />}>
                <AdminDashboard />
              </Suspense>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <Suspense fallback={<PageLoader />}>
                <AdminProducts />
              </Suspense>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <Suspense fallback={<PageLoader />}>
                <AdminOrders />
              </Suspense>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/customers"
          element={
            <AdminRoute>
              <Suspense fallback={<PageLoader />}>
                <AdminCustomers />
              </Suspense>
            </AdminRoute>
          }
        />

        {/* Public Routes — with Navbar + Footer */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/shop" element={<PublicLayout><Shop /></PublicLayout>} />
        <Route path="/product/:id" element={<PublicLayout><ProductDetail /></PublicLayout>} />

        {/* Protected User Routes */}
        <Route
          path="/account"
          element={
            <PublicLayout>
              <ProtectedRoute><Account /></ProtectedRoute>
            </PublicLayout>
          }
        />

        {/* Catch-all 404 */}
        <Route
          path="*"
          element={
            <PublicLayout>
              <div className="min-h-[60vh] flex flex-col items-center justify-center text-center page-enter px-6">
                <span className="font-display text-8xl text-outline-variant mb-4">404</span>
                <h1 className="font-display text-3xl text-primary mb-3">Page Not Found</h1>
                <p className="text-on-surface-variant mb-8">The page you're looking for doesn't exist.</p>
                <a href="/" className="btn-primary">Back to Home</a>
              </div>
            </PublicLayout>
          }
        />
      </Routes>
    </Router>
  );
}
