import { useEffect, useState, useRef } from 'react';
import { api } from '@/integrations/superbase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Search, Plus, Pencil, Trash2, X, Upload } from 'lucide-react';
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

const emptyProduct: any = {
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
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [hoverImagePreview, setHoverImagePreview] = useState<string | null>(null);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const hoverImageInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    try {
      const data = await api.data.getAll('products');
      if (data) setProducts(data);
    } catch (err) {
      console.error('Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const openCreate = () => {
    setForm(emptyProduct);
    setEditingId(null);
    setImagePreview(null);
    setHoverImagePreview(null);
    setModalOpen(true);
  };

  const openEdit = (p: any) => {
    setForm({ ...p });
    setEditingId(p.id);
    setImagePreview(p.image);
    setHoverImagePreview(p.hover_image || null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || (!form.image && !imagePreview) || !form.color || !form.price) {
      toast.error('Please fill in all required fields (name, image, color, price)');
      return;
    }

    setSaving(true);
    try {
      const imageUrl = imagePreview || form.image;
      const hoverImageUrl = hoverImagePreview || form.hover_image;
      const slug = form.slug || generateSlug(form.name || '');
      
      const payload = { 
        ...form, 
        slug, 
        image: imageUrl, 
        hover_image: hoverImageUrl 
      };

      if (editingId) {
        await api.data.update('products', editingId, payload);
        toast.success('Product updated!');
      } else {
        await api.data.create('products', payload);
        toast.success('Product created!');
      }
      
      setModalOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast.error('Operation failed: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'hover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File is too large. Max 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'main') {
        setImagePreview(reader.result as string);
      } else {
        setHoverImagePreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.data.delete('products', deleteId);
      toast.success('Product deleted'); 
      fetchProducts();
    } catch (err: any) {
      toast.error('Failed to delete: ' + err.message);
    }
    setDeleteId(null);
  };

  const updateStock = async (id: string, stock: number) => {
    try {
      await api.data.update('products', id, { stock_level: stock });
      toast.success('Stock updated'); 
      fetchProducts();
    } catch (err: any) {
      toast.error('Failed to update stock');
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase()) ||
    p.shape.toLowerCase().includes(search.toLowerCase())
  );

  const setField = (key: string, value: any) => setForm((prev: any) => ({ ...prev, [key]: value }));

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
              <Label className="text-xs tracking-wider uppercase font-medium">Main Image *</Label>
              <div className="flex flex-col gap-3">
                {imagePreview && (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border bg-muted">
                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                    <button 
                      onClick={() => { setImagePreview(null); setField('image', ''); }}
                      className="absolute top-2 right-2 p-1 bg-background/80 rounded-full hover:bg-background transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => handleFileChange(e, 'main')}
                    className="hidden" 
                    ref={imageInputRef}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full flex items-center gap-2 border-dashed h-20"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <Upload size={16} />
                    <span>{imagePreview ? 'Change Image' : 'Upload Main Image'}</span>
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">or URL</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <Input 
                  value={form.image || ''} 
                  onChange={e => {
                    setField('image', e.target.value);
                    setImagePreview(e.target.value);
                  }} 
                  placeholder="https://example.com/image.jpg" 
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs tracking-wider uppercase font-medium">Hover Image</Label>
              <div className="flex flex-col gap-3">
                {hoverImagePreview && (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border bg-muted">
                    <img src={hoverImagePreview} className="w-full h-full object-cover" alt="Hover Preview" />
                    <button 
                      onClick={() => { setHoverImagePreview(null); setField('hover_image', ''); }}
                      className="absolute top-2 right-2 p-1 bg-background/80 rounded-full hover:bg-background transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => handleFileChange(e, 'hover')}
                    className="hidden" 
                    ref={hoverImageInputRef}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full flex items-center gap-2 border-dashed h-20"
                    onClick={() => hoverImageInputRef.current?.click()}
                  >
                    <Upload size={16} />
                    <span>{hoverImagePreview ? 'Change Image' : 'Upload Hover Image'}</span>
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">or URL</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <Input 
                  value={form.hover_image || ''} 
                  onChange={e => {
                    setField('hover_image', e.target.value);
                    setHoverImagePreview(e.target.value);
                  }} 
                  placeholder="https://example.com/hover.jpg" 
                />
              </div>
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
