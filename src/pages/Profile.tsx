import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, MapPin, Truck, ExternalLink } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Order = Tables<'orders'>;
type OrderItem = Tables<'order_items'>;

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  hand_making: 'Hand-making',
  quality_check: 'Quality Check',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const Profile = () => {
  const { user, signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  const fetchUserOrders = async () => {
    try {
      const data = await api.data.getAll('orders');
      if (data) {
        // Filter for current user's email since we store email in localstorage
        const userEmail = localStorage.getItem('user_email');
        setOrders(data.filter((o: any) => o.customer_email === userEmail));
      }
    } catch (err) {
      console.error('Fetch user orders failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenOrder = async (order: any) => {
    setSelectedOrder(order);
    setOrderItems([]);
    try {
      const data = await api.data.getAll('order_items');
      if (data) {
        setOrderItems(data.filter((item: any) => item.order_id === order.id));
      }
    } catch (err) {
      console.error('Fetch items failed:', err);
    }
  };

  if (!user) {
    return (
      <div className="pt-32 pb-20 min-h-screen text-center px-6">
        <h1 className="heading-display text-2xl tracking-wider mb-4">Please log in to view your profile.</h1>
        <Button className="btn-luxury" onClick={() => window.location.href = '/auth'}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-12 border-b border-border pb-6">
          <div>
            <h1 className="heading-display text-3xl tracking-wider mb-2">My Account</h1>
            <p className="text-muted-foreground text-sm">{user.email}</p>
          </div>
          <Button variant="outline" onClick={signOut}>Sign Out</Button>
        </div>

        <h2 className="heading-display text-xl tracking-wider mb-6">Order History</h2>
        
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-accent/20 rounded-2xl border border-border">
            <Package size={32} className="mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">You haven't placed any orders yet.</p>
            <Button className="mt-4 btn-luxury" onClick={() => window.location.href = '/collections/all'}>
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div 
                key={order.id} 
                onClick={() => handleOpenOrder(order)}
                className="bg-card border border-border p-5 rounded-2xl hover:border-primary/50 transition-colors cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Order #{order.order_number}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-medium">${order.total}</p>
                      <p className="text-xs text-primary font-medium tracking-wider uppercase mt-1">
                        {statusLabels[order.status] || order.status}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="heading-display tracking-wider">
                Order {selectedOrder?.order_number}
              </DialogTitle>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-6 pt-4">
                {/* Status & Tracking Banner */}
                <div className="bg-primary/10 border border-primary/20 p-5 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Status</p>
                    <p className="font-medium text-primary text-lg">{statusLabels[selectedOrder.status] || selectedOrder.status}</p>
                  </div>
                  {selectedOrder.tracking_number && (
                    <div className="flex flex-col gap-3 flex-1">
                      <div className="flex items-center gap-3 bg-background p-3 rounded-lg border border-border">
                        <Truck className="text-primary" size={20} />
                        <div className="flex-1">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Tracking Number</p>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{selectedOrder.tracking_number}</p>
                            <a 
                              href={`https://www.google.com/search?q=${selectedOrder.tracking_number}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-primary hover:text-primary/80"
                            >
                              <ExternalLink size={14} />
                            </a>
                          </div>
                        </div>
                      </div>
                      
                      {(selectedOrder as any).tracking_location && (
                        <div className="bg-background p-3 rounded-lg border border-border">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Latest Update</p>
                          <p className="text-sm font-medium">{(selectedOrder as any).tracking_location}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Items */}
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Package size={16} className="text-muted-foreground" />
                    Items in your order
                  </h3>
                  <div className="space-y-3 bg-accent/30 p-4 rounded-xl border border-border">
                    {orderItems.length > 0 ? (
                      orderItems.map(item => (
                        <div key={item.id} className="flex items-center gap-4">
                          {item.product_image ? (
                            <img src={item.product_image} alt={item.product_name} className="w-16 h-16 object-cover rounded-lg bg-muted" />
                          ) : (
                            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                              <Package size={20} className="text-muted-foreground/50" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.product_name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Size: {item.size || 'Standard'} | Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium text-sm">${item.price}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Loading items...</p>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                {selectedOrder.shipping_address && (
                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <MapPin size={16} className="text-muted-foreground" />
                      Shipping Address
                    </h3>
                    <div className="bg-card border border-border p-4 rounded-xl text-sm text-muted-foreground space-y-1">
                      <p>{(selectedOrder.shipping_address as any).addressLine1}</p>
                      {(selectedOrder.shipping_address as any).addressLine2 && <p>{(selectedOrder.shipping_address as any).addressLine2}</p>}
                      <p>{(selectedOrder.shipping_address as any).city}, {(selectedOrder.shipping_address as any).state} {(selectedOrder.shipping_address as any).postalCode}</p>
                      <p>{(selectedOrder.shipping_address as any).country}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Profile;
