import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success('Welcome to the Precious Chic Nails family! 💅');
      setEmail('');
    }
  };

  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <h3 className="heading-display text-2xl tracking-[0.1em] mb-4">Precious Chic Nails</h3>
            <p className="text-xs tracking-wider leading-relaxed opacity-70 font-light">
              Handcrafted press-on nails designed for modern women who deserve elegance without the salon commitment.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="opacity-70 hover:opacity-100 transition-opacity"><Instagram size={18} /></a>
              <a href="#" className="opacity-70 hover:opacity-100 transition-opacity"><Facebook size={18} /></a>
              <a href="#" className="opacity-70 hover:opacity-100 transition-opacity"><Mail size={18} /></a>
            </div>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase mb-6 font-medium">Shop</h4>
            <ul className="space-y-3">
              <li><Link to="/collections/all" className="text-xs tracking-wider opacity-70 hover:opacity-100 transition-opacity font-light">New Arrivals</Link></li>
              <li><Link to="/collections/all" className="text-xs tracking-wider opacity-70 hover:opacity-100 transition-opacity font-light">Bestsellers</Link></li>
              <li><Link to="/collections/all" className="text-xs tracking-wider opacity-70 hover:opacity-100 transition-opacity font-light">All Collections</Link></li>
              <li><Link to="/gift-sets" className="text-xs tracking-wider opacity-70 hover:opacity-100 transition-opacity font-light">Gift Sets</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase mb-6 font-medium">Help</h4>
            <ul className="space-y-3">
              <li><Link to="/sizing-guide" className="text-xs tracking-wider opacity-70 hover:opacity-100 transition-opacity font-light">Sizing Guide</Link></li>
              <li><Link to="/shipping-returns" className="text-xs tracking-wider opacity-70 hover:opacity-100 transition-opacity font-light">Shipping & Returns</Link></li>
              <li><Link to="/faq" className="text-xs tracking-wider opacity-70 hover:opacity-100 transition-opacity font-light">FAQ</Link></li>
              <li><Link to="/contact" className="text-xs tracking-wider opacity-70 hover:opacity-100 transition-opacity font-light">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase mb-6 font-medium">Stay in the Loop</h4>
            <p className="text-xs tracking-wider opacity-70 mb-4 font-light">
              Be the first to know about new drops & exclusive offers.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email"
                type="email"
                className="bg-transparent border-background/30 text-background placeholder:text-background/50 text-xs rounded-full"
              />
              <Button type="submit" variant="outline" className="border-background/30 text-background text-xs tracking-wider hover:bg-background/10 rounded-full">
                Join
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-background/20 mt-12 pt-8 text-center">
          <p className="text-[10px] tracking-[0.2em] uppercase opacity-50 font-light">
            © 2026 Precious Chic Nails. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
