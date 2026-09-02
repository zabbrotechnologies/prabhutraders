import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useCartStore from '../store/cartStore.js';
import useAuthStore from '../store/authStore.js';
import { placeOrder } from '../lib/api.js';
import { formatPrice, INDIAN_STATES } from '../lib/utils.js';
import toast from 'react-hot-toast';

const STEPS = ['Information', 'Delivery', 'Payment'];

const SHIPPING_OPTIONS = [
  { id: 'standard', label: 'Standard Delivery', desc: '5–7 business days', price: 0, freeAbove: 1999 },
  { id: 'express', label: 'Express Delivery', desc: '2–3 business days', price: 149 },
];

export default function Checkout() {
  const items = useCartStore((s) => s.items) || [];
  const clearCart = useCartStore((s) => s.clearCart);
  const { user } = useAuthStore();

  const subtotal = items.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 1), 0);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [showSummaryMobile, setShowSummaryMobile] = useState(false);

  // Form state
  const [contact, setContact] = useState({ email: user?.email || '', phone: '' });
  const [address, setAddress] = useState({ firstName: '', lastName: '', address: '', city: '', state: 'Tamil Nadu', pincode: '' });
  const [shipping, setShipping] = useState('standard');

  useEffect(() => {
    document.title = 'Checkout | PRABHU TRADERS';
  }, []);

  const shippingOption = SHIPPING_OPTIONS.find((o) => o.id === shipping);
  const shippingCost = shipping === 'standard' && subtotal >= 1999 ? 0 : (shippingOption?.price || 0);
  const total = subtotal + shippingCost;

  const isEmailValid = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e?.trim() || '');
  const isPhoneValid = (p) => /^[6-9]\d{9}$/.test((p || '').replace(/[^0-9]/g, ''));
  const isPincodeValid = (pin) => /^\d{6}$/.test((pin || '').trim());

  const handleNext = () => {
    if (step === 0) {
      if (!contact.email || !isEmailValid(contact.email)) {
        toast.error('Please enter a valid email address above.');
        return;
      }
      if (!contact.phone || !isPhoneValid(contact.phone)) {
        toast.error('Please enter a valid 10-digit mobile number above.');
        return;
      }
      if (!address.firstName?.trim()) {
        toast.error('Please enter your First Name.');
        return;
      }
      if (!address.address?.trim()) {
        toast.error('Please enter your House / Street / Landmark address.');
        return;
      }
      if (!address.city?.trim()) {
        toast.error('Please enter your City.');
        return;
      }
      if (!address.pincode || !isPincodeValid(address.pincode)) {
        toast.error('Please enter a valid 6-digit Pincode.');
        return;
      }
    }
    setStep((s) => Math.min(s + 1, 2));
  };
  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handlePlaceOrder = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const orderData = {
        items: items.map((i) => ({
          productId: i.id,
          name: i.name,
          price: i.price,
          qty: i.qty,
          size: i.selectedSize,
          color: i.selectedColor,
          image: i.image,
        })),
        shippingAddress: {
          ...address,
          ...contact,
          fullName: `${address.firstName} ${address.lastName}`.trim() || 'Customer',
        },
        paymentMethod: 'cod',
        subtotal,
        shippingCost,
        total,
      };

      const order = await placeOrder(orderData);
      clearCart();
      setOrderPlaced(order);
      toast.success('Order placed successfully via Cash on Delivery!');
    } catch (err) {
      toast.error('Failed to place order. Please check all fields.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Case 1: Order Confirmed
  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center page-enter px-4 py-12 bg-surface">
        <div className="max-w-md w-full mx-auto text-center bg-white p-6 sm:p-8 rounded-3xl border border-outline-variant/40 shadow-lux">
          <div className="w-16 h-16 bg-green-50 flex items-center justify-center mx-auto mb-4 rounded-full">
            <span className="material-symbols-outlined text-4xl text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-primary font-bold mb-2">Order Confirmed!</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mb-1">Thank you for ordering with Prabhu Traders.</p>
          <div className="my-4 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 text-center">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Your Order ID</p>
            <p className="font-display text-xl font-bold text-secondary my-1">{orderPlaced.orderId}</p>
            <p className="text-[11px] text-green-800 font-bold bg-green-100/70 inline-block px-2.5 py-0.5 rounded-full">Payment: Cash on Delivery (₹{total})</p>
          </div>
          <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
            Our artisan in Avadi is preparing your package. We will dispatch it and contact you on WhatsApp/Phone.
          </p>
          <div className="space-y-2">
            <Link to="/shop" className="btn-primary w-full justify-center text-xs h-12">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Cart is Empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-surface page-enter">
        <header className="h-16 px-4 sm:px-6 flex justify-between items-center border-b border-outline-variant/30 bg-white">
          <Link to="/shop" className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Back to Store</span>
          </Link>
          <Link to="/" className="font-display text-base sm:text-lg tracking-widest text-primary font-bold">PRABHU TRADERS</Link>
          <div className="w-16" />
        </header>

        <div className="max-w-md w-full mx-auto text-center px-4 py-16">
          <div className="w-20 h-20 bg-surface-container flex items-center justify-center mx-auto mb-4 rounded-full">
            <span className="material-symbols-outlined text-4xl text-outline">shopping_bag</span>
          </div>
          <h2 className="font-display text-2xl text-primary font-bold mb-2">Your Shopping Bag is Empty</h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mb-6">
            You don't have any items in your bag yet. Choose from our handcrafted slippers, sandals, and leather goods to proceed with checkout.
          </p>
          <Link to="/shop" className="btn-primary text-xs h-12 px-8 inline-flex">
            Browse Footwear Collection
          </Link>
        </div>

        <div className="p-4 text-center text-xs text-on-surface-variant border-t border-outline-variant/30">
          © {new Date().getFullYear()} PRABHU TRADERS · MAXYWALK LEATHER
        </div>
      </div>
    );
  }

  // Case 3: Standard 3-Step Checkout Flow (Pure Cash on Delivery)
  return (
    <div className="page-enter min-h-screen w-full overflow-hidden bg-surface">
      {/* Header */}
      <header className="h-14 sm:h-16 px-4 sm:px-6 flex justify-between items-center border-b border-outline-variant/30 bg-white sticky top-0 z-40">
        <Link to="/shop" className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary font-medium">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Return</span>
        </Link>
        <Link to="/" className="font-display text-base sm:text-lg tracking-widest text-primary font-bold">PRABHU TRADERS</Link>
        <div className="flex items-center gap-1 text-green-700">
          <span className="material-symbols-outlined text-sm">local_shipping</span>
          <span className="text-[10px] font-sans uppercase tracking-wider font-bold">COD Available</span>
        </div>
      </header>

      {/* Mobile Accordion for Order Summary */}
      <div className="lg:hidden border-b border-outline-variant/30 bg-surface-container-low px-4 py-3">
        <button
          onClick={() => setShowSummaryMobile(!showSummaryMobile)}
          className="w-full flex items-center justify-between text-xs font-bold text-primary"
        >
          <div className="flex items-center gap-1.5 text-secondary">
            <span className="material-symbols-outlined text-base">shopping_bag</span>
            <span>{showSummaryMobile ? 'Hide' : 'Show'} Order Summary ({items.length} items)</span>
            <span className="material-symbols-outlined text-sm">{showSummaryMobile ? 'expand_less' : 'expand_more'}</span>
          </div>
          <span className="font-display text-base text-primary font-bold">{formatPrice(total)}</span>
        </button>

        {showSummaryMobile && (
          <div className="pt-4 space-y-3">
            {items.map((item) => (
              <div key={item.cartKey} className="flex gap-2.5 items-center bg-white p-2.5 rounded-xl border border-outline-variant/20">
                <img src={item.image} alt="" className="w-12 h-14 object-cover rounded-lg" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-primary truncate">{item.name}</p>
                  <p className="text-[10px] text-on-surface-variant">Size {item.selectedSize} · Qty {item.qty}</p>
                </div>
                <span className="text-xs font-bold text-primary">{formatPrice(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <main className="container-max py-6 sm:py-10 px-4">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          {/* Left: 3-Step Checkout Flow */}
          <div className="w-full lg:w-[58%]">
            {/* Stepper */}
            <nav className="flex items-center justify-between gap-1 mb-8 overflow-x-auto pb-1">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-1.5 flex-1 last:flex-none">
                  <div
                    className={`w-6 h-6 flex items-center justify-center text-[11px] font-bold rounded-full flex-shrink-0 transition-colors ${
                      i < step ? 'bg-secondary text-white' : i === step ? 'bg-primary text-white' : 'border border-outline-variant text-outline'
                    }`}
                  >
                    {i < step ? <span className="material-symbols-outlined text-xs">check</span> : i + 1}
                  </div>
                  <span className={`text-[11px] font-sans uppercase tracking-wider whitespace-nowrap ${i === step ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>{s}</span>
                  {i < 2 && <div className="flex-1 h-px bg-outline-variant/40 mx-1" />}
                </div>
              ))}
            </nav>

            {/* Step 0: Information */}
            {step === 0 && (
              <div className="space-y-6">
                <section className="bg-white p-5 sm:p-6 rounded-3xl border border-outline-variant/40 shadow-lux">
                  <h2 className="font-display text-xl sm:text-2xl text-primary font-bold mb-4">Contact Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-1.5">Email Address</label>
                      <input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} required className="input-hairline text-sm" placeholder="you@example.com" />
                    </div>
                    <div>
                      <label className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-1.5">Phone Number (WhatsApp Updates)</label>
                      <input type="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} required className="input-hairline text-sm" placeholder="+91 98765 43210" />
                    </div>
                  </div>
                </section>

                <section className="bg-white p-5 sm:p-6 rounded-3xl border border-outline-variant/40 shadow-lux">
                  <h2 className="font-display text-xl sm:text-2xl text-primary font-bold mb-4">Delivery Address</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-1.5">First Name</label>
                      <input type="text" value={address.firstName} onChange={(e) => setAddress({ ...address, firstName: e.target.value })} required className="input-hairline text-sm" />
                    </div>
                    <div>
                      <label className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-1.5">Last Name</label>
                      <input type="text" value={address.lastName} onChange={(e) => setAddress({ ...address, lastName: e.target.value })} required className="input-hairline text-sm" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-1.5">House / Street / Landmark</label>
                      <input type="text" value={address.address} onChange={(e) => setAddress({ ...address, address: e.target.value })} required className="input-hairline text-sm" placeholder="e.g. 6A, V Main Road, Kovilpathagai" />
                    </div>
                    <div>
                      <label className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-1.5">City</label>
                      <input type="text" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} required className="input-hairline text-sm" placeholder="e.g. Avadi, Chennai" />
                    </div>
                    <div>
                      <label className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-1.5">Pincode</label>
                      <input type="text" value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} required className="input-hairline text-sm" maxLength={6} placeholder="600062" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-1.5">State</label>
                      <div className="relative">
                        <select value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} className="input-hairline text-sm appearance-none pr-8">
                          {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-base">expand_more</span>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="pt-2 flex flex-col sm:flex-row justify-between gap-3">
                  <button onClick={handleNext} className="btn-primary w-full sm:w-auto justify-center text-xs h-12 order-1 sm:order-2">
                    Continue to Delivery
                  </button>
                  <Link to="/shop" className="text-xs text-on-surface-variant hover:text-primary font-sans text-center py-2 order-2 sm:order-1">← Return to Shop</Link>
                </div>
              </div>
            )}

            {/* Step 1: Delivery */}
            {step === 1 && (
              <div className="space-y-6">
                <section className="bg-white p-5 sm:p-6 rounded-3xl border border-outline-variant/40 shadow-lux">
                  <h2 className="font-display text-xl sm:text-2xl text-primary font-bold mb-4">Choose Shipping Method</h2>
                  <div className="space-y-3">
                    {SHIPPING_OPTIONS.map((opt) => {
                      const price = opt.id === 'standard' && subtotal >= 1999 ? 0 : opt.price;
                      return (
                        <label key={opt.id} className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-colors ${shipping === opt.id ? 'border-primary bg-surface-container-low' : 'border-outline-variant bg-white'}`}>
                          <input type="radio" name="shipping" value={opt.id} checked={shipping === opt.id} onChange={(e) => setShipping(e.target.value)} className="accent-primary w-4 h-4" />
                          <div className="flex-1">
                            <p className="font-bold text-xs sm:text-sm text-primary">{opt.label}</p>
                            <p className="text-[11px] text-on-surface-variant">{opt.desc}</p>
                          </div>
                          <span className="font-bold text-xs sm:text-sm text-primary">
                            {price === 0 ? 'FREE' : formatPrice(price)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </section>
                <div className="pt-2 flex flex-col sm:flex-row justify-between gap-3">
                  <button onClick={handleNext} className="btn-primary w-full sm:w-auto justify-center text-xs h-12 order-1 sm:order-2">Continue to Payment</button>
                  <button onClick={handleBack} className="text-xs text-on-surface-variant hover:text-primary order-2 sm:order-1 text-center py-2">← Back to Information</button>
                </div>
              </div>
            )}

            {/* Step 2: Payment (Pure COD) */}
            {step === 2 && (
              <div className="space-y-6">
                <section className="bg-white p-5 sm:p-6 rounded-3xl border border-outline-variant/40 shadow-lux">
                  <h2 className="font-display text-xl sm:text-2xl text-primary font-bold mb-4">Payment Method</h2>
                  
                  {/* Cash on Delivery Card */}
                  <div className="p-5 rounded-2xl border-2 border-primary bg-surface-container-low flex items-start gap-4">
                    <span className="material-symbols-outlined text-secondary text-3xl flex-shrink-0 mt-0.5">payments</span>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-primary">Cash on Delivery (COD)</h3>
                        <span className="px-2.5 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold uppercase rounded-full">Guaranteed</span>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        Pay with cash when your handcrafted footwear package is delivered directly to your door.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-surface-container rounded-xl flex items-center gap-2 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-base flex-shrink-0">verified</span>
                    <span>No advance payment required. Safe doorstep inspection & cash handover.</span>
                  </div>
                </section>

                <div className="pt-2 flex flex-col sm:flex-row justify-between gap-3">
                  <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary w-full sm:w-auto justify-center text-xs h-12 gap-2 font-bold order-1 sm:order-2">
                    {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
                      <>
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Confirm COD Order · {formatPrice(total)}
                      </>
                    )}
                  </button>
                  <button onClick={handleBack} className="text-xs text-on-surface-variant hover:text-primary order-2 sm:order-1 text-center py-2">← Back to Delivery</button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Desktop Order Summary Sidebar */}
          <div className="hidden lg:block w-[42%]">
            <div className="bg-white border border-outline-variant/40 p-6 sticky top-24 shadow-lux rounded-3xl">
              <h2 className="font-display text-lg font-bold text-primary mb-4 pb-3 border-b border-outline-variant/30">
                Order Summary ({items.length} items)
              </h2>
              <div className="space-y-3 mb-6 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.cartKey} className="flex gap-3 items-center">
                    <div className="w-14 h-16 bg-surface-container relative flex-shrink-0 border border-outline-variant/20 rounded-xl overflow-hidden">
                      <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center text-[9px] font-bold z-10">{item.qty}</span>
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-primary truncate">{item.name}</p>
                      <p className="text-[10px] text-on-surface-variant">Size {item.selectedSize}</p>
                    </div>
                    <span className="text-xs font-bold text-primary">{formatPrice(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-xs border-t border-outline-variant/30 pt-4 mb-4">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal</span>
                  <span className="text-primary font-bold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Shipping</span>
                  <span className="text-primary font-bold">{shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}</span>
                </div>
              </div>
              <div className="flex justify-between items-end pt-3 border-t border-primary">
                <span className="font-sans text-xs uppercase tracking-widest text-primary font-bold">Total</span>
                <span className="font-display text-2xl font-bold text-primary">{formatPrice(total)}</span>
              </div>
              <p className="text-[10px] text-on-surface-variant mt-3 text-center">Cash on Delivery · Handcrafted in Tamil Nadu</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
