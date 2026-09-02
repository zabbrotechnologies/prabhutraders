import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct, getProducts } from '../lib/api.js';
import useCartStore from '../store/cartStore.js';
import useAuthStore from '../store/authStore.js';
import useWishlistStore from '../store/wishlistStore.js';
import ProductCard from '../components/ProductCard.jsx';
import { formatPrice } from '../lib/utils.js';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

  const { addItem, openCart } = useCartStore();
  const { user } = useAuthStore();
  const toggle = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted);
  const uid = user?.uid || 'guest';

  useEffect(() => {
    setLoading(true);
    setActiveImage(0);
    setSelectedSize('');
    setSelectedColor('');
    setQty(1);

    getProduct(id)
      .then((data) => {
        setProduct(data);
        setSelectedColor(data.colors?.[0] || '');
        if (data.sizes?.length > 0) setSelectedSize(data.sizes[0]);
        document.title = `${data.name} | PRABHU TRADERS`;
        return getProducts({ category: data.category, limit: 4 });
      })
      .then((d) => setRelated((d.products || []).filter((p) => p.id !== id).slice(0, 4)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize && product?.sizes?.length > 0) {
      toast.error('Please choose a size', { duration: 2000 });
      return;
    }
    addItem(product, selectedSize, selectedColor, qty);
    openCart();
    toast.success('Added to your shopping bag!', { duration: 2000 });
  };

  const discount = product?.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  if (loading) {
    return (
      <div className="container-max py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="aspect-[4/5] skeleton w-full" />
          <div className="space-y-4">
            <div className="h-8 skeleton w-3/4" />
            <div className="h-6 skeleton w-1/4" />
            <div className="h-4 skeleton w-full" />
            <div className="h-4 skeleton w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-max py-20 text-center px-4">
        <span className="material-symbols-outlined text-5xl text-outline-variant mb-2">error</span>
        <h2 className="font-display text-2xl text-primary mb-3">Product not found</h2>
        <Link to="/shop" className="btn-primary text-xs h-12">Back to Shop Catalogue</Link>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : ['https://placehold.co/600x700/f4f3f1/7e7576?text=MAXYWALK'];

  return (
    <div className="page-enter w-full overflow-hidden">
      <div className="container-max py-4 sm:py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex text-[10px] sm:text-xs font-sans text-on-surface-variant uppercase tracking-widest gap-1.5 mb-4 sm:mb-6 overflow-x-auto whitespace-nowrap pb-1">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-primary">Shop</Link>
          <span>/</span>
          <span className="text-primary font-bold truncate max-w-[160px] sm:max-w-none">{product.name}</span>
        </nav>

        {/* Main Grid: Images & Details Stacked on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-16 mb-12 sm:mb-20">
          {/* Image Gallery */}
          <div className="space-y-3">
            {/* Main Image */}
            <div className="aspect-[4/5] bg-surface-container-lowest overflow-hidden relative border border-outline-variant/30">
              <img
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                onError={(e) => { e.target.src = 'https://placehold.co/600x700/f4f3f1/7e7576?text=MAXYWALK'; }}
              />
              {product.badge && (
                <div className="absolute top-3 left-3 bg-primary text-white px-2.5 py-1 font-sans text-[10px] uppercase tracking-wider font-bold">
                  {product.badge}
                </div>
              )}
              {discount > 0 && (
                <div className="absolute top-3 right-3 bg-secondary text-white px-2.5 py-1 font-sans text-[10px] uppercase tracking-wider font-bold">
                  {discount}% OFF
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 overflow-hidden border-2 transition-colors bg-white ${
                      activeImage === idx ? 'border-secondary' : 'border-outline-variant/40 hover:border-outline'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Column */}
          <div className="flex flex-col space-y-5">
            <div>
              <span className="text-eyebrow text-secondary block mb-1">
                {product.category} · {product.material || 'Genuine Leather'}
              </span>
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-primary font-bold leading-snug mb-2">
                {product.name}
              </h1>

              {/* Rating */}
              {product.rating > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="flex text-secondary">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: s <= Math.round(product.rating) ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                    ))}
                  </div>
                  <span className="text-xs text-on-surface-variant font-medium">{product.rating} ({product.reviewCount || 0} reviews)</span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 p-3 bg-surface-container-low border border-outline-variant/30">
              <span className="font-display text-2xl sm:text-3xl text-primary font-bold">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-base text-on-surface-variant line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="text-xs bg-secondary text-white px-2 py-0.5 font-bold uppercase tracking-wider">Save {formatPrice(product.originalPrice - product.price)}</span>
                </>
              )}
            </div>

            {/* Color selector */}
            {product.colors?.length > 0 && (
              <div>
                <p className="font-sans text-xs uppercase tracking-wider text-primary font-bold mb-2">
                  Select Color: <span className="text-secondary font-semibold">{selectedColor}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-2 text-xs font-sans border transition-all ${
                        selectedColor === color
                          ? 'border-primary bg-primary text-white font-bold'
                          : 'border-outline-variant text-on-surface bg-white hover:border-primary'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            {product.sizes?.length > 0 && (
              <div>
                <p className="font-sans text-xs uppercase tracking-wider text-primary font-bold mb-2">
                  Select Size: <span className="text-secondary font-semibold">{selectedSize || 'Choose size'}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[44px] h-11 px-3 font-sans text-xs border transition-all flex items-center justify-center ${
                        selectedSize === size
                          ? 'border-primary bg-primary text-white font-bold'
                          : 'border-outline-variant text-on-surface bg-white hover:border-primary'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty & Add to Cart */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <span className="font-sans text-xs uppercase tracking-wider text-on-surface-variant font-bold">Quantity:</span>
                <div className="flex items-center border border-outline-variant bg-white">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-surface-container text-base font-bold">−</button>
                  <span className="w-10 text-center text-sm font-bold">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-surface-container text-base font-bold">+</button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleAddToCart}
                  className="btn-primary flex-1 h-12 text-xs uppercase tracking-widest gap-2 justify-center font-bold"
                  disabled={product.stock === 0}
                >
                  <span className="material-symbols-outlined text-base">shopping_bag</span>
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
                </button>
                <button
                  onClick={() => toggle(product.id, uid)}
                  className={`w-12 h-12 border flex items-center justify-center transition-all bg-white ${
                    isWishlisted(product.id, uid) ? 'border-secondary bg-secondary/5' : 'border-outline-variant hover:border-secondary'
                  }`}
                  aria-label="Wishlist"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: isWishlisted(product.id, uid) ? "'FILL' 1" : "'FILL' 0", color: isWishlisted(product.id, uid) ? '#934b19' : '#1a1c1b' }}
                  >
                    favorite
                  </span>
                </button>
              </div>

              {/* Direct WhatsApp Custom Order Button */}
              <a
                href={`https://wa.me/919444743465?text=Hi!%20I'm%20interested%20in%20customizing%20${encodeURIComponent(product.name)}%20(Size:%20${selectedSize || 'Custom'}).`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 border border-green-700 text-green-800 bg-green-50/50 hover:bg-green-100/60 py-3 text-xs uppercase tracking-wider font-bold transition-colors"
              >
                <span className="material-symbols-outlined text-base text-green-700">chat</span>
                Order Custom via WhatsApp
              </a>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-outline-variant/30 text-center">
              {[
                { icon: 'verified', text: '100% Genuine Leather' },
                { icon: 'local_shipping', text: 'Pan-India Delivery' },
                { icon: 'cached', text: 'Easy Exchange' },
              ].map((b) => (
                <div key={b.text} className="flex flex-col items-center p-2 bg-surface-container-low border border-outline-variant/20">
                  <span className="material-symbols-outlined text-secondary text-lg mb-1">{b.icon}</span>
                  <span className="text-[10px] text-on-surface-variant font-medium leading-tight">{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs: Description / Details / Care */}
        <div className="mb-12 sm:mb-20">
          <div className="flex border-b border-outline-variant/30 mb-6 overflow-x-auto">
            {['description', 'details', 'care'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 sm:px-6 py-3 font-sans text-xs uppercase tracking-wider font-bold transition-all border-b-2 -mb-px whitespace-nowrap ${
                  activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'
                }`}
              >
                {tab === 'description' ? 'Description' : tab === 'details' ? 'Specifications' : 'Leather Care'}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-6 bg-white border border-outline-variant/30">
            {activeTab === 'description' && (
              <p className="text-on-surface-variant text-sm leading-relaxed max-w-2xl">
                {product.description || 'Premium handcrafted genuine leather product under the MAXYWALK brand from Prabhu Traders, Avadi, Tamil Nadu.'}
              </p>
            )}
            {activeTab === 'details' && (
              <div className="max-w-lg space-y-2 text-xs sm:text-sm">
                {[
                  ['Brand', 'MAXYWALK by Prabhu Traders'],
                  ['Material', product.material || 'Genuine Full-Grain Leather'],
                  ['Category', product.category?.toUpperCase()],
                  ['Available Sizes', product.sizes?.join(', ') || 'Standard'],
                  ['Available Colors', product.colors?.join(', ') || 'Custom Brown/Black'],
                  ['Dispatch Time', '1–2 Business Days'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-outline-variant/20 last:border-0">
                    <span className="font-sans uppercase text-on-surface-variant font-medium text-[11px]">{k}</span>
                    <span className="text-primary font-semibold text-right">{v}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'care' && (
              <ul className="space-y-2 text-xs sm:text-sm text-on-surface-variant">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-secondary text-base flex-shrink-0">check_circle</span>
                  <span>Wipe clean with a dry or slightly damp cotton cloth after daily use.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-secondary text-base flex-shrink-0">check_circle</span>
                  <span>Apply natural leather cream or wax conditioner once every 2 months.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-secondary text-base flex-shrink-0">check_circle</span>
                  <span>Keep away from direct water soaking; allow natural air drying if wet.</span>
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-xl sm:text-2xl text-primary font-bold">You May Also Like</h2>
              <Link to="/shop" className="text-xs text-secondary font-semibold hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
