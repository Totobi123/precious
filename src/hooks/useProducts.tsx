import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/data/products';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (data) {
        setProducts(data.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          comparePrice: p.compare_price ?? undefined,
          image: p.image,
          hoverImage: p.hover_image || p.image,
          images: p.images?.length ? p.images : [p.image],
          shape: p.shape,
          length: p.length,
          color: p.color,
          rating: p.rating ?? 0,
          reviewCount: p.review_count ?? 0,
          description: p.description || '',
          category: p.category || '',
          isNew: p.is_new ?? false,
          isBestseller: p.is_bestseller ?? false,
          slug: p.slug,
        })));
      }
      setLoading(false);
    };
    fetch();
  }, []);

  return { products, loading };
}
