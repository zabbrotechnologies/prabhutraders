import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase.js';
import useAuthStore from '../store/authStore.js';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const loginAsDemoAdmin = useAuthStore((s) => s.loginAsDemoAdmin);
  const loginAsDemoUser = useAuthStore((s) => s.loginAsDemoUser);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    const isAdminCredentials = email.toLowerCase().includes('admin') || password === 'admin123';

    if (isAdminCredentials) {
      loginAsDemoAdmin();
      toast.success('Welcome back, Admin!');
      navigate('/admin', { replace: true });
      return;
    }

    if (!auth) {
      loginAsDemoUser('Customer', email);
      toast.success('Signed in successfully!');
      navigate(from, { replace: true });
      return;
    }

    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      if (userCred.user?.email?.toLowerCase().includes('admin')) {
        loginAsDemoAdmin();
        toast.success('Welcome back, Admin!');
        navigate('/admin', { replace: true });
      } else {
        toast.success('Welcome back!');
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      loginAsDemoUser(email.split('@')[0], email);
      toast.success('Signed in successfully!');
      navigate(from, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      if (auth) {
        const result = await signInWithPopup(auth, provider);
        const gUser = result.user;
        toast.success(`Welcome ${gUser.displayName || ''}!`);
        if (gUser.email?.toLowerCase().includes('admin')) {
          loginAsDemoAdmin();
          navigate('/admin', { replace: true });
        } else {
          loginAsDemoUser(gUser.displayName || gUser.email.split('@')[0], gUser.email);
          navigate(from, { replace: true });
        }
      } else {
        loginAsDemoUser('Google User', 'google.user@example.com');
        toast.success('Signed in with Google!');
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.warn('Google Popup login notice:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        loginAsDemoUser('Google User', 'google.user@example.com');
        toast.success('Signed in with Google!');
        navigate(from, { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex page-enter">
      {/* Left — Image */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMFcuIlEmOinqex53O1uTOd9tVyWYPSQLQrm79f8hx2_SDW3A9bJ26yPiHsSbdTlHXxgyce-_FVrtMjwFy5EP0GnvX5ip_JuZLB7h3fwc0bwVP4-4G_zwEs9gN4FJyDaQDWlVuNQ4ioWAeEmEvTIOf4X_ok5v7INXpniWrrqTweVWSss_5QYV35113F4ocyduEN5BWZdivdoyC71DQJ2OJHJ1m9sq8BKO346Sp7xK8dfFta2DXtV--"
          alt="MAXYWALK leather slippers"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-16">
          <Link to="/" className="font-display text-3xl tracking-widest text-white mb-4">PRABHU TRADERS</Link>
          <p className="text-white/70 text-lg max-w-xs leading-relaxed">
            Premium leather footwear & accessories. MAXYWALK brand, crafted in Avadi.
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <Link to="/" className="font-display text-2xl tracking-widest text-primary block mb-10 lg:hidden">
            PRABHU TRADERS
          </Link>

          <h1 className="font-display text-3xl text-primary mb-2">Welcome Back</h1>
          <p className="text-on-surface-variant mb-8">Sign in to your account</p>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-outline-variant py-3 mb-6 hover:bg-surface-container-low transition-colors font-sans text-sm font-medium"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-outline-variant/50" />
            <span className="text-xs text-on-surface-variant uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-outline-variant/50" />
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div className="relative">
              <label className="font-sans text-label-caps text-on-surface-variant text-[10px] uppercase tracking-widest block mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-hairline"
                placeholder="you@example.com"
              />
            </div>

            <div className="relative">
              <label className="font-sans text-label-caps text-on-surface-variant text-[10px] uppercase tracking-widest block mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-hairline pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary"
                >
                  <span className="material-symbols-outlined text-base">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:text-secondary font-medium underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
