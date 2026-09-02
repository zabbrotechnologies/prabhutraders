import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../lib/api.js';
import ProductCard from '../components/ProductCard.jsx';
import { CATEGORIES, SHOE_SIZES, formatPrice } from '../lib/utils.js';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

const MATERIALS = ['Genuine Leather', 'Full-Grain Leather', 'Vegetable-Tanned', 'Genuine Cowhide'];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sort, setSort] = useState('featured');
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    document.title = 'Shop All Leather Footwear & Goods | PRABHU TRADERS';
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort };
      if (selectedCategory !== 'all') params.category = selectedCategory;
      const data = await getProducts(params);
      let filtered = data.products || [];

      // Client-side filters
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter((p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
        );
      }
      if (selectedSizes.length > 0) {
        filtered = filtered.filter((p) =>
          p.sizes?.some((s) => selectedSizes.includes(s))
        );
      }
      if (selectedMaterials.length > 0) {
        filtered = filtered.filter((p) =>
          selectedMaterials.includes(p.material)
        );
      }
      filtered = filtered.filter(
        (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
      );

      setProducts(filtered);
      setTotal(filtered.length);
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedSizes, selectedMaterials, priceRange, sort, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  const toggleSize = (size) =>
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );

  const toggleMaterial = (mat) =>
    setSelectedMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]
    );

  const clearAll = () => {
    setSelectedCategory('all');
    setSelectedSizes([]);
    setSelectedMaterials([]);
    setPriceRange([0, 5000]);
    setSort('featured');
    setSearchParams({});
  };

  const activeFilters = [
    selectedCategory !== 'all' && { label: CATEGORIES.find((c) => c.value === selectedCategory)?.label, onRemove: () => setSelectedCategory('all') },
    ...selectedSizes.map((s) => ({ label: `Size ${s}`, onRemove: () => toggleSize(s) })),
    ...selectedMaterials.map((m) => ({ label: m, onRemove: () => toggleMaterial(m) })),
    searchQuery && { label: `"${searchQuery}"`, onRemove: () => setSearchParams({}) },
  ].filter(Boolean);

  const Sidebar = () => (
    <div className="space-y-6">
      {/* Category */}
      <div className="border-b border-outline-variant/30 pb-5">
        <h3 className="font-sans text-xs uppercase tracking-wider text-primary font-bold mb-3">
          Category
        </h3>
        <ul className="space-y-2.5">
          {CATEGORIES.map((cat) => (
            <li key={cat.value}>
              <button
                onClick={() => { setSelectedCategory(cat.value); setSearchParams(cat.value !== 'all' ? { category: cat.value } : {}); }}
                className={`flex items-center gap-2.5 w-full text-left text-xs sm:text-sm transition-colors ${
                  selectedCategory === cat.value ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 ${selectedCategory === cat.value ? 'border-secondary bg-secondary' : 'border-outline'}`}>
                  {selectedCategory === cat.value && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                {cat.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Size */}
      <div className="border-b border-outline-variant/30 pb-5">
        <h3 className="font-sans text-xs uppercase tracking-wider text-primary font-bold mb-3">Shoe Size</h3>
        <div className="grid grid-cols-4 gap-1.5">
          {SHOE_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`border py-1.5 text-xs font-sans transition-colors ${
                selectedSizes.includes(size)
                  ? 'border-primary bg-primary text-white font-bold'
                  : 'border-outline-variant text-on-surface hover:border-primary'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="border-b border-outline-variant/30 pb-5">
        <h3 className="font-sans text-xs uppercase tracking-wider text-primary font-bold mb-3">Max Price: {formatPrice(priceRange[1])}</h3>
        <div className="space-y-2">
          <input
            type="range"
            min={0}
            max={5000}
            step={100}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            className="w-full accent-secondary"
          />
          <div className="flex justify-between text-xs text-on-surface-variant">
            <span>{formatPrice(0)}</span>
            <span>{formatPrice(5000)}</span>
          </div>
        </div>
      </div>

      {/* Material */}
      <div>
        <h3 className="font-sans text-xs uppercase tracking-wider text-primary font-bold mb-3">Leather Type</h3>
        <div className="space-y-2">
          {MATERIALS.map((mat) => (
            <button
              key={mat}
              onClick={() => toggleMaterial(mat)}
              className={`flex items-center gap-2.5 w-full text-left text-xs sm:text-sm transition-colors ${
                selectedMaterials.includes(mat) ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 ${selectedMaterials.includes(mat) ? 'border-secondary bg-secondary' : 'border-outline'}`}>
                {selectedMaterials.includes(mat) && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              {mat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-enter min-h-screen w-full overflow-hidden">
      <div className="container-max py-6 sm:py-10">
        {/* Header */}
        <header className="mb-6 sm:mb-10 border-b border-outline-variant/30 pb-4 sm:pb-6">
          <nav className="flex text-on-surface-variant font-sans text-[10px] uppercase tracking-widest gap-1.5 mb-2">
            <a href="/" className="hover:text-primary">Home</a>
            <span>/</span>
            <span className="text-primary font-semibold">Shop Catalogue</span>
          </nav>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
            <div>
              <h1 className="font-display text-2xl sm:text-4xl text-primary font-bold">
                {selectedCategory !== 'all' ? selectedCategory.toUpperCase() : 'LEATHER CATALOGUE'}
              </h1>
              <p className="text-on-surface-variant text-xs sm:text-sm mt-0.5">
                {searchQuery ? `Search for "${searchQuery}"` : 'Prabhu Traders handcrafted footwear and accessories.'}
                {' '}<span className="text-primary font-bold">({total} items)</span>
              </p>
            </div>

            {/* Mobile Actions Bar */}
            <div className="flex items-center justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0">
              {/* Mobile filter button */}
              <button
                onClick={() => setFiltersOpen(true)}
                className="md:hidden flex items-center justify-center gap-1.5 border border-primary px-3 py-2 text-xs font-sans uppercase tracking-wider font-bold bg-white"
              >
                <span className="material-symbols-outlined text-base">filter_list</span>
                Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
              </button>

              {/* Sort Selector */}
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full appearance-none bg-white border border-outline-variant py-2 pr-7 pl-3 font-sans text-xs text-primary focus:outline-none focus:border-primary"
                >
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-primary text-base">expand_more</span>
              </div>
            </div>
          </div>
        </header>

        {/* Active Filter Chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-6">
            {activeFilters.map((f, i) => (
              <div key={i} className="bg-surface-container-high px-2.5 py-1 flex items-center gap-1 font-sans text-[10px] uppercase tracking-wider text-primary border border-outline-variant/30">
                <span>{f.label}</span>
                <button onClick={f.onRemove} className="hover:text-secondary flex items-center">
                  <span className="material-symbols-outlined text-xs">close</span>
                </button>
              </div>
            ))}
            <button onClick={clearAll} className="text-xs text-secondary hover:underline font-semibold ml-2">
              Clear All
            </button>
          </div>
        )}

        {/* Content Layout */}
        <div className="flex gap-8 relative">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <div className="sticky top-24 bg-white p-5 border border-outline-variant/30">
              <Sidebar />
            </div>
          </aside>

          {/* Product Grid - Stacked 1 by 1 on Mobile */}
          <div className="flex-grow w-full">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="p-3 border border-outline-variant/20 bg-white">
                    <div className="aspect-[4/5] skeleton mb-3" />
                    <div className="h-4 skeleton mb-2 w-3/4" />
                    <div className="h-4 skeleton w-1/3" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border border-outline-variant/30">
                <span className="material-symbols-outlined text-5xl text-outline-variant mb-2">search_off</span>
                <h3 className="font-display text-xl text-primary mb-1">No products match your filters</h3>
                <p className="text-xs text-on-surface-variant mb-4">Try removing some filters to see the full collection.</p>
                <button onClick={clearAll} className="btn-primary text-xs h-11">Clear All Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Slide Drawer */}
        {filtersOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
            <div className="relative w-[85%] max-w-xs bg-white h-full p-5 overflow-y-auto flex flex-col shadow-2xl z-10">
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-outline-variant/30">
                <h2 className="font-display text-lg font-bold">Filters</h2>
                <button onClick={() => setFiltersOpen(false)} className="w-8 h-8 flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <div className="flex-1">
                <Sidebar />
              </div>

              <div className="pt-4 mt-4 border-t border-outline-variant/30 flex gap-2">
                <button onClick={clearAll} className="btn-secondary flex-1 justify-center text-xs h-11">
                  Reset
                </button>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="btn-primary flex-1 justify-center text-xs h-11"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
