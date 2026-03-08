import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import ProductCard from '@/components/product/ProductCard';
import QuickViewModal from '@/components/product/QuickViewModal';
import { useProducts } from '@/hooks/useProducts';
import type { Product } from '@/data/products';

const shapes = ['Almond', 'Coffin', 'Square', 'Stiletto', 'Oval'] as const;
const lengths = ['Short', 'Medium', 'Long', 'Extra Long'] as const;
const priceRanges = [
  { label: 'Under $35', min: 0, max: 35 },
  { label: '$35 - $40', min: 35, max: 40 },
  { label: '$40+', min: 40, max: 999 },
];

const Collections = () => {
  const { products, loading } = useProducts();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedShapes, setSelectedShapes] = useState<string[]>([]);
  const [selectedLengths, setSelectedLengths] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(8);

  const toggleFilter = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (selectedShapes.length && !selectedShapes.includes(p.shape)) return false;
      if (selectedLengths.length && !selectedLengths.includes(p.length)) return false;
      if (selectedPriceRange !== null) {
        const range = priceRanges[selectedPriceRange];
        if (p.price < range.min || p.price > range.max) return false;
      }
      return true;
    });
  }, [products, selectedShapes, selectedLengths, selectedPriceRange]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const clearFilters = () => {
    setSelectedShapes([]);
    setSelectedLengths([]);
    setSelectedPriceRange(null);
  };

  const activeFilterCount = selectedShapes.length + selectedLengths.length + (selectedPriceRange !== null ? 1 : 0);

  return (
    <div className="pt-24 pb-20">
      {/* Header */}
      <div className="text-center py-12 px-6">
        <h1 className="heading-display text-4xl md:text-5xl tracking-wider mb-3">All Collections</h1>
        <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-light">
          {loading ? '...' : `${filtered.length} ${filtered.length === 1 ? 'design' : 'designs'}`}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Filter toggle */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase font-medium"
          >
            <SlidersHorizontal size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-primary text-primary-foreground text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="text-xs tracking-wider text-muted-foreground underline">
              Clear all
            </button>
          )}
        </div>

        <div className="flex gap-8">
          {/* Filter sidebar */}
          {showFilters && (
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-56 shrink-0 hidden md:block"
            >
              {/* Shape */}
              <div className="mb-8">
                <h3 className="text-xs tracking-[0.15em] uppercase font-medium mb-4">Shape</h3>
                <div className="space-y-3">
                  {shapes.map(shape => (
                    <label key={shape} className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={selectedShapes.includes(shape)}
                        onCheckedChange={() => toggleFilter(selectedShapes, shape, setSelectedShapes)}
                      />
                      <span className="text-xs tracking-wider font-light">{shape}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Length */}
              <div className="mb-8">
                <h3 className="text-xs tracking-[0.15em] uppercase font-medium mb-4">Length</h3>
                <div className="space-y-3">
                  {lengths.map(length => (
                    <label key={length} className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={selectedLengths.includes(length)}
                        onCheckedChange={() => toggleFilter(selectedLengths, length, setSelectedLengths)}
                      />
                      <span className="text-xs tracking-wider font-light">{length}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="mb-8">
                <h3 className="text-xs tracking-[0.15em] uppercase font-medium mb-4">Price</h3>
                <div className="space-y-3">
                  {priceRanges.map((range, i) => (
                    <label key={range.label} className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={selectedPriceRange === i}
                        onCheckedChange={() => setSelectedPriceRange(selectedPriceRange === i ? null : i)}
                      />
                      <span className="text-xs tracking-wider font-light">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </motion.aside>
          )}

          {/* Product grid */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-20 text-sm text-muted-foreground">Loading products...</div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {visible.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={setQuickViewProduct}
                    />
                  ))}
                </div>

                {/* Load more */}
                {hasMore && (
                  <div className="text-center mt-12">
                    <Button
                      variant="outline"
                      className="text-xs tracking-[0.2em] uppercase px-10 py-5 border-foreground"
                      onClick={() => setVisibleCount(prev => prev + 8)}
                    >
                      Load More
                    </Button>
                  </div>
                )}

                {filtered.length === 0 && (
                  <div className="text-center py-20">
                    <p className="text-sm text-muted-foreground tracking-wider">No products found.</p>
                    <button onClick={clearFilters} className="mt-4 text-xs underline tracking-wider">
                      Clear filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={() => setShowFilters(false)}>
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="absolute left-0 top-0 bottom-0 w-72 bg-background p-6 overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-sm tracking-[0.15em] uppercase font-medium">Filters</h2>
              <button onClick={() => setShowFilters(false)}><X size={18} /></button>
            </div>

            <div className="mb-8">
              <h3 className="text-xs tracking-[0.15em] uppercase font-medium mb-4">Shape</h3>
              <div className="space-y-3">
                {shapes.map(shape => (
                  <label key={shape} className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={selectedShapes.includes(shape)}
                      onCheckedChange={() => toggleFilter(selectedShapes, shape, setSelectedShapes)}
                    />
                    <span className="text-xs tracking-wider font-light">{shape}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xs tracking-[0.15em] uppercase font-medium mb-4">Length</h3>
              <div className="space-y-3">
                {lengths.map(length => (
                  <label key={length} className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={selectedLengths.includes(length)}
                      onCheckedChange={() => toggleFilter(selectedLengths, length, setSelectedLengths)}
                    />
                    <span className="text-xs tracking-wider font-light">{length}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xs tracking-[0.15em] uppercase font-medium mb-4">Price</h3>
              <div className="space-y-3">
                {priceRanges.map((range, i) => (
                  <label key={range.label} className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={selectedPriceRange === i}
                      onCheckedChange={() => setSelectedPriceRange(selectedPriceRange === i ? null : i)}
                    />
                    <span className="text-xs tracking-wider font-light">{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button className="w-full btn-luxury" onClick={() => setShowFilters(false)}>
              Show Results
            </Button>
          </motion.div>
        </div>
      )}

      <QuickViewModal
        product={quickViewProduct}
        open={!!quickViewProduct}
        onOpenChange={(open) => !open && setQuickViewProduct(null)}
      />
    </div>
  );
};

export default Collections;
