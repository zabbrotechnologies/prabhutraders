import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth } from '../firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

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
            } catch (err) {
              console.error('Profile sync error:', err);
              set({ user: firebaseUser, isLoading: false });
            }
          } else {
            set({ user: null, userProfile: null, isAdmin: false, isLoading: false });
          }
        });

        return unsubscribe;
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
