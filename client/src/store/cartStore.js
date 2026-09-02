import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getUserAccountKey } from './wishlistStore.js';

const useCartStore = create(
  persist(
    (set, get) => ({
      userCarts: {}, // { [accountKey]: CartItem[] }
      activeUserKey: 'guest',
      isOpen: false,

      // Set active user account key
      setActiveUser: (user) => {
        const key = getUserAccountKey(user);
        const currentActiveKey = get().activeUserKey;

        if (key !== 'guest' && currentActiveKey === 'guest') {
          // Merge guest cart items into logged-in user cart
          const guestCart = get().userCarts['guest'] || [];
          const userCart = get().userCarts[key] || [];

          if (guestCart.length > 0) {
            const mergedMap = new Map();
            [...userCart, ...guestCart].forEach((item) => {
              if (mergedMap.has(item.cartKey)) {
                const existing = mergedMap.get(item.cartKey);
                mergedMap.set(item.cartKey, { ...existing, qty: existing.qty + item.qty });
              } else {
                mergedMap.set(item.cartKey, { ...item });
              }
            });

            set((state) => ({
              activeUserKey: key,
              userCarts: {
                ...state.userCarts,
                [key]: Array.from(mergedMap.values()),
                guest: [], // Clear guest after merging
              },
            }));
            return;
          }
        }

        set({ activeUserKey: key });
      },

      // Get current items for active account
      get items() {
        const key = get().activeUserKey || 'guest';
        return get().userCarts[key] || [];
      },

      // Add item to cart
      addItem: (product, selectedSize, selectedColor, qty = 1, user = null) => {
        const key = user ? getUserAccountKey(user) : (get().activeUserKey || 'guest');
        const cartKey = `${product.id}-${selectedSize}-${selectedColor}`;
        const currentCart = get().userCarts[key] || [];
        const existing = currentCart.find((i) => i.cartKey === cartKey);

        let updatedCart;
        if (existing) {
          updatedCart = currentCart.map((i) =>
            i.cartKey === cartKey ? { ...i, qty: i.qty + qty } : i
          );
        } else {
          updatedCart = [
            ...currentCart,
            {
              cartKey,
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.images?.[0] || '',
              selectedSize,
              selectedColor,
              qty,
            },
          ];
        }

        set((state) => ({
          activeUserKey: key,
          userCarts: {
            ...state.userCarts,
            [key]: updatedCart,
          },
        }));
      },

      // Remove item from cart
      removeItem: (cartKey) => {
        const key = get().activeUserKey || 'guest';
        const currentCart = get().userCarts[key] || [];
        set((state) => ({
          userCarts: {
            ...state.userCarts,
            [key]: currentCart.filter((i) => i.cartKey !== cartKey),
          },
        }));
      },

      // Update quantity
      updateQty: (cartKey, qty) => {
        if (qty < 1) {
          get().removeItem(cartKey);
          return;
        }
        const key = get().activeUserKey || 'guest';
        const currentCart = get().userCarts[key] || [];
        set((state) => ({
          userCarts: {
            ...state.userCarts,
            [key]: currentCart.map((i) =>
              i.cartKey === cartKey ? { ...i, qty } : i
            ),
          },
        }));
      },

      // Clear cart
      clearCart: () => {
        const key = get().activeUserKey || 'guest';
        set((state) => ({
          userCarts: {
            ...state.userCarts,
            [key]: [],
          },
        }));
      },

      // Toggle drawer
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      // Computed getters
      get itemCount() {
        return get().items.reduce((sum, i) => sum + i.qty, 0);
      },
      get subtotal() {
        return get().items.reduce((sum, i) => sum + i.price * i.qty, 0);
      },
    }),
    {
      name: 'prabhu-user-carts',
    }
  )
);

export default useCartStore;
