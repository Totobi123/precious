import { motion } from 'framer-motion';
import { Truck, RefreshCw, Clock, MapPin } from 'lucide-react';

const ShippingReturns = () => (
  <div className="pt-24 pb-20">
    <section className="text-center py-16 px-6">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="heading-display text-4xl md:text-5xl tracking-wider mb-4"
      >
        Shipping & Returns
      </motion.h1>
      <p className="text-body text-muted-foreground max-w-xl mx-auto">
        Everything you need to know about getting your nails to your door.
      </p>
    </section>

    <div className="max-w-3xl mx-auto px-6 space-y-12">
      <section className="bg-card rounded-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Truck size={24} className="text-primary" />
          <h2 className="heading-display text-2xl tracking-wider">Shipping</h2>
        </div>
        <div className="space-y-4 text-body text-muted-foreground leading-relaxed">
          <p><strong className="text-foreground">Standard Shipping (Canada):</strong> Free on orders over $50. Otherwise $5.99. Delivered in 5–7 business days.</p>
          <p><strong className="text-foreground">Express Shipping (Canada):</strong> $12.99. Delivered in 2–3 business days.</p>
          <p><strong className="text-foreground">US Shipping:</strong> $9.99 flat rate. Delivered in 7–10 business days.</p>
          <p><strong className="text-foreground">International:</strong> Starting at $14.99. Delivery times vary by location.</p>
        </div>
      </section>

      <section className="bg-card rounded-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Clock size={24} className="text-primary" />
          <h2 className="heading-display text-2xl tracking-wider">Processing Time</h2>
        </div>
        <p className="text-body text-muted-foreground leading-relaxed">
          All orders are handmade to order. Please allow 3–5 business days for processing before shipping. During peak seasons or sales, processing may take up to 7 days.
        </p>
      </section>

      <section className="bg-card rounded-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <RefreshCw size={24} className="text-primary" />
          <h2 className="heading-display text-2xl tracking-wider">Returns & Exchanges</h2>
        </div>
        <div className="space-y-4 text-body text-muted-foreground leading-relaxed">
          <p>Because our nails are handmade, we cannot accept returns on used items. However, we want you to love your nails!</p>
          <p><strong className="text-foreground">Damaged Items:</strong> If your nails arrive damaged, contact us within 48 hours with photos and we'll send a replacement.</p>
          <p><strong className="text-foreground">Wrong Size:</strong> If you ordered the wrong size, reach out within 7 days of delivery and we'll work with you to exchange.</p>
          <p><strong className="text-foreground">Defective Products:</strong> We stand behind our quality. If you experience any defects, we'll replace your set free of charge.</p>
        </div>
      </section>

      <section className="bg-card rounded-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <MapPin size={24} className="text-primary" />
          <h2 className="heading-display text-2xl tracking-wider">Order Tracking</h2>
        </div>
        <p className="text-body text-muted-foreground leading-relaxed">
          You'll receive a tracking number via email once your order ships. You can track your package anytime using the link provided.
        </p>
      </section>
    </div>
  </div>
);

export default ShippingReturns;
