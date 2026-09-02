import { useState } from 'react';
import { Link } from 'react-router-dom';
import useCartStore from '../store/cartStore.js';
import useWishlistStore from '../store/wishlistStore.js';
import { formatPrice } from '../lib/utils.js';
import toast from 'react-hot-toast';

import useAuthStore from '../store/authStore.js';

export default function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false);
  const { addItem, openCart } = useCartStore();
  const { user } = useAuthStore();
  const toggle = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted);

  const wishlisted = isWishlisted(product.id, user);
  const hasSecondImage = product.images?.length > 1;
  const defaultSize = product.sizes?.[0] || 'Standard';

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, defaultSize, product.colors?.[0] || '', 1, user);
    openCart();
    toast.success(`${product.name} added to bag!`, {
      duration: 2000,
      style: { fontFamily: 'Plus Jakarta Sans', fontSize: '13px' },
    });
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id, user);
    toast(wishlisted ? 'Removed from wishlist' : 'Saved to wishlist', {
      icon: wishlisted ? '💔' : '❤️',
      duration: 1500,
      style: { fontFamily: 'Plus Jakarta Sans', fontSize: '13px' },
    });
  };

  return (
    <div className="product-card group flex flex-col w-full bg-white border border-outline-variant/40 hover:border-secondary transition-all duration-300 p-3 sm:p-4 rounded-2xl shadow-lux hover:shadow-lux-md">
      {/* Image Container */}
      <Link
        to={`/product/${product.id}`}
        className="relative w-full aspect-[4/5] bg-surface-container-low overflow-hidden mb-3 block rounded-xl"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Primary Image */}
        <img
          src={product.images?.[0] || 'https://placehold.co/400x500/f4f3f1/7e7576?text=MAXYWALK'}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className={`img-primary absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
            hovered && hasSecondImage ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
          }`}
          onError={(e) => { e.target.src = 'https://placehold.co/400x500/f4f3f1/7e7576?text=MAXYWALK'; }}
        />

        {/* Secondary Image */}
        {hasSecondImage && (
          <img
            src={product.images[1]}
            alt={`${product.name} alternate view`}
            loading="lazy"
            decoding="async"
            className={`img-secondary absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
              hovered ? 'opacity-100' : 'opacity-0'
            }`}
            onError={(e) => { e.target.src = 'https://placehold.co/400x500/f4f3f1/7e7576?text=MAXYWALK'; }}
          />
        )}

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-2 left-2 bg-primary text-white px-2 py-0.5 font-sans text-[9px] uppercase tracking-wider z-10 font-semibold">
            {product.badge}
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white shadow-sm transition-colors"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <span
            className="material-symbols-outlined text-[17px]"
            style={{ fontVariationSettings: wishlisted ? "'FILL' 1" : "'FILL' 0", color: wishlisted ? '#934b19' : '#1a1c1b' }}
          >
            favorite
          </span>
        </button>
      </Link>

      {/* Product Info */}
      <div className="flex flex-col flex-grow">
        <span className="text-[10px] uppercase font-sans tracking-wider text-on-surface-variant mb-1 truncate block">
          {product.category} · {product.material || 'Genuine Leather'}
        </span>

        <Link
          to={`/product/${product.id}`}
          className="font-display text-sm sm:text-base leading-snug text-primary font-normal line-clamp-2 hover:text-secondary transition-colors mb-2"
        >
          {product.name}
        </Link>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex text-secondary">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className="material-symbols-outlined text-[12px]"
                  style={{
                    fontVariationSettings: star <= Math.round(product.rating) ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  star
                </span>
              ))}
            </div>
            <span className="text-[10px] text-on-surface-variant">({product.reviewCount || 0})</span>
          </div>
        )}

        {/* Price & Action Row */}
        <div className="mt-auto pt-2 border-t border-outline-variant/20 flex items-center justify-between gap-2">
          <div>
            <span className="font-sans text-sm sm:text-base font-bold text-primary block">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[11px] text-on-surface-variant line-through block">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            className="btn-primary py-0 px-3 sm:px-4 h-9 text-[11px] uppercase tracking-wider flex items-center gap-1 font-semibold flex-shrink-0"
            aria-label="Add to cart"
          >
            <span className="material-symbols-outlined text-sm">shopping_bag</span>
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
