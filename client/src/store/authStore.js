import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth } from '../firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import useCartStore from './cartStore.js';
import useWishlistStore from './wishlistStore.js';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5001/api' : '/api');

const syncUserStores = (user) => {
  try {
    useCartStore.getState().setActiveUser(user);
    useWishlistStore.getState().syncAccountWishlist(user);

    if (user && user.email && !user.email.toLowerCase().includes('admin')) {
      const existing = JSON.parse(localStorage.getItem('prabhu-registered-customers') || '[]');
      const email = user.email.toLowerCase().trim();
      const isExist = existing.some((c) => c.email?.toLowerCase().trim() === email);

      if (!isExist) {
        const newCust = {
          id: `cust-${Date.now()}`,
          uid: user.uid || `uid-${Date.now()}`,
          name: user.displayName || user.email.split('@')[0],
          email: email,
          phone: '+91 98765 43210',
          role: 'customer',
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem('prabhu-registered-customers', JSON.stringify([newCust, ...existing]));
      }
    }
  } catch (e) {
    console.error('Account sync error:', e);
  }
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      userProfile: null,
      isLoading: true,
      isAdmin: false,

      // Initialize auth listener
      init: () => {
        if (!auth) {
          const currentUser = get().user;
          if (currentUser) syncUserStores(currentUser);
          set({ isLoading: false });
          return () => {};
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            try {
              const token = await firebaseUser.getIdToken();
              const res = await axios.post(
                `${API_URL}/auth/verify`,
                { name: firebaseUser.displayName },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              const profile = res.data;
              set({
                user: firebaseUser,
                userProfile: profile,
                isAdmin: profile.role === 'admin',
                isLoading: false,
              });
              syncUserStores(firebaseUser);
            } catch (err) {
              console.error('Profile sync error:', err);
              set({ user: firebaseUser, isLoading: false });
              syncUserStores(firebaseUser);
            }
          } else {
            set({ user: null, userProfile: null, isAdmin: false, isLoading: false });
            syncUserStores(null);
          }
        });

        return unsubscribe;
      },

      // Demo / Direct login helpers
      loginAsDemoAdmin: () => {
        const mockAdminUser = { uid: 'admin-demo-id', email: 'admin@prabhutraders.com', displayName: 'Prabhu Admin' };
        const mockProfile = { name: 'Prabhu Admin', role: 'admin', phone: '+91 94447 43465' };
        set({ user: mockAdminUser, userProfile: mockProfile, isAdmin: true, isLoading: false });
        syncUserStores(mockAdminUser);
        return mockAdminUser;
      },
      loginAsDemoUser: (name = 'Customer', email = 'user@example.com') => {
        const mockUser = { uid: `user-${Date.now()}`, email, displayName: name };
        const mockProfile = { name, role: 'customer', phone: '+91 98765 43210' };
        set({ user: mockUser, userProfile: mockProfile, isAdmin: false, isLoading: false });
        syncUserStores(mockUser);
        return mockUser;
      },

      // Sign out
      logout: async () => {
        if (auth) await signOut(auth);
        set({ user: null, userProfile: null, isAdmin: false });
      },

      // Update profile
      setUserProfile: (profile) => {
        set({ userProfile: profile, isAdmin: profile?.role === 'admin' });
      },

      // Get auth token
      getToken: async () => {
        const { user } = get();
        if (!user) return null;
        return user.getIdToken();
      },
    }),
    {
      name: 'prabhu-auth',
      partialize: (state) => ({ userProfile: state.userProfile, isAdmin: state.isAdmin }),
    }
  )
);

export default useAuthStore;
