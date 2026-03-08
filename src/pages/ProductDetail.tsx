import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Ruler, Truck, RotateCcw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/data/products';

const sizes = ['XS', 'S', 'M', 'L', 'Custom'];

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [sizingGuideOpen, setSizingGuideOpen] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    const fetch = async () => {
      // Try by slug first, then by id
      let { data } = await supabase.from('products').select('*').eq('slug', id || '').maybeSingle();
      if (!data) {
        const res = await supabase.from('products').select('*').eq('id', id || '').maybeSingle();
        data = res.data;
      }
      if (data) {
        setProduct({
          id: data.id,
          name: data.name,
          price: data.price,
          comparePrice: data.compare_price ?? undefined,
          image: data.image,
          hoverImage: data.hover_image || data.image,
          images: data.images?.length ? data.images : [data.image],
          shape: data.shape,
          length: data.length,
          color: data.color,
          rating: data.rating ?? 0,
          reviewCount: data.review_count ?? 0,
          description: data.description || '',
          category: data.category || '',
          isNew: data.is_new ?? false,
          isBestseller: data.is_bestseller ?? false,
          slug: data.slug,
        });
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="pt-32 text-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 text-center">
        <p>Product not found.</p>
        <Link to="/collections/all" className="underline text-sm mt-4 inline-block">Back to shop</Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <Link to="/collections/all" className="inline-flex items-center gap-1 text-xs tracking-wider text-muted-foreground mb-8 hover:text-foreground transition-colors">
          <ChevronLeft size={14} /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          <div className="flex gap-4">
            <div className="hidden md:flex flex-col gap-3 w-20 shrink-0">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)} className={`aspect-square overflow-hidden border-2 transition-colors ${selectedImage === i ? 'border-foreground' : 'border-transparent'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <motion.div key={selectedImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 aspect-square overflow-hidden bg-secondary">
              <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            </motion.div>
          </div>

          <div className="md:py-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              {product.isNew && <span className="text-[10px] tracking-[0.15em] uppercase bg-primary text-primary-foreground px-2 py-1 mb-4 inline-block">New Arrival</span>}
              <h1 className="heading-display text-3xl md:text-4xl tracking-wider mt-2 mb-2">{product.name}</h1>
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-sm ${i < Math.floor(product.rating) ? 'text-foreground' : 'text-muted-foreground/40'}`}>★</span>
                ))}
                <span className="text-xs text-muted-foreground ml-2">({product.reviewCount} reviews)</span>
              </div>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-2xl">${product.price}</span>
                {product.comparePrice && <span className="text-base text-muted-foreground line-through">${product.comparePrice}</span>}
              </div>
              <p className="text-[11px] text-muted-foreground tracking-wider mb-6">or 4 interest-free payments of ${(product.price / 4).toFixed(2)} with <strong>Afterpay</strong></p>
              <p className="text-xs text-muted-foreground leading-relaxed tracking-wider mb-8 font-light">{product.description}</p>
              <div className="flex gap-6 text-xs text-muted-foreground tracking-wider mb-8">
                <span>Shape: <strong className="text-foreground">{product.shape}</strong></span>
                <span>Length: <strong className="text-foreground">{product.length}</strong></span>
              </div>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs tracking-[0.15em] uppercase font-medium">Size</p>
                  <button onClick={() => setSizingGuideOpen(true)} className="text-xs tracking-wider text-muted-foreground underline flex items-center gap-1"><Ruler size={12} /> Sizing Guide</button>
                </div>
                <div className="flex gap-2">
                  {sizes.map(size => (
                    <button key={size} onClick={() => setSelectedSize(size)} className={`h-11 px-5 text-xs border tracking-wider transition-colors ${selectedSize === size ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-foreground'}`}>{size}</button>
                  ))}
                </div>
              </div>
              <Button className="btn-luxury w-full py-6 text-sm" onClick={() => addItem(product, selectedSize)}>Add to Bag — ${product.price}</Button>
              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-border">
                {[{ icon: Truck, text: 'Free Shipping $75+' }, { icon: RotateCcw, text: '30-Day Returns' }, { icon: Shield, text: 'Secure Checkout' }].map(badge => (
                  <div key={badge.text} className="text-center">
                    <badge.icon size={18} strokeWidth={1} className="mx-auto mb-2 text-muted-foreground" />
                    <p className="text-[10px] tracking-wider text-muted-foreground font-light">{badge.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 md:hidden z-40">
        <Button className="btn-luxury w-full py-4" onClick={() => addItem(product, selectedSize)}>Add to Bag — ${product.price}</Button>
      </div>

      <Dialog open={sizingGuideOpen} onOpenChange={setSizingGuideOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="heading-display text-xl tracking-wider">Sizing Guide</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-xs tracking-wider text-muted-foreground font-light">Measure the widest part of each nail bed in millimeters.</p>
            <div className="border border-border">
              <div className="grid grid-cols-6 text-xs tracking-wider text-center">
                <div className="p-3 bg-secondary font-medium">Size</div>
                <div className="p-3 bg-secondary font-medium">Thumb</div>
                <div className="p-3 bg-secondary font-medium">Index</div>
                <div className="p-3 bg-secondary font-medium">Middle</div>
                <div className="p-3 bg-secondary font-medium">Ring</div>
                <div className="p-3 bg-secondary font-medium">Pinky</div>
                {[['XS','13','11','12','10','8'],['S','14','12','13','11','9'],['M','15','13','14','12','10'],['L','17','14','15','13','11']].map(row => row.map((cell, i) => (
                  <div key={`${row[0]}-${i}`} className={`p-3 border-t border-border ${i === 0 ? 'font-medium' : 'text-muted-foreground font-light'}`}>{cell}{i > 0 ? 'mm' : ''}</div>
                )))}
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground tracking-wider font-light">Need a custom size? Select "Custom" and enter your measurements at checkout.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDetail;
