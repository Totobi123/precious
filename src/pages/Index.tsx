import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gem, RotateCcw, Ruler, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/product/ProductCard';
import QuickViewModal from '@/components/product/QuickViewModal';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import type { Product } from '@/data/products';

const valueProps = [
  { icon: Gem, title: 'Handmade in Canada', desc: 'Each set is carefully hand-painted by our artisans with premium materials' },
  { icon: RotateCcw, title: 'Reusable up to 5 Wears', desc: 'High-quality construction means you can enjoy your nails again and again' },
  { icon: Ruler, title: 'Custom Sizing Available', desc: 'Order a sizing kit for a perfect fit every single time' },
  { icon: Heart, title: 'Student-Owned Small Business', desc: 'Supporting a passionate student entrepreneur building with love' },
];

const steps = [
  { num: '1', title: 'Choose Your Set', desc: 'Browse our collection and find your perfect style' },
  { num: '2', title: 'Select Your Size', desc: 'Use our sizing kit or measure at home for perfect fit' },
  { num: '3', title: 'Apply & Shine', desc: 'Easy application in minutes — salon results at home' },
];

const Index = () => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const { addItem } = useCart();
  const { products, loading } = useProducts();
  const bestsellers = products.filter(p => p.isBestseller).slice(0, 4);
  const featured = bestsellers.length >= 4 ? bestsellers : products.slice(0, 4);

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen bg-accent">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 items-center min-h-screen gap-8 pb-12 md:pb-0">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8, delay: 0.2 }} 
            className="pt-8 md:pt-0 order-2 md:order-1"
          >
            <h2 className="heading-display text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
              Elevated Press-On Nails for Effortless Confidence
            </h2>
            <p className="text-body text-muted-foreground mb-8 max-w-md">
              Handcrafted. Reusable. Custom Sized. Designed for modern women who deserve elegance without the salon commitment.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Link to="/collections/all"><Button className="btn-luxury">Shop the Collection</Button></Link>
              <Link to="/collections/all" className="text-xs tracking-[0.15em] uppercase font-medium underline underline-offset-4 hover:opacity-60 transition-opacity">Find Your Size</Link>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8, delay: 0.4 }} 
            className="order-1 md:order-2 mt-20 md:mt-0"
          >
            <img 
              src="/images/hero-nails.jpg" 
              alt="Precious Chic Nails luxury press-on nails" 
              className="w-full h-[50vh] md:h-[80vh] object-cover rounded-xl md:rounded-bl-[80px]"
              fetchpriority="high"
              loading="eager"
            />
          </motion.div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="heading-display text-3xl md:text-4xl tracking-wider mb-3">Best Sellers</h2>
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-light">Our most-loved designs</p>
        </div>
        {loading ? (
          <div className="text-center text-sm text-muted-foreground py-12">Loading products...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featured.map(product => (
              <div key={product.id} className="group">
                <div className="bg-card rounded-lg overflow-hidden">
                  <ProductCard product={product} onQuickView={setQuickViewProduct} />
                </div>
                <div className="mt-3 text-center">
                  <Button variant="outline" size="sm" className="text-[10px] tracking-[0.15em] uppercase rounded-full border-foreground/30 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all" onClick={() => addItem(product, 'M')}>
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="text-center mt-12">
          <Link to="/collections/all">
            <Button variant="outline" className="text-xs tracking-[0.2em] uppercase px-10 py-5 rounded-full border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors">View All</Button>
          </Link>
        </div>
      </section>

      {/* Why Precious Chic Nails? */}
      <section className="bg-secondary py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="heading-display text-3xl md:text-4xl tracking-wider text-center mb-12">Why Precious Chic Nails?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {valueProps.map((prop, i) => (
              <motion.div key={prop.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center">
                  <prop.icon size={24} strokeWidth={1.2} className="text-primary" />
                </div>
                <h3 className="text-xs tracking-[0.15em] uppercase font-semibold mb-2">{prop.title}</h3>
                <p className="text-[11px] text-muted-foreground tracking-wider font-light leading-relaxed">{prop.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Salon-Level Nails in Minutes */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="heading-display text-3xl md:text-4xl tracking-wider mb-10">Salon-Level Nails<br />in Minutes</h2>
              <div className="grid grid-cols-3 gap-6">
                {steps.map((step, i) => (
                  <motion.div key={step.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.15 }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="heading-display text-2xl font-semibold text-primary">{step.num}</span>
                      <div className="h-[1px] flex-1 bg-border" />
                    </div>
                    <h4 className="text-xs tracking-[0.1em] uppercase font-semibold mb-2">{step.title}</h4>
                    <p className="text-[11px] text-muted-foreground tracking-wider font-light leading-relaxed">{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="grid grid-cols-2 gap-4">
              <div className="space-y-4"><img src="/images/products/nail-set-2.jpg" alt="Nail application" className="w-full rounded-lg object-cover aspect-[3/4]" /></div>
              <div className="space-y-4 pt-8"><img src="/images/products/nail-set-6.jpg" alt="Beautiful nails result" className="w-full rounded-lg object-cover aspect-[3/4]" /></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Meet the Founder */}
      <section className="bg-card py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <img src="/images/products/nail-set-8.jpg" alt="Founder" className="w-full rounded-lg object-cover aspect-square" />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
              <h2 className="heading-display text-3xl md:text-4xl tracking-wider mb-6">Meet the Founder</h2>
              <p className="text-body text-muted-foreground leading-relaxed mb-4">
                I'm building Precious Chic Nails as a student entrepreneurship project with big goals. I wanted to create elegant, press-on nails that are accessible and affordable for women who love beauty.
              </p>
              <p className="text-body text-muted-foreground leading-relaxed">
                Each set is designed with care for confident, effortless beauty. Thank you for supporting a small, student-owned business! 💕
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <QuickViewModal product={quickViewProduct} open={!!quickViewProduct} onOpenChange={(open) => !open && setQuickViewProduct(null)} />
    </>
  );
};

export default Index;
