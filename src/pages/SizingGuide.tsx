import { motion } from 'framer-motion';
import { Ruler, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const sizes = [
  { size: 'XS', width: '11-12mm' },
  { size: 'S', width: '13-14mm' },
  { size: 'M', width: '15-16mm' },
  { size: 'L', width: '17-18mm' },
  { size: 'XL', width: '19-20mm' },
];

const SizingGuide = () => (
  <div className="pt-24 pb-20">
    <section className="text-center py-16 px-6">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="heading-display text-4xl md:text-5xl tracking-wider mb-4"
      >
        Sizing Guide
      </motion.h1>
      <p className="text-body text-muted-foreground max-w-xl mx-auto">
        Getting the perfect fit is key to a flawless look. Here's how to find your size.
      </p>
    </section>

    <div className="max-w-3xl mx-auto px-6">
      {/* How to Measure */}
      <section className="mb-16">
        <h2 className="heading-display text-2xl tracking-wider mb-8 flex items-center gap-3">
          <Ruler size={24} className="text-primary" />
          How to Measure
        </h2>
        <div className="space-y-6 text-body text-muted-foreground leading-relaxed">
          <div className="bg-card rounded-lg p-6">
            <h3 className="text-xs tracking-[0.15em] uppercase font-semibold text-foreground mb-3">Step 1: Gather Your Tools</h3>
            <p>You'll need a flexible measuring tape or a strip of paper and a ruler.</p>
          </div>
          <div className="bg-card rounded-lg p-6">
            <h3 className="text-xs tracking-[0.15em] uppercase font-semibold text-foreground mb-3">Step 2: Measure Each Nail</h3>
            <p>Measure the widest part of each fingernail from edge to edge. Write down the measurement in millimeters.</p>
          </div>
          <div className="bg-card rounded-lg p-6">
            <h3 className="text-xs tracking-[0.15em] uppercase font-semibold text-foreground mb-3">Step 3: Match Your Size</h3>
            <p>Use the chart below to find the closest size for each nail. If you're between sizes, go one size up for comfort.</p>
          </div>
        </div>
      </section>

      {/* Size Chart */}
      <section className="mb-16">
        <h2 className="heading-display text-2xl tracking-wider mb-8">Size Chart</h2>
        <div className="bg-card rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs tracking-[0.15em] uppercase font-semibold p-4">Size</th>
                <th className="text-left text-xs tracking-[0.15em] uppercase font-semibold p-4">Nail Width</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map(s => (
                <tr key={s.size} className="border-b border-border last:border-0">
                  <td className="p-4 text-sm font-medium">{s.size}</td>
                  <td className="p-4 text-sm text-muted-foreground">{s.width}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Sizing Kit CTA */}
      <section className="text-center bg-secondary rounded-lg p-12">
        <Package size={32} className="mx-auto mb-4 text-primary" />
        <h2 className="heading-display text-2xl tracking-wider mb-3">Not Sure? Order a Sizing Kit</h2>
        <p className="text-body text-muted-foreground mb-6 max-w-md mx-auto">
          Our sizing kit includes sample nails in every size so you can try before you buy. Just $5, refunded with your first order!
        </p>
        <Link to="/collections/all">
          <Button className="btn-luxury">Order Sizing Kit — $5</Button>
        </Link>
      </section>
    </div>
  </div>
);

export default SizingGuide;
