import { useEffect, useState } from 'react';
import { api } from '@/integrations/superbase';
import { products as localProducts, type Product } from '@/data/products';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await api.data.getAll('products');

        if (data && data.length > 0) {
          // Filter for active products manually if backend doesn't support query params yet
          const activeOnly = data.filter((p: any) => p.is_active !== false);
          
          setProducts(activeOnly.map((p: any) => ({
            id: String(p.id),
            name: p.name,
            price: Number(p.price),
            comparePrice: p.compare_price ? Number(p.compare_price) : undefined,
            image: p.image,
            hoverImage: p.hover_image || p.image,
            images: p.images?.length ? p.images : [p.image],
            shape: p.shape,
            length: p.length,
            color: p.color,
            rating: p.rating ? Number(p.rating) : 0,
            reviewCount: p.review_count ? Number(p.review_count) : 0,
            description: p.description || '',
            category: p.category || '',
            isNew: Boolean(p.is_new),
            isBestseller: Boolean(p.is_bestseller),
            slug: p.slug,
          })));
        } else {
          setProducts(localProducts);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setProducts(localProducts);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { products, loading };
}
