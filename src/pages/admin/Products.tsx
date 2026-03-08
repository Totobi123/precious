import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Search, Plus, Pencil, Trash2, X } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Product = Tables<'products'>;

const emptyProduct: Partial<TablesInsert<'products'>> = {
  name: '',
  image: '',
  hover_image: '',
  shape: 'Coffin',
  length: 'Medium',
  color: '',
  price: 0,
  compare_price: null,
  description: '',
  category: '',
  slug: '',
  stock_level: 10,
  is_active: true,
  is_new: false,
  is_bestseller: false,
};

const shapes = ['Coffin', 'Stiletto', 'Almond', 'Square', 'Oval', 'Round', 'Ballerina'];
const lengths = ['Short', 'Medium', 'Long', 'Extra Long'];
const categories = ['Press-On Nails', 'Gel Nails', 'Acrylic', 'Nail Art', 'Gift Sets', 'Accessories'];

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const openCreate = () => {
    setForm(emptyProduct);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name,
      image: p.image,
      hover_image: p.hover_image || '',
      shape: p.shape,
      length: p.length,
      color: p.color,
      price: p.price,
      compare_price: p.compare_price,
      description: p.description || '',
      category: p.category || '',
      slug: p.slug,
      stock_level: p.stock_level ?? 0,
      is_active: p.is_active ?? true,
      is_new: p.is_new ?? false,
      is_bestseller: p.is_bestseller ?? false,
    });
    setEditingId(p.id);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.image || !form.color || !form.price) {
      toast.error('Please fill in all required fields (name, image, color, price)');
      return;
    }

    setSaving(true);
    const slug = form.slug || generateSlug(form.name || '');
    const payload = { ...form, slug } as TablesInsert<'products'>;

    if (editingId) {
      const { error } = await supabase.from('products').update(payload).eq('id', editingId);
      if (error) toast.error('Failed to update: ' + error.message);
      else { toast.success('Product updated!'); setModalOpen(false); fetchProducts(); }
    } else {
      const { error } = await supabase.from('products').insert(payload);
      if (error) toast.error('Failed to create: ' + error.message);
      else { toast.success('Product created!'); setModalOpen(false); fetchProducts(); }
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('products').delete().eq('id', deleteId);
    if (error) toast.error('Failed to delete: ' + error.message);
    else { toast.success('Product deleted'); fetchProducts(); }
    setDeleteId(null);
  };

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

  const setField = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="heading-display text-2xl tracking-wider">Products</h1>
          <p className="text-body text-muted-foreground mt-1">{products.length} products</p>
        </div>
        <Button className="btn-luxury flex items-center gap-2" onClick={openCreate}>
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
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-muted" />
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
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
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
          <div className="p-8 text-center text-muted-foreground text-sm">No products found. Click "Add Product" to get started.</div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="heading-display tracking-wider">
              {editingId ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs tracking-wider uppercase font-medium">Name *</Label>
              <Input value={form.name || ''} onChange={e => { setField('name', e.target.value); if (!editingId) setField('slug', generateSlug(e.target.value)); }} placeholder="Rose Gold Coffin Set" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs tracking-wider uppercase font-medium">Price *</Label>
              <Input type="number" step="0.01" value={form.price || ''} onChange={e => setField('price', parseFloat(e.target.value) || 0)} placeholder="29.99" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs tracking-wider uppercase font-medium">Compare Price</Label>
              <Input type="number" step="0.01" value={form.compare_price || ''} onChange={e => setField('compare_price', parseFloat(e.target.value) || null)} placeholder="39.99" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs tracking-wider uppercase font-medium">Shape *</Label>
              <Select value={form.shape || 'Coffin'} onValueChange={v => setField('shape', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {shapes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs tracking-wider uppercase font-medium">Length *</Label>
              <Select value={form.length || 'Medium'} onValueChange={v => setField('length', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {lengths.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs tracking-wider uppercase font-medium">Color *</Label>
              <Input value={form.color || ''} onChange={e => setField('color', e.target.value)} placeholder="Rose Gold" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs tracking-wider uppercase font-medium">Category</Label>
              <Select value={form.category || ''} onValueChange={v => setField('category', v)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs tracking-wider uppercase font-medium">Image URL *</Label>
              <Input value={form.image || ''} onChange={e => setField('image', e.target.value)} placeholder="https://example.com/image.jpg" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs tracking-wider uppercase font-medium">Hover Image URL</Label>
              <Input value={form.hover_image || ''} onChange={e => setField('hover_image', e.target.value)} placeholder="https://example.com/hover.jpg" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs tracking-wider uppercase font-medium">Description</Label>
              <Textarea value={form.description || ''} onChange={e => setField('description', e.target.value)} placeholder="A beautiful set of nails..." rows={3} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs tracking-wider uppercase font-medium">Slug</Label>
              <Input value={form.slug || ''} onChange={e => setField('slug', e.target.value)} placeholder="rose-gold-coffin-set" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs tracking-wider uppercase font-medium">Stock Level</Label>
              <Input type="number" value={form.stock_level ?? 0} onChange={e => setField('stock_level', parseInt(e.target.value) || 0)} />
            </div>

            <div className="flex items-center gap-6 md:col-span-2 pt-2">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active ?? true} onCheckedChange={v => setField('is_active', v)} />
                <Label className="text-xs tracking-wider">Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_new ?? false} onCheckedChange={v => setField('is_new', v)} />
                <Label className="text-xs tracking-wider">New</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_bestseller ?? false} onCheckedChange={v => setField('is_bestseller', v)} />
                <Label className="text-xs tracking-wider">Bestseller</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button className="btn-luxury" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this product. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Products;
