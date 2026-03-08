import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems, setIsOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className="sticky top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md shadow-sm transition-all duration-500"
    >
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left nav links - desktop */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/collections/all" className="text-xs tracking-[0.2em] uppercase font-medium hover:opacity-60 transition-opacity">
            Shop All
          </Link>
          <Link to="/collections/all" className="text-xs tracking-[0.2em] uppercase font-medium hover:opacity-60 transition-opacity">
            Collections
          </Link>
          <Link to="/about" className="text-xs tracking-[0.2em] uppercase font-medium hover:opacity-60 transition-opacity">
            About
          </Link>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Center logo */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2">
          <h1 className="heading-display text-xl md:text-2xl tracking-[0.1em]">
            Precious Chic Nails
          </h1>
        </Link>

        {/* Right icons */}
        <div className="flex items-center gap-5">
          <button className="hover:opacity-60 transition-opacity">
            <Search size={18} strokeWidth={1.5} />
          </button>
          <Link to="/auth" className="hover:opacity-60 transition-opacity">
            <User size={18} strokeWidth={1.5} />
          </Link>
          <button className="relative hover:opacity-60 transition-opacity" onClick={() => setIsOpen(true)}>
            <ShoppingBag size={18} strokeWidth={1.5} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-t border-border"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              <Link to="/collections/all" className="text-xs tracking-[0.2em] uppercase font-medium" onClick={() => setMobileOpen(false)}>
                Shop All
              </Link>
              <Link to="/collections/all" className="text-xs tracking-[0.2em] uppercase font-medium" onClick={() => setMobileOpen(false)}>
                Collections
              </Link>
              <Link to="/about" className="text-xs tracking-[0.2em] uppercase font-medium" onClick={() => setMobileOpen(false)}>
                About
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
