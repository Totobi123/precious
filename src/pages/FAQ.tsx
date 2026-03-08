import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  { q: 'How long do the press-on nails last?', a: 'With proper application and care, our press-on nails can last 1–2 weeks. They are also reusable for up to 5 wears!' },
  { q: 'How do I apply the press-on nails?', a: 'Clean your nails, push back cuticles, buff the nail surface lightly, apply the glue or adhesive tab, press firmly for 30 seconds per nail. Full instructions are included with every set.' },
  { q: 'How do I remove the nails safely?', a: 'Soak your nails in warm soapy water for 10–15 minutes. Gently lift from the sides using a cuticle pusher. Never force or pull them off.' },
  { q: 'Are the nails reusable?', a: 'Yes! Our nails are made from premium materials and can be reused up to 5 times. Simply remove any remaining adhesive after each wear.' },
  { q: 'What sizes are available?', a: 'Each set comes with 24 nails in 12 sizes (2 of each) to fit most nail shapes. We also offer custom sizing — check our Sizing Guide for details.' },
  { q: 'Are the products cruelty-free and vegan?', a: 'Absolutely! All our products are 100% cruelty-free, vegan-friendly, and made with non-toxic materials.' },
  { q: 'Do you ship internationally?', a: 'Yes! We ship across Canada, the US, and internationally. Check our Shipping & Returns page for rates and delivery times.' },
  { q: 'Can I request a custom design?', a: 'We love custom orders! DM us on Instagram @preciouschicnails or email us at hello@preciouschicnails.com to discuss your dream set.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, debit cards, Apple Pay, Google Pay, and PayPal.' },
  { q: 'Do you offer gift cards?', a: 'Yes! Gift cards are available in various denominations. Perfect for nail lovers!' },
];

const FAQ = () => (
  <div className="pt-24 pb-20">
    <section className="text-center py-16 px-6">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="heading-display text-4xl md:text-5xl tracking-wider mb-4"
      >
        FAQ
      </motion.h1>
      <p className="text-body text-muted-foreground max-w-xl mx-auto">
        Got questions? We've got answers.
      </p>
    </section>

    <div className="max-w-2xl mx-auto px-6">
      <Accordion type="single" collapsible className="space-y-2">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="bg-card rounded-lg px-6 border-none">
            <AccordionTrigger className="text-sm tracking-wider font-medium py-5 hover:no-underline">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-body text-muted-foreground leading-relaxed pb-5">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </div>
);

export default FAQ;
