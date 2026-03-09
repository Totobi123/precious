import { useEffect, useState } from 'react';
import { api } from '@/integrations/superbase';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Mail, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const UsersManagement = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mailModal, setMailModal] = useState<any | null>(null);
  const [mailBody, setMailBody] = useState('');
  const [sending, setSending] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.admin.getUsers();
      console.log('Users data received:', data);
      if (Array.isArray(data)) {
        setProfiles(data);
      } else {
        setProfiles([]);
      }
    } catch (err) {
      console.error('Fetch users failed:', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openProfile = async (profile: any) => {
    setSelected(profile);
    setOrders([]);
    try {
      const data = await api.data.getAll('orders');
      if (data && Array.isArray(data)) {
        setOrders(data.filter((o: any) => o.customer_email === profile.email));
      }
    } catch (err) {
      console.error('Fetch orders failed:', err);
    }
  };

  const sendMail = async () => {
    if (!mailModal || !mailBody) return;
    setSending(true);
    try {
      await api.admin.sendMail({
        to: mailModal.email,
        subject: 'Update from Precious Chic Nails',
        body: mailBody
      });
      toast.success('Email sent successfully!');
      setMailModal(null);
      setMailBody('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const filtered = profiles.filter(p =>
    (p.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.full_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="heading-display text-2xl tracking-wider">Users & Workers</h1>
        <p className="text-body text-muted-foreground mt-1">{profiles.length} total registered accounts</p>
      </div>

      <div className="mb-4 relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by email or name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 rounded-xl text-sm"
        />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-[11px] tracking-[0.12em] uppercase font-semibold p-4">User</th>
                <th className="text-left text-[11px] tracking-[0.12em] uppercase font-semibold p-4">Status</th>
                <th className="text-left text-[11px] tracking-[0.12em] uppercase font-semibold p-4 hidden md:table-cell">Joined</th>
                <th className="text-right text-[11px] tracking-[0.12em] uppercase font-semibold p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id || p.email} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors cursor-pointer" onClick={() => openProfile(p)}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <UserIcon size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{p.full_name || p.email?.split('@')[0] || 'N/A'}</p>
                        <p className="text-[11px] text-muted-foreground">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] tracking-wider uppercase font-medium px-2 py-0.5 rounded-full ${p.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {p.is_verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm" title="Send email" onClick={(e) => { e.stopPropagation(); setMailModal(p); }}>
                      <Mail size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && <div className="p-12 text-center text-muted-foreground text-sm">Loading user directory...</div>}
        {!loading && filtered.length === 0 && (
          <div className="p-12 text-center text-muted-foreground text-sm">No users matching your search.</div>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="heading-display tracking-wider">
              {selected?.full_name || selected?.email || 'User Profile'}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-6 pt-4">
              <div className="bg-accent/30 p-4 rounded-xl space-y-2">
                <p className="text-sm"><span className="text-muted-foreground uppercase text-[10px] tracking-widest block mb-1">Email Address</span> {selected.email}</p>
                <p className="text-sm"><span className="text-muted-foreground uppercase text-[10px] tracking-widest block mb-1">Database Schema</span> <code className="text-[11px] bg-background px-1.5 py-0.5 rounded border">{selected.schema}</code></p>
              </div>

              <div>
                <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">Order History ({orders.length})</h3>
                {orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic bg-accent/10 p-4 rounded-xl text-center border border-dashed">This user hasn't placed any orders yet.</p>
                ) : (
                  <div className="space-y-2">
                    {orders.map(o => (
                      <div key={o.id} className="flex items-center justify-between bg-card border border-border rounded-xl p-3 text-sm hover:border-primary/50 transition-colors">
                        <div>
                          <p className="font-medium">#{o.order_number || o.id}</p>
                          <p className="text-[11px] text-muted-foreground">{o.created_at ? new Date(o.created_at).toLocaleDateString() : ''}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${o.total}</p>
                          <p className="text-[10px] uppercase tracking-wider text-primary font-bold">{o.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!mailModal} onOpenChange={() => setMailModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="heading-display tracking-wider">Contact User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Recipient</label>
              <div className="text-sm font-medium">{mailModal?.email}</div>
            </div>
            <Textarea 
              placeholder="Type your message to the customer here..." 
              value={mailBody}
              onChange={(e) => setMailBody(e.target.value)}
              rows={6}
              className="rounded-xl"
            />
            <Button className="w-full btn-luxury" onClick={sendMail} disabled={sending || !mailBody}>
              {sending ? 'Sending...' : 'Send Email Message'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManagement;
