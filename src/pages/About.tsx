import { motion } from 'framer-motion';
import { Heart, Sparkles, Leaf, Users } from 'lucide-react';

const values = [
  { icon: Heart, title: 'Made with Love', desc: 'Every set is hand-painted with care and attention to detail by our small team.' },
  { icon: Sparkles, title: 'Quality First', desc: 'We use premium materials that are gentle on your natural nails and last up to 5 wears.' },
  { icon: Leaf, title: 'Cruelty-Free', desc: 'All our products are 100% cruelty-free and made with non-toxic, vegan-friendly materials.' },
  { icon: Users, title: 'Community Driven', desc: 'Built by a student entrepreneur, supported by an amazing community of nail lovers.' },
];

const About = () => (
  <div className="pt-24 pb-20">
    {/* Hero */}
    <section className="text-center py-16 px-6">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="heading-display text-4xl md:text-5xl tracking-wider mb-4"
      >
        Our Story
      </motion.h1>
      <p className="text-body text-muted-foreground max-w-2xl mx-auto leading-relaxed">
        Precious Chic Nails was born from a simple belief: every woman deserves to feel confident and beautiful without spending hours at the salon.
      </p>
    </section>

    {/* Story */}
    <section className="max-w-4xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <motion.img
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          src="/images/products/nail-set-8.jpg"
          alt="Founder of Precious Chic Nails"
          className="w-full rounded-lg object-cover aspect-square"
        />
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="heading-display text-2xl md:text-3xl tracking-wider mb-6">Meet the Founder</h2>
          <p className="text-body text-muted-foreground leading-relaxed mb-4">
            As a student in Canada, I started Precious Chic Nails as a passion project that quickly grew into something bigger. I noticed that getting beautiful nails shouldn't require expensive salon visits or harsh chemicals.
          </p>
          <p className="text-body text-muted-foreground leading-relaxed mb-4">
            Each set is carefully designed and hand-painted with love, using only premium, non-toxic materials. Our press-on nails are reusable, easy to apply, and deliver salon-quality results in minutes.
          </p>
          <p className="text-body text-muted-foreground leading-relaxed">
            Thank you for supporting a small, student-owned Canadian business. Every order means the world to me! 💕
          </p>
        </motion.div>
      </div>
    </section>

    {/* Values */}
    <section className="bg-secondary py-16">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="heading-display text-3xl tracking-wider text-center mb-12">Our Values</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center">
                <v.icon size={24} strokeWidth={1.2} className="text-primary" />
              </div>
              <h3 className="text-xs tracking-[0.15em] uppercase font-semibold mb-2">{v.title}</h3>
              <p className="text-[11px] text-muted-foreground tracking-wider font-light leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default About;
