import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../lib/api.js';
import ProductCard from '../components/ProductCard.jsx';
import heroLifestyle from '../assets/hero_lifestyle.jpg';

// Intersection Observer hook for fade-in animations
function useFadeIn() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.unobserve(el); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

const CATEGORIES = [
  {
    id: 'slippers', label: 'Slippers', num: '01',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMFcuIlEmOinqex53O1uTOd9tVyWYPSQLQrm79f8hx2_SDW3A9bJ26yPiHsSbdTlHXxgyce-_FVrtMjwFy5EP0GnvX5ip_JuZLB7h3fwc0bwVP4-4G_zwEs9gN4FJyDaQDWlVuNQ4ioWAeEmEvTIOf4X_ok5v7INXpniWrrqTweVWSss_5QYV35113F4ocyduEN5BWZdivdoyC71DQJ2OJHJ1m9sq8BKO346Sp7xK8dfFta2DXtV--',
    desc: 'Handcrafted leather comfort',
  },
  {
    id: 'belts', label: 'Belts', num: '02',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkZZLptrzF3_pLJdGwE1D0fzBf9J6BskKwY_creH1fEwQGjpA8E1ZqUMQcf5oG0DPqTdDQOe0jiSWO8xDYWLfLedhMNKW5or3L6QIdT4kNWSpCsGqeM06tYRvuYRe-Y1giC2c_OBy7TTJgqxv_s8CrqRLxmNSIM6YZu8lhceL1wjSjQPg39qPyrz461bIcjc5-OvPVhEnA2eJ7fhvH0yagBHcjNNgrqediDKAK4ax5ilJPk55aRuEG',
    desc: 'Full-grain leather belts',
  },
  {
    id: 'wallets', label: 'Wallets', num: '03',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAy9uIBLtM48fYq1AlBrQamS2Dj7jXFNVNX2n814Z51DiV4LuTj-EnP57VbeZkSNwLHeXpomeiGTawYezijQB25UOFsQ4z4E5llsZz_4RLODXSoe-0bpC4GZ8UN0PUA8d29RmafijMqyq25C6Pdca8Od9nyx5o1-57k8n61Bpm2crxPPHHuicw4XKOKeHmOGtyGTPtds5oHpUnohJj3GRBHBU5dHs6JD-782XyvJ6AkrqjGzheuQ10x',
    desc: 'Slim minimalist wallets',
  },
  {
    id: 'sandals', label: 'Sandals', num: '04',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6nu1sVJmuhxAQ780WR1vB5n2GcenI6W1NEgIRGAtZ764Uk7UFV_qgPyRj4dUUa3_i3cEJzM0FMnQHO1bDZtTNzseokXLTXkHKNUbZ3FHh6-9y5IFlhZ1G32aWG7VkQo8lLYxbgyXU_-lfRXcycfUG1YLiotTERB6_SdATPIZXQwkb5gsWCb01lyDb3FXWWRORbBqQjQUgcWMHX-z_st_7AE1V523NomA9G1imL9bX3nDArBQnGVg',
    desc: 'Structured outdoor sandals',
  },
];

const REVIEWS = [
  { name: 'Hemavathi Abisekar', rating: 5, text: 'Leathers with premium quality at lowest price — must visit footwear slipper!' },
  { name: 'Sukarman Gupta', rating: 5, text: 'It was a fantastic experience right from ordering the products. Quality is top notch.' },
  { name: 'Rajkumar S.', rating: 5, text: 'Custom slippers exactly as I wanted. Fit is perfect and the leather quality is amazing.' },
  { name: 'Priya M.', rating: 4, text: 'Ordered belts as gifts — everyone loved them. Great craftsmanship and fast delivery.' },
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  const heroRef = useRef(null);
  const cat1 = useFadeIn(); const cat2 = useFadeIn(); const cat3 = useFadeIn(); const cat4 = useFadeIn();
  const storyRef = useFadeIn();
  const featuredRef = useFadeIn();
  const reviewRef = useFadeIn();

  useEffect(() => {
    document.title = 'PRABHU TRADERS | MAXYWALK – Handcrafted Leather Footwear';
    getProducts({ featured: true, limit: 4 })
      .then((data) => setFeaturedProducts(data.products || []))
      .catch(() => setFeaturedProducts([]))
      .finally(() => setLoadingProducts(false));

    // Parallax scroll listener
    const handleScroll = () => {
      if (window.scrollY < 1200) {
        setScrollY(window.scrollY);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Hero fade in
    setTimeout(() => heroRef.current?.classList.add('visible'), 150);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="page-enter w-full overflow-hidden">
      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative min-h-[580px] h-[88vh] max-h-[950px] w-full overflow-hidden flex items-center justify-center">
        {/* Parallax Background Container */}
        <div
          className="absolute inset-0 w-full h-[125%] -top-[10%] transition-transform duration-75 ease-out will-change-transform"
          style={{ transform: `translateY(${scrollY * 0.32}px) scale(1.04)` }}
        >
          <img
            src={heroLifestyle}
            alt="MAXYWALK luxury leather modeling lifestyle group collection"
            className="w-full h-full object-cover object-center brightness-[0.78] contrast-[1.08]"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1920&q=80';
            }}
          />
        </div>

        {/* Multi-layered cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/30" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/60 pointer-events-none" />

        {/* Hero Content */}
        <div
          ref={heroRef}
          className="relative z-10 fade-in-up flex flex-col items-center text-center px-4 sm:px-6 max-w-3xl w-full"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-sans text-[10px] sm:text-xs text-white/95 tracking-[0.2em] uppercase font-bold">
              Est. 2010 · Handcrafted in Avadi, TN
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl text-white mb-4 leading-tight tracking-tight drop-shadow-lg">
            CRAFTED IN LEATHER.
          </h1>
          <p className="font-sans text-sm sm:text-base md:text-lg text-white/90 mb-8 max-w-lg leading-relaxed px-2 drop-shadow">
            Explore handcrafted genuine leather slippers, mules, sandals, belts and wallets under the MAXYWALK brand.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto max-w-xs sm:max-w-none">
            <Link to="/shop" className="btn-primary w-full sm:w-auto text-xs sm:text-sm h-12 sm:h-14 shadow-xl">
              Shop Collection
            </Link>
            <a
              href="https://wa.me/919444743465?text=Hi%20Prabhu%20Traders!%20I%20want%20to%20order%20custom%20footwear."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-hero-glass w-full sm:w-auto text-xs sm:text-sm h-12 sm:h-14"
            >
              Custom Orders
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/60">
          <span className="text-[10px] font-sans uppercase tracking-widest">Scroll</span>
          <div className="w-px h-6 bg-white/30 relative overflow-hidden">
            <div className="absolute top-0 w-full h-1/2 bg-white/60 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── Brand Stats Bar ────────────────────────────────── */}
      <div className="bg-primary text-white py-5 px-4">
        <div className="container-max">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { value: '10,000+', label: 'Pairs Sold' },
              { value: '15+', label: 'Years Crafting' },
              { value: 'Pan-India', label: 'Shipping' },
              { value: '4.4★', label: 'Google Rating' },
            ].map((s) => (
              <div key={s.label} className="p-2">
                <div className="font-display text-xl sm:text-2xl md:text-3xl text-secondary font-bold mb-0.5">{s.value}</div>
                <div className="text-[10px] sm:text-xs font-sans uppercase tracking-widest text-white/70">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Categories Section (Stacked 1 by 1 on Mobile) ───────────────────────────────── */}
      <section className="py-12 md:py-24">
        <div className="container-max">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12">
            <div ref={cat1} className="fade-in-up w-full md:w-auto">
              <span className="text-eyebrow block mb-1">What We Make</span>
              <h2 className="font-display text-2xl sm:text-4xl text-primary">Curated Essentials</h2>
              <p className="text-on-surface-variant text-xs sm:text-sm mt-1 max-w-md">
                Every piece is handcrafted with care — the foundation of a quality wardrobe.
              </p>
            </div>
            <Link
              to="/shop"
              className="hidden md:inline-flex items-center gap-2 font-sans text-button-text uppercase tracking-wider text-primary hover:text-secondary transition-colors group"
            >
              View All
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </Link>
          </div>

          {/* Categories Grid - 1 by 1 on Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-gutter">
            {/* 01. Slippers */}
            <div ref={cat2} className="md:col-span-7 relative group overflow-hidden bg-surface-container-lowest shadow-lux fade-in-up h-[320px] sm:h-[400px] md:h-[600px] rounded-3xl">
              <img
                src={CATEGORIES[0].image}
                alt="MAXYWALK leather slippers"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5 sm:p-8 w-full flex justify-between items-end">
                <div>
                  <span className="inline-block bg-white text-primary font-sans text-[10px] font-bold px-3 py-1 mb-2 rounded-full shadow-sm">
                    {CATEGORIES[0].num}
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl md:text-4xl text-white font-bold">{CATEGORIES[0].label}</h3>
                  <p className="text-white/80 text-xs sm:text-sm mt-0.5">{CATEGORIES[0].desc}</p>
                </div>
                <Link
                  to="/shop?category=slippers"
                  className="bg-white text-primary w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center hover:bg-secondary hover:text-white transition-colors shadow-lg flex-shrink-0"
                  aria-label="Shop slippers"
                >
                  <span className="material-symbols-outlined text-lg sm:text-2xl">north_east</span>
                </Link>
              </div>
            </div>

            {/* Right Column (Belts, Wallets, Sandals) */}
            <div className="md:col-span-5 flex flex-col gap-4 md:gap-gutter">
              {/* 02. Belts */}
              <div ref={cat3} className="relative group overflow-hidden bg-surface-container-lowest shadow-lux fade-in-up h-[240px] sm:h-[280px] rounded-3xl">
                <img
                  src={CATEGORIES[1].image}
                  alt="Leather belts"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-5 sm:p-6 w-full flex justify-between items-end">
                  <div>
                    <span className="inline-block bg-white text-primary font-sans text-[10px] font-bold px-2.5 py-0.5 mb-1 rounded-full shadow-sm">{CATEGORIES[1].num}</span>
                    <h3 className="font-display text-xl sm:text-2xl text-white font-bold">{CATEGORIES[1].label}</h3>
                    <p className="text-white/80 text-xs">{CATEGORIES[1].desc}</p>
                  </div>
                  <Link to="/shop?category=belts" className="bg-white text-primary w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary hover:text-white transition-colors flex-shrink-0 shadow-md">
                    <span className="material-symbols-outlined text-base">north_east</span>
                  </Link>
                </div>
              </div>

              {/* 03. Wallets & 04. Sandals Grid */}
              <div ref={cat4} className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-gutter fade-in-up">
                {CATEGORIES.slice(2).map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/shop?category=${cat.id}`}
                    className="relative group overflow-hidden bg-surface-container-lowest shadow-lux h-[200px] sm:h-full min-h-[180px] block rounded-3xl"
                  >
                    <img
                      src={cat.image}
                      alt={cat.label}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4 w-full flex justify-between items-end">
                      <div>
                        <span className="inline-block bg-white text-primary font-sans text-[10px] font-bold px-2 py-0.5 mb-1 rounded-full">{cat.num}</span>
                        <h3 className="font-display text-lg sm:text-xl text-white font-bold">{cat.label}</h3>
                      </div>
                      <span className="material-symbols-outlined text-white text-lg group-hover:translate-x-0.5 transition-transform">north_east</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link to="/shop" className="md:hidden mt-6 w-full btn-secondary justify-center text-xs h-12">
            View All Categories
          </Link>
        </div>
      </section>

      {/* ── Featured Products (One by One on Mobile) ──────────────────────────────── */}
      <section className="py-12 md:py-24 bg-surface-container-low">
        <div className="container-max">
          <div ref={featuredRef} className="fade-in-up text-center mb-8 md:mb-12">
            <span className="text-eyebrow block mb-2">Bestsellers</span>
            <h2 className="font-display text-2xl sm:text-4xl text-primary">
              MAXYWALK Collection
            </h2>
            <p className="text-on-surface-variant text-xs sm:text-sm mt-2 max-w-lg mx-auto">
              Our most-loved handcrafted pieces — each one a statement of durability and comfort.
            </p>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-2">
                  <div className="aspect-[4/5] skeleton mb-4" />
                  <div className="h-4 skeleton mb-2 w-3/4" />
                  <div className="h-4 skeleton w-1/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          <div className="text-center mt-8 md:mt-12">
            <Link to="/shop" className="btn-secondary w-full sm:w-auto justify-center text-xs sm:text-sm h-12 sm:h-14">
              View Full Collection
            </Link>
          </div>
        </div>
      </section>

      {/* ── About / Brand Story ────────────────────────────── */}
      <section className="py-12 md:py-24" id="maxywalk">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div ref={storyRef} className="fade-in-up">
              <span className="text-eyebrow block mb-2">Our Craft</span>
              <h2 className="font-display text-2xl sm:text-4xl text-primary mb-4">
                The MAXYWALK Story
              </h2>
              <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed mb-4">
                Founded in Avadi, Tamil Nadu, <strong>Prabhu Traders</strong> has been a leather custom slipper specialist for over 15 years. We craft every pair with precision, using genuine full-grain leather.
              </p>
              <p className="text-on-surface-variant text-xs sm:text-sm leading-relaxed mb-6">
                Under our registered brand <strong>MAXYWALK</strong>, we supply premium custom footwear, formal belts, and minimalist wallets across India with direct delivery.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {[
                  { icon: 'handshake', title: 'Custom Made', desc: 'Tailored to your size & style' },
                  { icon: 'local_shipping', title: 'Pan-India', desc: 'Safe delivery to every state' },
                  { icon: 'verified', title: 'Premium Leather', desc: '100% Genuine Full-Grain' },
                  { icon: 'support_agent', title: 'WhatsApp Orders', desc: 'Direct artisan communication' },
                ].map((f) => (
                  <div key={f.title} className="flex items-start gap-3 p-3 bg-surface-container-low border border-outline-variant/30">
                    <span className="material-symbols-outlined text-secondary text-2xl flex-shrink-0 mt-0.5">{f.icon}</span>
                    <div>
                      <h4 className="font-sans font-semibold text-xs sm:text-sm text-primary">{f.title}</h4>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://wa.me/919444743465?text=Hi%20Prabhu%20Traders!%20I%20want%20to%20order%20custom%20leather%20footwear."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full sm:w-auto text-xs justify-center h-12"
                >
                  Custom Order on WhatsApp
                </a>
                <Link to="/shop" className="btn-secondary w-full sm:w-auto text-xs justify-center h-12">
                  Browse Store
                </Link>
              </div>
            </div>

            {/* Story Images */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="aspect-[3/4] overflow-hidden bg-surface-container">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgWFFK86T5gmLGWZHLhUaG1cF0-ZMh12kmFHHkKP8zf8Gr0sMBABlXlgWRmZZ8lkT029uBqswFugHrKL8o1QNCxbY2BzztKfqEDQ0Hm8_Vc8uMpo-LOzP6sn4MUjT24AN81n_N26a6t8sUkceHvom18N9yOOF5jEVzx0xsn7olMhAYpZ-gZSegh9zDny7bZQDQCNxtS3svBYjD1E9keYzC2LTtEyz1j4-5Wr36c7vFQq6aGGEEpHpH"
                  alt="MAXYWALK leather slipper"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="aspect-square overflow-hidden bg-surface-container">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkZZLptrzF3_pLJdGwE1D0fzBf9J6BskKwY_creH1fEwQGjpA8E1ZqUMQcf5oG0DPqTdDQOe0jiSWO8xDYWLfLedhMNKW5or3L6QIdT4kNWSpCsGqeM06tYRvuYRe-Y1giC2c_OBy7TTJgqxv_s8CrqRLxmNSIM6YZu8lhceL1wjSjQPg39qPyrz461bIcjc5-OvPVhEnA2eJ7fhvH0yagBHcjNNgrqediDKAK4ax5ilJPk55aRuEG"
                    alt="Leather belt"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-square overflow-hidden bg-surface-container">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAy9uIBLtM48fYq1AlBrQamS2Dj7jXFNVNX2n814Z51DiV4LuTj-EnP57VbeZkSNwLHeXpomeiGTawYezijQB25UOFsQ4z4E5llsZz_4RLODXSoe-0bpC4GZ8UN0PUA8d29RmafijMqyq25C6Pdca8Od9nyx5o1-57k8n61Bpm2crxPPHHuicw4XKOKeHmOGtyGTPtds5oHpUnohJj3GRBHBU5dHs6JD-782XyvJ6AkrqjGzheuQ10x"
                    alt="Leather wallet"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews ────────────────────────────────────────── */}
      <section className="py-12 md:py-24 bg-primary text-white" id="reviews">
        <div className="container-max">
          <div ref={reviewRef} className="fade-in-up text-center mb-8 md:mb-12">
            <span className="font-sans text-[10px] sm:text-xs uppercase tracking-widest text-secondary mb-2 block font-bold">
              Google Customer Reviews
            </span>
            <h2 className="font-display text-2xl sm:text-4xl">What Our Customers Say</h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="flex text-secondary">
                {[1,2,3,4,5].map((s) => (
                  <span key={s} className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              <span className="text-white/70 text-xs sm:text-sm">4.4 · 393 Reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {REVIEWS.map((r) => (
              <div key={r.name} className="border border-white/10 p-5 bg-white/5 hover:border-secondary/50 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex text-secondary mb-2">
                    {[...Array(r.rating)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                  <p className="text-white/80 text-xs sm:text-sm leading-relaxed mb-4 italic">"{r.text}"</p>
                </div>
                <p className="font-sans text-[10px] uppercase tracking-wider text-secondary font-semibold">{r.name}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href="https://maps.google.com/?q=Prabhu+Traders+Avadi"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-xs"
            >
              <span className="material-symbols-outlined text-sm">open_in_new</span>
              View verified reviews on Google Maps
            </a>
          </div>
        </div>
      </section>

      {/* ── WhatsApp CTA Banner ─────────────────────────────────────── */}
      <section className="py-12 md:py-20 bg-secondary px-4">
        <div className="container-max text-center">
          <h2 className="font-display text-2xl sm:text-4xl text-white mb-2 font-bold">
            Need a Custom Slipper Fit?
          </h2>
          <p className="text-white/90 text-xs sm:text-base mb-6 max-w-md mx-auto">
            We specialize in leather custom slippers made to your exact foot dimensions. WhatsApp our master artisan today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xs sm:max-w-none mx-auto">
            <a
              href="https://wa.me/919444743465?text=Hi%20Prabhu%20Traders!%20I%20want%20to%20order%20custom%20leather%20slippers."
              target="_blank" rel="noopener noreferrer"
              className="bg-white text-secondary font-sans text-xs uppercase tracking-widest px-6 h-12 inline-flex items-center justify-center gap-2 hover:bg-white/90 transition-colors font-bold shadow-md"
            >
              <span className="material-symbols-outlined text-base">chat</span>
              WhatsApp Us (Avadi)
            </a>
            <Link to="/shop" className="border border-white text-white font-sans text-xs uppercase tracking-widest px-6 h-12 inline-flex items-center justify-center hover:bg-white/10 transition-colors">
              Browse Catalogue
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
