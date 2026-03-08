import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/product/ProductCard';
import QuickViewModal from '@/components/product/QuickViewModal';
import { products, type Product } from '@/data/products';
import { useCart } from '@/contexts/CartContext';

const giftBundles = [
  { name: 'The Essentials Bundle', desc: '3 of our best-selling sets at a special price.', price: 99, comparePrice: 120 },
  { name: 'The Luxe Collection', desc: '5 premium sets + a velvet storage case.', price: 175, comparePrice: 220 },
  { name: 'The Starter Kit', desc: '2 sets + sizing kit + application tools.', price: 79, comparePrice: 95 },
];

const GiftSets = () => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const { addItem } = useCart();
  const featured = products.filter(p => p.isBestseller).slice(0, 4);

  return (
    <div className="pt-24 pb-20">
      <section className="text-center py-16 px-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="heading-display text-4xl md:text-5xl tracking-wider mb-4"
        >
          Gift Sets
        </motion.h1>
        <p className="text-body text-muted-foreground max-w-xl mx-auto">
          The perfect gift for the nail lover in your life. Beautifully packaged and ready to give.
        </p>
      </section>

      {/* Gift Bundles */}
      <section className="max-w-5xl mx-auto px-6 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {giftBundles.map((bundle, i) => (
            <motion.div
              key={bundle.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-lg p-8 text-center"
            >
              <Gift size={32} className="mx-auto mb-4 text-primary" />
              <h3 className="heading-display text-xl tracking-wider mb-2">{bundle.name}</h3>
              <p className="text-body text-muted-foreground mb-4">{bundle.desc}</p>
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="heading-display text-2xl">${bundle.price}</span>
                {bundle.comparePrice && (
                  <span className="text-xs text-muted-foreground line-through">${bundle.comparePrice}</span>
                )}
              </div>
              <Button className="btn-luxury w-full">Add to Cart</Button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Popular picks */}
      <section className="max-w-5xl mx-auto px-6">
        <h2 className="heading-display text-2xl tracking-wider text-center mb-8">Popular Picks for Gifting</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {featured.map(product => (
            <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
          ))}
        </div>
      </section>

      <QuickViewModal
        product={quickViewProduct}
        open={!!quickViewProduct}
        onOpenChange={(open) => !open && setQuickViewProduct(null)}
      />
    </div>
  );
};

export default GiftSets;
