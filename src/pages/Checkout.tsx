import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Package } from 'lucide-react';
import { api } from '@/integrations/superbase';

const Checkout = () => {
  const { items, subtotal, clearCart, amountUntilFreeShipping } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'Canada'
  });

  const shippingCost = amountUntilFreeShipping <= 0 ? 0 : 5.99;
  const total = subtotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      // 1. Create Order
      const orderNumber = `PRN-${Math.floor(Math.random() * 900000) + 100000}`;
      const orderData = await api.data.create('orders', {
        order_number: orderNumber,
        customer_email: form.email,
        customer_name: form.name,
        subtotal: subtotal,
        shipping_cost: shippingCost,
        total: total,
        status: 'pending',
        shipping_address: {
          addressLine1: form.address,
          city: form.city,
          state: form.state,
          postalCode: form.zip,
          country: form.country,
        }
      });

      // 2. Create Order Items
      for (const item of items) {
        // Ensure image is not a massive base64 string if possible
        const imageUrl = typeof item.product.image === 'string' && item.product.image.startsWith('data:') 
          ? 'placeholder.svg' 
          : item.product.image;

        await api.data.create('order_items', {
          order_id: orderData.id,
          product_id: item.product.id,
          product_name: item.product.name,
          product_image: imageUrl,
          quantity: item.quantity,
          size: item.size,
          price: item.product.price
        });
      }

      // Success
      toast.success('Order placed successfully!');
      clearCart();
      if (user) {
        navigate('/profile');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-20 min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <Package size={48} className="text-muted-foreground/30 mb-6" />
        <h1 className="heading-display text-2xl tracking-wider mb-2">Your Bag is Empty</h1>
        <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Button className="btn-luxury" onClick={() => navigate('/collections/all')}>
          Start Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Checkout Form */}
        <div>
          <h1 className="heading-display text-2xl tracking-wider mb-6">Checkout</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Contact Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label>Name</Label>
                  <Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Jane Doe" />
                </div>
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label>Email</Label>
                  <Input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="jane@example.com" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Shipping Address</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input required value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="123 Nail St" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input required value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder="Toronto" />
                  </div>
                  <div className="space-y-2">
                    <Label>State / Province</Label>
                    <Input required value={form.state} onChange={e => setForm({...form, state: e.target.value})} placeholder="ON" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Postal Code</Label>
                    <Input required value={form.zip} onChange={e => setForm({...form, zip: e.target.value})} placeholder="M1M 1M1" />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input required value={form.country} onChange={e => setForm({...form, country: e.target.value})} placeholder="Canada" />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info - Demo only */}
            <div className="space-y-4">
              <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Payment</h2>
              <div className="bg-accent/30 border border-border p-4 rounded-xl text-sm text-muted-foreground text-center">
                This is a demo store. Orders are created without real payment processing.
              </div>
            </div>

            <Button type="submit" className="w-full btn-luxury h-12 text-base" disabled={loading}>
              {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
            </Button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-card border border-border p-6 rounded-2xl h-fit sticky top-32">
          <h2 className="text-lg font-medium tracking-wider mb-6">Order Summary</h2>
          <div className="space-y-4 mb-6">
            {items.map(item => (
              <div key={item.product.id} className="flex gap-4 items-center">
                <div className="relative">
                  <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded-lg bg-muted" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-foreground text-background text-[10px] flex items-center justify-center rounded-full">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">Size: {item.size}</p>
                </div>
                <p className="font-medium text-sm">${(item.product.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          
          <div className="border-t border-border pt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between font-medium text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
