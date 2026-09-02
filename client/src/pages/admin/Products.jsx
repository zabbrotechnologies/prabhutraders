import { useState, useEffect, useCallback } from 'react';
import AdminLayout from './Layout.jsx';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../lib/api.js';
import { formatPrice } from '../../lib/utils.js';
import toast from 'react-hot-toast';

const CATEGORIES = ['slippers', 'sandals', 'belts', 'wallets'];
const EMPTY_FORM = { name: '', description: '', category: 'slippers', price: '', originalPrice: '', sizes: [], colors: [], images: [''], stock: 10, featured: false, material: 'Full-Grain Leather', badge: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    getProducts({ limit: 100 }).then((d) => setProducts(d.products || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.title = 'Products | Admin – Prabhu Traders';
    fetchProducts();
  }, [fetchProducts]);

  const openAdd = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({
      name: p.name || '',
      description: p.description || '',
      category: p.category || 'slippers',
      price: p.price || '',
      originalPrice: p.originalPrice || '',
      sizes: p.sizes || [],
      colors: p.colors ? p.colors.join(', ') : '',
      images: p.images?.length ? p.images : [''],
      stock: p.stock ?? 10,
      featured: p.featured || false,
      material: p.material || 'Full-Grain Leather',
      badge: p.badge || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...form,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
        colors: typeof form.colors === 'string' ? form.colors.split(',').map((c) => c.trim()).filter(Boolean) : form.colors,
        images: form.images.filter(Boolean),
        stock: parseInt(form.stock),
        badge: form.badge || null,
      };

      if (editProduct) {
        await updateProduct(editProduct.id, data);
        setProducts((prev) => prev.map((p) => p.id === editProduct.id ? { ...p, ...data } : p));
        toast.success('Product updated!');
      } else {
        const created = await createProduct(data);
        setProducts((prev) => [created, ...prev]);
        toast.success('Product added!');
      }
      setModalOpen(false);
    } catch { toast.error('Failed to save product.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product deleted.');
      setDeleteConfirm(null);
    } catch { toast.error('Failed to delete product.'); }
  };

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return !q || p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q);
  });

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl text-primary">Products</h1>
          <p className="text-on-surface-variant text-sm mt-1">{products.length} products in catalogue</p>
        </div>
        <button onClick={openAdd} className="btn-primary gap-2">
          <span className="material-symbols-outlined text-base">add</span>
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border border-outline-variant/50 shadow-lux p-5 mb-6">
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="w-full border border-outline-variant py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary" />
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-outline-variant/50 shadow-lux p-12 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl block mb-3">inventory_2</span>
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white border border-outline-variant/50 shadow-lux group hover:border-primary/30 transition-colors">
              <div className="aspect-[4/3] bg-surface-container overflow-hidden relative">
                <img
                  src={p.images?.[0] || 'https://placehold.co/400x300/efeeec/7e7576?text=No+Image'}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {p.badge && <span className="absolute top-2 left-2 bg-white text-primary text-[10px] font-sans uppercase tracking-wider px-2 py-0.5">{p.badge}</span>}
                {p.featured && <span className="absolute top-2 right-2 bg-secondary text-white text-[10px] font-sans uppercase tracking-wider px-2 py-0.5">Featured</span>}
              </div>
              <div className="p-4">
                <p className="font-display text-sm text-primary font-normal line-clamp-2 mb-1">{p.name}</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-2">{p.category} · {p.material}</p>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="font-medium text-primary text-sm">{formatPrice(p.price)}</span>
                    {p.originalPrice && <span className="text-xs text-on-surface-variant line-through ml-2">{formatPrice(p.originalPrice)}</span>}
                  </div>
                  <span className={`text-xs px-2 py-0.5 ${p.stock > 0 ? 'text-green-700 bg-green-50' : 'text-error bg-error-container'}`}>
                    {p.stock > 0 ? `Stock: ${p.stock}` : 'Out of Stock'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-1.5 border border-outline-variant py-2 text-xs font-sans uppercase tracking-wider hover:border-primary transition-colors">
                    <span className="material-symbols-outlined text-sm">edit</span> Edit
                  </button>
                  <button onClick={() => setDeleteConfirm(p)} className="flex-1 flex items-center justify-center gap-1.5 border border-error/30 py-2 text-xs font-sans uppercase tracking-wider text-error hover:border-error transition-colors">
                    <span className="material-symbols-outlined text-sm">delete</span> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4 bg-black/40">
          <div className="bg-white w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 sticky top-0 bg-white z-10">
              <h2 className="font-display text-xl text-primary">{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setModalOpen(false)} className="btn-icon"><span className="material-symbols-outlined">close</span></button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">Product Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full border border-outline-variant px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              </div>

              {/* Description */}
              <div>
                <label className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border border-outline-variant px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">Category *</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-outline-variant px-3 py-2 text-sm focus:outline-none focus:border-primary">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {/* Material */}
                <div>
                  <label className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">Material</label>
                  <input type="text" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} className="w-full border border-outline-variant px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Price */}
                <div>
                  <label className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">Price (₹) *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min="0" step="1" className="w-full border border-outline-variant px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                </div>
                {/* Original Price */}
                <div>
                  <label className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">Original (₹)</label>
                  <input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} min="0" step="1" className="w-full border border-outline-variant px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                </div>
                {/* Stock */}
                <div>
                  <label className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">Stock</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} min="0" className="w-full border border-outline-variant px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {['6','7','8','9','10','11','12','S','M','L','XL','One Size'].map((s) => (
                    <button key={s} type="button" onClick={() => setForm((f) => ({ ...f, sizes: f.sizes.includes(s) ? f.sizes.filter((x) => x !== s) : [...f.sizes, s] }))} className={`px-3 py-1.5 border text-xs transition-colors ${form.sizes.includes(s) ? 'border-primary bg-primary text-white' : 'border-outline-variant hover:border-primary'}`}>{s}</button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">Colors (comma-separated)</label>
                <input type="text" value={typeof form.colors === 'string' ? form.colors : form.colors?.join(', ')} onChange={(e) => setForm({ ...form, colors: e.target.value })} placeholder="Cognac Brown, Black, Tan" className="w-full border border-outline-variant px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              </div>

              {/* Image URLs */}
              <div>
                <label className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">Image URLs</label>
                {form.images.map((url, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input type="url" value={url} onChange={(e) => { const imgs = [...form.images]; imgs[i] = e.target.value; setForm({ ...form, images: imgs }); }} placeholder="https://..." className="flex-1 border border-outline-variant px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                    {form.images.length > 1 && <button type="button" onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })} className="text-error hover:text-error/70"><span className="material-symbols-outlined text-sm">close</span></button>}
                  </div>
                ))}
                <button type="button" onClick={() => setForm({ ...form, images: [...form.images, ''] })} className="text-xs text-secondary underline">+ Add Image URL</button>
              </div>

              {/* Badge + Featured */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant block mb-2">Badge (optional)</label>
                  <input type="text" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Best Seller, New Arrival..." className="w-full border border-outline-variant px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                </div>
                <div className="flex items-center gap-3 pt-7">
                  <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 accent-secondary" />
                  <label htmlFor="featured" className="font-sans text-sm text-primary cursor-pointer">Featured Product</label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-outline-variant/30">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center gap-2">
                  {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {editProduct ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white p-8 max-w-sm w-full shadow-2xl text-center">
            <span className="material-symbols-outlined text-5xl text-error mb-4 block">delete_forever</span>
            <h3 className="font-display text-xl text-primary mb-2">Delete Product?</h3>
            <p className="text-on-surface-variant text-sm mb-6">"{deleteConfirm.name}" will be permanently deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 h-14 bg-error text-white font-sans text-button-text uppercase tracking-widest hover:bg-error/80 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
