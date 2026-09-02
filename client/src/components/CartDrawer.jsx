import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import useCartStore from '../store/cartStore.js';
import { formatPrice } from '../lib/utils.js';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty } = useCartStore();
  const drawerRef = useRef(null);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const itemCount = items.reduce((s, i) => s + i.qty, 0);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') closeCart(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, closeCart]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full sm:max-w-[420px] bg-white z-[101] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-outline-variant/30 bg-surface-container-low">
          <div>
            <h2 className="font-display text-xl font-bold text-primary">Shopping Bag</h2>
            <p className="text-[11px] text-on-surface-variant">
              {itemCount === 0 ? 'Your bag is empty' : `${itemCount} item${itemCount > 1 ? 's' : ''} added`}
            </p>
          </div>
          <button
            onClick={closeCart}
            className="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:text-primary rounded-full"
            aria-label="Close cart"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-12">
              <span className="material-symbols-outlined text-5xl text-outline-variant">
                shopping_bag
              </span>
              <div>
                <p className="font-display text-lg text-primary font-bold mb-1">Your bag is empty</p>
                <p className="text-xs text-on-surface-variant">
                  Explore our handcrafted leather slippers, sandals and accessories.
                </p>
              </div>
              <Link
                to="/shop"
                className="btn-primary text-xs h-11 px-6 mt-2"
                onClick={closeCart}
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.cartKey} className="flex gap-3 p-3 bg-surface-container-lowest border border-outline-variant/30">
                  {/* Image */}
                  <div className="w-16 h-20 bg-surface-container flex-shrink-0 overflow-hidden border border-outline-variant/20">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://placehold.co/80x100/f4f3f1/7e7576?text=PT'; }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h3 className="text-xs sm:text-sm font-semibold text-primary leading-tight line-clamp-2">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => removeItem(item.cartKey)}
                          className="text-on-surface-variant hover:text-error transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">
                        {item.selectedSize && `Size: ${item.selectedSize}`}
                        {item.selectedSize && item.selectedColor && ' · '}
                        {item.selectedColor}
                      </p>
                    </div>

                    {/* Qty & Price */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-outline-variant/20">
                      <div className="flex items-center border border-outline-variant bg-white">
                        <button
                          onClick={() => updateQty(item.cartKey, item.qty - 1)}
                          className="w-7 h-7 flex items-center justify-center text-on-surface text-sm font-bold"
                        >
                          −
                        </button>
                        <span className="w-7 text-center text-xs font-bold">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.cartKey, item.qty + 1)}
                          className="w-7 h-7 flex items-center justify-center text-on-surface text-sm font-bold"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-bold text-primary text-xs sm:text-sm">
                        {formatPrice(item.price * item.qty)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Checkout CTA */}
        {items.length > 0 && (
          <div className="border-t border-outline-variant/30 p-4 sm:p-6 bg-surface-container-low space-y-3">
            {/* Free shipping bar */}
            {subtotal < 1999 ? (
              <div className="bg-white border border-outline-variant/40 p-2 text-[11px] text-on-surface-variant text-center">
                Add <strong>{formatPrice(1999 - subtotal)}</strong> more for <span className="text-secondary font-bold">Free Shipping</span>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 p-2 text-[11px] text-green-800 text-center font-semibold">
                🎉 You've unlocked FREE Delivery across India!
              </div>
            )}

            {/* Subtotal */}
            <div className="flex justify-between items-center py-1">
              <span className="font-sans text-xs uppercase tracking-wider text-on-surface-variant font-bold">
                Subtotal
              </span>
              <span className="font-display text-xl sm:text-2xl font-bold text-primary">
                {formatPrice(subtotal)}
              </span>
            </div>

            <Link
              to="/checkout"
              onClick={closeCart}
              className="btn-primary w-full justify-center text-xs tracking-widest h-12 gap-1.5 font-bold shadow-md"
            >
              <span>PROCEED TO CHECKOUT</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>

            <button
              onClick={closeCart}
              className="w-full text-center text-xs text-on-surface-variant hover:text-primary transition-colors underline py-1"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
