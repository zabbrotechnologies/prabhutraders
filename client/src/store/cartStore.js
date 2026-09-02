import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      // Add item to cart
      addItem: (product, selectedSize, selectedColor, qty = 1) => {
        const cartKey = `${product.id}-${selectedSize}-${selectedColor}`;
        set((state) => {
          const existing = state.items.find((i) => i.cartKey === cartKey);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.cartKey === cartKey ? { ...i, qty: i.qty + qty } : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
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
            ],
          };
        });
      },

      // Remove item from cart
      removeItem: (cartKey) => {
        set((state) => ({
          items: state.items.filter((i) => i.cartKey !== cartKey),
        }));
      },

      // Update quantity
      updateQty: (cartKey, qty) => {
        if (qty < 1) {
          get().removeItem(cartKey);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.cartKey === cartKey ? { ...i, qty } : i
          ),
        }));
      },

      // Clear cart
      clearCart: () => set({ items: [] }),

      // Toggle drawer
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      // Computed values
      get itemCount() {
        return get().items.reduce((sum, i) => sum + i.qty, 0);
      },
      get subtotal() {
        return get().items.reduce((sum, i) => sum + i.price * i.qty, 0);
      },
    }),
    {
      name: 'prabhu-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export default useCartStore;
