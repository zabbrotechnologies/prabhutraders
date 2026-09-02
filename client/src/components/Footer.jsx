import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="w-full bg-surface-container-highest border-t border-outline-variant/30 mt-auto overflow-hidden">
      {/* Main Footer */}
      <div className="container-max py-10 sm:py-16 md:py-20 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 md:gap-10">
          {/* Brand & Address Column */}
          <div className="sm:col-span-2 md:col-span-4 space-y-3">
            <Link to="/" className="font-display text-xl sm:text-2xl font-bold tracking-widest text-primary block">
              PRABHU TRADERS
            </Link>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed max-w-sm">
              Leather custom slipper specialist since 2010. Handcrafting genuine leather footwear and accessories under our registered brand <strong>MAXYWALK</strong> in Avadi, Tamil Nadu. Pan-India delivery.
            </p>
            {/* Store details */}
            <div className="space-y-1.5 text-xs text-on-surface-variant pt-2">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-base text-secondary mt-0.5 flex-shrink-0">location_on</span>
                <span>6 A, V Main Road, Kovilpathagai, Avadi, Tamil Nadu 600062</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-secondary flex-shrink-0">call</span>
                <a href="tel:09444743465" className="hover:text-primary font-bold text-secondary">094447 43465</a>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-secondary flex-shrink-0">schedule</span>
                <span>Open Daily: 9:00 AM – 9:00 PM</span>
              </div>
            </div>

            {/* Direct WhatsApp Action Button */}
            <div className="pt-2">
              <a
                href="https://wa.me/919444743465?text=Hi%20Prabhu%20Traders!%20I'm%20visiting%20your%20website."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-700 text-white px-4 py-2 text-xs font-sans uppercase tracking-wider font-bold hover:bg-green-800 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">chat</span>
                <span>WhatsApp Store</span>
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div className="sm:col-span-1 md:col-span-3">
            <h4 className="font-sans text-xs uppercase tracking-widest text-primary font-bold mb-3 sm:mb-4">
              Footwear & Goods
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {[
                { to: '/shop', label: 'All Products' },
                { to: '/shop?category=slippers', label: 'Leather Slippers' },
                { to: '/shop?category=sandals', label: 'Handmade Sandals' },
                { to: '/shop?category=belts', label: 'Full-Grain Belts' },
                { to: '/shop?category=wallets', label: 'Slim Wallets' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-on-surface-variant hover:text-secondary transition-colors block py-0.5">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service & Help */}
          <div className="sm:col-span-1 md:col-span-2">
            <h4 className="font-sans text-xs uppercase tracking-widest text-primary font-bold mb-3 sm:mb-4">
              Help & Info
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {[
                'Free Pan-India Delivery',
                'Custom Size Fitting',
                'Genuine Leather Care',
                'Direct Artisan Support',
              ].map((text) => (
                <li key={text} className="text-on-surface-variant py-0.5">
                  {text}
                </li>
              ))}
              <li>
                <a
                  href="https://maps.google.com/?q=Prabhu+Traders+Avadi+Tamil+Nadu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:underline font-bold flex items-center gap-1 mt-1"
                >
                  <span className="material-symbols-outlined text-sm">map</span>
                  <span>Google Maps Directions</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="sm:col-span-2 md:col-span-3 space-y-3">
            <h4 className="font-sans text-xs uppercase tracking-widest text-primary font-bold mb-2">
              Updates & Offers
            </h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Subscribe to get notified of new custom leather releases and seasonal discounts.
            </p>
            {subscribed ? (
              <div className="p-3 bg-green-50 border border-green-200 text-xs text-green-800 font-bold">
                ✓ Thank you for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-1.5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="flex-1 bg-white border border-outline-variant px-3 py-2 text-xs text-primary focus:outline-none focus:border-primary"
                />
                <button type="submit" className="btn-primary py-0 px-4 h-9 text-xs font-bold">
                  Join
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-outline-variant/30 py-4 px-4 bg-surface-container-high">
        <div className="container-max flex flex-col sm:flex-row justify-between items-center gap-2 text-center">
          <p className="text-[10px] sm:text-xs text-on-surface-variant font-sans uppercase tracking-wider">
            © {new Date().getFullYear()} PRABHU TRADERS · MAXYWALK LEATHER FOOTWEAR · AVADI
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant">
            <span>Payment Options:</span>
            <span className="px-1.5 py-0.5 bg-white border border-outline-variant/40 font-bold">Cash On Delivery</span>
            <span className="px-1.5 py-0.5 bg-white border border-outline-variant/40 font-bold">UPI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
