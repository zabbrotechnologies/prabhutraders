import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useWishlistStore = create(
  persist(
    (set, get) => ({
      userWishlists: {}, // { [userId]: string[] }

      toggle: (productId, uid = 'guest') => {
        const current = get().userWishlists[uid] || [];
        const next = current.includes(productId)
          ? current.filter((id) => id !== productId)
          : [...current, productId];

        set((state) => ({
          userWishlists: {
            ...state.userWishlists,
            [uid]: next,
          },
        }));
      },

      isWishlisted: (productId, uid = 'guest') => {
        return (get().userWishlists[uid] || []).includes(productId);
      },

      clear: (uid = 'guest') => {
        set((state) => ({
          userWishlists: {
            ...state.userWishlists,
            [uid]: [],
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
