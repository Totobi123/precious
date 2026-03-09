import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Plus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import type { Product } from '@/data/products';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

const ProductCard = ({ product, onQuickView }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addItem } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-secondary mb-3">
          {/* Primary image */}
          <img
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              isHovered && product.hoverImage ? 'opacity-0' : 'opacity-100'
            }`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
          {/* Hover image */}
          {product.hoverImage && (
            <img
              src={product.hoverImage}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.isNew && (
              <span className="bg-primary text-primary-foreground text-[9px] tracking-[0.15em] uppercase px-2 py-1">
                New
              </span>
            )}
            {product.isBestseller && (
              <span className="bg-foreground text-background text-[9px] tracking-[0.15em] uppercase px-2 py-1">
                Bestseller
              </span>
            )}
            {product.comparePrice && (
              <span className="bg-destructive text-destructive-foreground text-[9px] tracking-[0.15em] uppercase px-2 py-1">
                Sale
              </span>
            )}
          </div>

          {/* Hover actions */}
          <div
            className={`absolute bottom-0 left-0 right-0 p-3 flex gap-2 transition-all duration-300 ${
              isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                addItem(product, 'M');
              }}
              className="flex-1 bg-primary text-primary-foreground py-2.5 text-[10px] tracking-[0.15em] uppercase flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Plus size={12} /> Quick Add
            </button>
            {onQuickView && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onQuickView(product);
                }}
                className="bg-background text-foreground p-2.5 hover:opacity-80 transition-opacity"
              >
                <Eye size={14} />
              </button>
            )}
          </div>
        </div>
      </Link>

      {/* Product info */}
      <div className="space-y-1">
        <h3 className="text-sm tracking-wider font-medium">{product.name}</h3>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={`text-[10px] ${i < Math.floor(product.rating) ? 'text-foreground' : 'text-muted-foreground/40'}`}>★</span>
          ))}
          <span className="text-[10px] text-muted-foreground ml-1">({product.reviewCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">${product.price}</span>
          {product.comparePrice && (
            <span className="text-xs text-muted-foreground line-through">${product.comparePrice}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
