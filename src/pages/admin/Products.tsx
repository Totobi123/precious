import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const updateStock = async (id: string, stock: number) => {
    const { error } = await supabase.from('products').update({ stock_level: stock }).eq('id', id);
    if (error) toast.error('Failed to update stock');
    else { toast.success('Stock updated'); fetchProducts(); }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase()) ||
    p.shape.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="heading-display text-2xl tracking-wider">Products</h1>
          <p className="text-body text-muted-foreground mt-1">{products.length} products</p>
        </div>
        <Button className="btn-luxury flex items-center gap-2">
          <Plus size={16} /> Add Product
        </Button>
      </div>

      <div className="mb-4 relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 rounded-xl text-sm"
        />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-[11px] tracking-[0.12em] uppercase font-semibold p-4">Product</th>
              <th className="text-left text-[11px] tracking-[0.12em] uppercase font-semibold p-4 hidden md:table-cell">Shape</th>
              <th className="text-left text-[11px] tracking-[0.12em] uppercase font-semibold p-4 hidden md:table-cell">Length</th>
              <th className="text-left text-[11px] tracking-[0.12em] uppercase font-semibold p-4">Price</th>
              <th className="text-left text-[11px] tracking-[0.12em] uppercase font-semibold p-4">Stock</th>
              <th className="text-left text-[11px] tracking-[0.12em] uppercase font-semibold p-4 hidden lg:table-cell">Category</th>
              <th className="text-right text-[11px] tracking-[0.12em] uppercase font-semibold p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground">{p.color}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">{p.shape}</td>
                <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">{p.length}</td>
                <td className="p-4">
                  <span className="text-sm font-medium">${p.price}</span>
                  {p.compare_price && (
                    <span className="text-[11px] text-muted-foreground line-through ml-1">${p.compare_price}</span>
                  )}
                </td>
                <td className="p-4">
                  <Input
                    type="number"
                    value={p.stock_level ?? 0}
                    onChange={e => updateStock(p.id, parseInt(e.target.value) || 0)}
                    className="w-20 h-8 rounded-lg text-sm text-center"
                    min={0}
                  />
                </td>
                <td className="p-4 hidden lg:table-cell">
                  <Badge variant="secondary" className="text-[10px] tracking-wider uppercase">
                    {p.category || 'N/A'}
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>}
        {!loading && filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">No products found.</div>
        )}
      </div>
    </div>
  );
};

export default Products;
