import { useEffect, useState } from 'react';
import { api } from '@/integrations/superbase';
import type { Product } from '@/data/products';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await api.data.getAll('products');

        if (data) {
          // Filter for active products manually if backend doesn't support query params yet
          const activeOnly = data.filter((p: any) => p.is_active !== false);
          
          setProducts(activeOnly.map((p: any) => ({
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
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { products, loading };
}
