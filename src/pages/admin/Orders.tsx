import { useEffect, useState } from 'react';
import { api } from '@/integrations/superbase';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Search, Eye, Printer, UserCheck, Mail, MapPin, Package } from 'lucide-react';

const statusColors: any = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  hand_making: 'bg-purple-100 text-purple-800',
  quality_check: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-green-100 text-green-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: any = {
  pending: 'Pending',
  processing: 'Processing',
  hand_making: 'Hand-making',
  quality_check: 'Quality Check',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const data = await api.data.getAll('orders');
      if (data) setOrders(data);
    } catch (err) {
      console.error('Fetch orders failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrderItems = async (orderId: string) => {
    try {
      const data = await api.data.getAll('order_items');
      if (data) {
        setOrderItems(data.filter((item: any) => item.order_id === orderId));
      }
    } catch (err) {
      console.error('Fetch items failed:', err);
    }
  };

  const handleOpenOrder = (order: any) => {
    setSelectedOrder(order);
    setTrackingNumber(order.tracking_number || '');
    setInternalNotes(order.internal_notes || '');
    setOrderItems([]);
    fetchOrderItems(order.id);
  };

  const claimOrder = async (orderId: string) => {
    if (!user) return;
    try {
      await api.data.update('orders', orderId, { claimed_by: user.email });
      toast.success('Order claimed!'); 
      fetchOrders();
    } catch (err) {
      toast.error('Failed to claim order');
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await api.data.update('orders', orderId, { status });
      toast.success('Status updated'); 
      fetchOrders(); 
      setSelectedOrder((prev: any) => prev ? { ...prev, status } : null);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const saveOrderDetails = async () => {
    if (!selectedOrder) return;
    try {
      await api.data.update('orders', selectedOrder.id, {
        tracking_number: trackingNumber || null,
        internal_notes: internalNotes || null,
      });
      toast.success('Order tracking and notes updated!'); 
      fetchOrders(); 
      setSelectedOrder((prev: any) => prev ? { ...prev, tracking_number: trackingNumber, internal_notes: internalNotes } : null);
    } catch (err) {
      toast.error('Failed to save');
    }
  };

  const filtered = orders.filter(o =>
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_email.toLowerCase().includes(search.toLowerCase()) ||
    (o.customer_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="heading-display text-2xl tracking-wider">Orders</h1>
          <p className="text-body text-muted-foreground mt-1">{orders.length} total orders</p>
        </div>
      </div>

      <div className="mb-4 relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by order #, email, or name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 rounded-xl text-sm"
        />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-[11px] tracking-[0.12em] uppercase font-semibold p-4">Order #</th>
              <th className="text-left text-[11px] tracking-[0.12em] uppercase font-semibold p-4 hidden md:table-cell">Customer</th>
              <th className="text-left text-[11px] tracking-[0.12em] uppercase font-semibold p-4">Status</th>
              <th className="text-left text-[11px] tracking-[0.12em] uppercase font-semibold p-4">Total</th>
              <th className="text-left text-[11px] tracking-[0.12em] uppercase font-semibold p-4 hidden lg:table-cell">Date</th>
              <th className="text-right text-[11px] tracking-[0.12em] uppercase font-semibold p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(order => (
              <tr key={order.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                <td className="p-4 text-sm font-medium">{order.order_number}</td>
                <td className="p-4 hidden md:table-cell">
                  <p className="text-sm">{order.customer_name || 'N/A'}</p>
                  <p className="text-[11px] text-muted-foreground">{order.customer_email}</p>
                </td>
                <td className="p-4">
                  <span className={`text-[10px] tracking-wider uppercase font-medium px-2.5 py-1 rounded-full ${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                </td>
                <td className="p-4 text-sm font-medium">${order.total}</td>
                <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {!order.claimed_by && (
                      <Button variant="ghost" size="sm" onClick={() => claimOrder(order.id)} title="Claim order">
                        <UserCheck size={14} />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleOpenOrder(order)}>
                      <Eye size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" title="Print shipping label">
                      <Printer size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="p-8 text-center text-muted-foreground text-sm">Loading orders...</div>}
        {!loading && filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">No orders found.</div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="heading-display tracking-wider flex items-center justify-between">
              <span>Order {selectedOrder?.order_number}</span>
              <a 
                href={`mailto:${selectedOrder?.customer_email}?subject=Regarding your Precious Chic Nails Order ${selectedOrder?.order_number}`}
                className="text-sm font-sans font-normal text-muted-foreground hover:text-foreground flex items-center gap-2 border px-3 py-1.5 rounded-lg mr-6"
              >
                <Mail size={14} />
                Contact Customer
              </a>
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm bg-accent/30 p-4 rounded-xl">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Customer</p>
                  <p className="font-medium">{selectedOrder.customer_name || 'N/A'}</p>
                  <p className="text-muted-foreground">{selectedOrder.customer_email}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Total</p>
                  <p className="text-lg font-medium">${selectedOrder.total}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-card border border-border p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-3 text-sm font-medium">
                  <MapPin size={16} className="text-muted-foreground" />
                  <h3>Shipping Location</h3>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  {selectedOrder.shipping_address ? (
                    <>
                      <p>{(selectedOrder.shipping_address as any).addressLine1}</p>
                      {(selectedOrder.shipping_address as any).addressLine2 && <p>{(selectedOrder.shipping_address as any).addressLine2}</p>}
                      <p>{(selectedOrder.shipping_address as any).city}, {(selectedOrder.shipping_address as any).state} {(selectedOrder.shipping_address as any).postalCode}</p>
                      <p>{(selectedOrder.shipping_address as any).country}</p>
                    </>
                  ) : (
                    <p className="italic">No shipping address provided.</p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-card border border-border p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-3 text-sm font-medium">
                  <Package size={16} className="text-muted-foreground" />
                  <h3>Products Bought</h3>
                </div>
                <div className="space-y-3">
                  {orderItems.length > 0 ? (
                    orderItems.map(item => (
                      <div key={item.id} className="flex items-center gap-3 text-sm">
                        {item.product_image ? (
                          <img src={item.product_image} alt={item.product_name} className="w-12 h-12 object-cover rounded-md bg-muted" />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                            <Package size={20} className="text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-[11px] text-muted-foreground">Size: {item.size || 'Standard'} | Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">${item.price}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Loading products...</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Order Status</p>
                  <Select value={selectedOrder.status} onValueChange={(v) => updateStatus(selectedOrder.id, v as OrderStatus)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([val, label]) => (
                        <SelectItem key={val} value={val}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Tracking Number</p>
                  <Input
                    value={trackingNumber}
                    onChange={e => setTrackingNumber(e.target.value)}
                    placeholder="e.g. 1Z9999999999999999"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Internal Notes</p>
                <Textarea
                  value={internalNotes}
                  onChange={e => setInternalNotes(e.target.value)}
                  placeholder="Notes visible only to staff..."
                  className="rounded-xl"
                  rows={3}
                />
              </div>

              <Button onClick={saveOrderDetails} className="w-full btn-luxury">
                Save Tracking & Details
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
