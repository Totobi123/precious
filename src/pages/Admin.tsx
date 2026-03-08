import { useState } from 'react';
import { products, type Product } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, DollarSign, TrendingUp, Eye, Pencil, Trash2, Plus, BarChart3 } from 'lucide-react';

const stats = [
  { label: 'Total Products', value: products.length.toString(), icon: Package, color: 'text-primary' },
  { label: 'Total Revenue', value: '$4,280', icon: DollarSign, color: 'text-green-600' },
  { label: 'Orders Today', value: '12', icon: TrendingUp, color: 'text-blue-600' },
  { label: 'Page Views', value: '1,847', icon: Eye, color: 'text-orange-600' },
];

const Admin = () => {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [productList, setProductList] = useState<Product[]>(products);

  const filtered = productList.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const deleteProduct = (id: string) => {
    setProductList(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="heading-display text-3xl tracking-wider">Admin Panel</h1>
            <p className="text-body text-muted-foreground mt-1">Manage your Precious Chic Nails store</p>
          </div>
          <Button className="btn-luxury flex items-center gap-2">
            <Plus size={16} /> Add Product
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="bg-card rounded-lg p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs tracking-[0.15em] uppercase text-muted-foreground font-medium">{s.label}</span>
                <s.icon size={18} className={s.color} />
              </div>
              <p className="heading-display text-2xl">{s.value}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="products">
          <TabsList className="mb-6">
            <TabsTrigger value="products" className="text-xs tracking-wider">Products</TabsTrigger>
            <TabsTrigger value="orders" className="text-xs tracking-wider">Orders</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs tracking-wider">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="mb-6">
              <Input
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="max-w-sm rounded-full text-sm"
              />
            </div>

            <div className="bg-card rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs tracking-[0.12em] uppercase font-semibold p-4">Product</th>
                    <th className="text-left text-xs tracking-[0.12em] uppercase font-semibold p-4 hidden md:table-cell">Shape</th>
                    <th className="text-left text-xs tracking-[0.12em] uppercase font-semibold p-4 hidden md:table-cell">Length</th>
                    <th className="text-left text-xs tracking-[0.12em] uppercase font-semibold p-4">Price</th>
                    <th className="text-left text-xs tracking-[0.12em] uppercase font-semibold p-4 hidden md:table-cell">Category</th>
                    <th className="text-left text-xs tracking-[0.12em] uppercase font-semibold p-4">Rating</th>
                    <th className="text-right text-xs tracking-[0.12em] uppercase font-semibold p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={p.image} alt={p.name} className="w-10 h-10 rounded object-cover" />
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
                        {p.comparePrice && (
                          <span className="text-[11px] text-muted-foreground line-through ml-1">${p.comparePrice}</span>
                        )}
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <Badge variant="secondary" className="text-[10px] tracking-wider uppercase">
                          {p.category}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm">⭐ {p.rating}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-1.5 rounded hover:bg-accent transition-colors"
                            onClick={() => setEditingId(p.id)}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors"
                            onClick={() => deleteProduct(p.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">No products found.</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="bg-card rounded-lg p-12 text-center">
              <BarChart3 size={48} className="mx-auto mb-4 text-muted-foreground/40" />
              <h3 className="heading-display text-xl tracking-wider mb-2">Orders Coming Soon</h3>
              <p className="text-body text-muted-foreground">Connect a backend to manage real orders and track fulfillment.</p>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="bg-card rounded-lg p-12 text-center">
              <TrendingUp size={48} className="mx-auto mb-4 text-muted-foreground/40" />
              <h3 className="heading-display text-xl tracking-wider mb-2">Analytics Coming Soon</h3>
              <p className="text-body text-muted-foreground">Enable Lovable Cloud to track real analytics and sales data.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
