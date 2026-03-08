import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Instagram, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name && form.email && form.message) {
      toast.success('Message sent! We\'ll get back to you within 24 hours 💌');
      setForm({ name: '', email: '', message: '' });
    }
  };

  return (
    <div className="pt-24 pb-20">
      <section className="text-center py-16 px-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="heading-display text-4xl md:text-5xl tracking-wider mb-4"
        >
          Contact Us
        </motion.h1>
        <p className="text-body text-muted-foreground max-w-xl mx-auto">
          We'd love to hear from you! Reach out anytime.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs tracking-[0.15em] uppercase font-medium block mb-2">Name</label>
            <Input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
              className="rounded-full text-sm"
              required
            />
          </div>
          <div>
            <label className="text-xs tracking-[0.15em] uppercase font-medium block mb-2">Email</label>
            <Input
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com"
              type="email"
              className="rounded-full text-sm"
              required
            />
          </div>
          <div>
            <label className="text-xs tracking-[0.15em] uppercase font-medium block mb-2">Message</label>
            <Textarea
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              placeholder="Tell us what's on your mind..."
              rows={5}
              className="rounded-xl text-sm"
              required
            />
          </div>
          <Button type="submit" className="btn-luxury w-full">Send Message</Button>
        </form>

        {/* Contact Info */}
        <div className="space-y-8">
          <div className="bg-card rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <Mail size={20} className="text-primary" />
              <h3 className="text-xs tracking-[0.15em] uppercase font-semibold">Email</h3>
            </div>
            <p className="text-body text-muted-foreground">hello@preciouschicnails.com</p>
          </div>
          <div className="bg-card rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <Instagram size={20} className="text-primary" />
              <h3 className="text-xs tracking-[0.15em] uppercase font-semibold">Instagram</h3>
            </div>
            <p className="text-body text-muted-foreground">@preciouschicnails</p>
          </div>
          <div className="bg-card rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <MessageCircle size={20} className="text-primary" />
              <h3 className="text-xs tracking-[0.15em] uppercase font-semibold">Response Time</h3>
            </div>
            <p className="text-body text-muted-foreground">We typically respond within 24 hours.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
