import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Search, Eye, Printer, UserCheck } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Order = Tables<'orders'>;
type OrderStatus = Order['status'];

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  hand_making: 'bg-purple-100 text-purple-800',
  quality_check: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-green-100 text-green-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  hand_making: 'Hand-making',
  quality_check: 'Quality Check',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const Orders = () => {
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const claimOrder = async (orderId: string) => {
    if (!user) return;
    const { error } = await supabase.from('orders').update({ claimed_by: user.id }).eq('id', orderId);
    if (error) toast.error('Failed to claim order');
    else { toast.success('Order claimed!'); fetchOrders(); }
  };

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) toast.error('Failed to update status');
    else { toast.success('Status updated'); fetchOrders(); setSelectedOrder(prev => prev ? { ...prev, status } : null); }
  };

  const saveOrderDetails = async () => {
    if (!selectedOrder) return;
    const { error } = await supabase.from('orders').update({
      tracking_number: trackingNumber || null,
      internal_notes: internalNotes || null,
    }).eq('id', selectedOrder.id);
    if (error) toast.error('Failed to save');
    else { toast.success('Saved!'); fetchOrders(); }
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
                    <Button variant="ghost" size="sm" onClick={() => {
                      setSelectedOrder(order);
                      setTrackingNumber(order.tracking_number || '');
                      setInternalNotes(order.internal_notes || '');
                    }}>
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
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="heading-display tracking-wider">
              Order {selectedOrder?.order_number}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Customer</p>
                  <p>{selectedOrder.customer_name || 'N/A'}</p>
                  <p className="text-muted-foreground">{selectedOrder.customer_email}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Total</p>
                  <p className="text-lg font-medium">${selectedOrder.total}</p>
                </div>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Status</p>
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
                  placeholder="Enter tracking number..."
                  className="rounded-xl"
                />
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
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
