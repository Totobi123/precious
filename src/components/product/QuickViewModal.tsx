import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import type { Product } from '@/data/products';

interface QuickViewModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const sizes = ['XS', 'S', 'M', 'L', 'Custom'];

const QuickViewModal = ({ product, open, onOpenChange }: QuickViewModalProps) => {
  const [selectedSize, setSelectedSize] = useState('M');
  const { addItem } = useCart();

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="aspect-square">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="p-8 flex flex-col justify-center">
            <h2 className="heading-display text-2xl tracking-wider mb-2">{product.name}</h2>
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-xs ${i < Math.floor(product.rating) ? 'text-foreground' : 'text-muted-foreground/40'}`}>★</span>
              ))}
              <span className="text-xs text-muted-foreground ml-1">({product.reviewCount})</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-lg">${product.price}</span>
              {product.comparePrice && (
                <span className="text-sm text-muted-foreground line-through">${product.comparePrice}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed tracking-wider mb-6 font-light">
              {product.description}
            </p>
            <div className="mb-4">
              <p className="text-xs tracking-[0.15em] uppercase mb-2 font-medium">Size</p>
              <div className="flex gap-2">
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-10 h-10 text-xs border transition-colors ${
                      selectedSize === size
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border hover:border-foreground'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground tracking-wider mb-6">
              Shape: {product.shape} • Length: {product.length}
            </p>
            <Button
              className="btn-luxury w-full"
              onClick={() => {
                addItem(product, selectedSize);
                onOpenChange(false);
              }}
            >
              Add to Bag — ${product.price}
            </Button>
            <p className="text-[10px] text-muted-foreground text-center mt-3 tracking-wider">
              or 4 interest-free payments of ${(product.price / 4).toFixed(2)} with Afterpay
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickViewModal;
