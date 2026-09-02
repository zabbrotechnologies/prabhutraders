import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const getUserAccountKey = (user) => {
  if (!user) return 'guest';
  if (typeof user === 'string') return user.toLowerCase().trim();
  if (user.email) return user.email.toLowerCase().trim();
  if (user.uid) return user.uid;
  return 'guest';
};

const useWishlistStore = create(
  persist(
    (set, get) => ({
      userWishlists: {}, // { [accountKey]: string[] }

      // Get wishlist for active user or guest
      getWishlist: (user) => {
        const key = getUserAccountKey(user);
        return get().userWishlists[key] || [];
      },

      // Toggle item in wishlist
      toggle: (productId, user) => {
        const key = getUserAccountKey(user);
        const current = get().userWishlists[key] || [];
        const next = current.includes(productId)
          ? current.filter((id) => id !== productId)
          : [...current, productId];

        set((state) => ({
          userWishlists: {
            ...state.userWishlists,
            [key]: next,
          },
        }));
      },

      // Check if product is wishlisted
      isWishlisted: (productId, user) => {
        const key = getUserAccountKey(user);
        return (get().userWishlists[key] || []).includes(productId);
      },

      // Merge guest items into logged in user account
      syncAccountWishlist: (user) => {
        if (!user) return;
        const key = getUserAccountKey(user);
        const guestItems = get().userWishlists['guest'] || [];
        const userItems = get().userWishlists[key] || [];

        if (guestItems.length === 0) return;

        const merged = Array.from(new Set([...userItems, ...guestItems]));
        set((state) => ({
          userWishlists: {
            ...state.userWishlists,
            [key]: merged,
            guest: [], // Clear guest after merging
          },
        }));
      },

      // Clear wishlist for specific account
      clear: (user) => {
        const key = getUserAccountKey(user);
        set((state) => ({
          userWishlists: {
            ...state.userWishlists,
            [key]: [],
          },
        }));
      },
    }),
    {
      name: 'prabhu-user-wishlists',
    }
  )
);

export default useWishlistStore;
