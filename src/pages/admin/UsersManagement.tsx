import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

const UsersManagement = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Tables<'orders'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (data) setProfiles(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const openProfile = async (profile: Profile) => {
    setSelected(profile);
    const { data } = await supabase.from('orders').select('*')
      .eq('customer_id', profile.user_id)
      .order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  const filtered = profiles.filter(p =>
    (p.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.full_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const sizeFields = [
    'size_left_thumb', 'size_left_index', 'size_left_middle', 'size_left_ring', 'size_left_pinky',
    'size_right_thumb', 'size_right_index', 'size_right_middle', 'size_right_ring', 'size_right_pinky',
  ] as const;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="heading-display text-2xl tracking-wider">Users</h1>
        <p className="text-body text-muted-foreground mt-1">{profiles.length} registered customers</p>
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
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-[11px] tracking-[0.12em] uppercase font-semibold p-4">Name</th>
              <th className="text-left text-[11px] tracking-[0.12em] uppercase font-semibold p-4">Email</th>
              <th className="text-left text-[11px] tracking-[0.12em] uppercase font-semibold p-4 hidden md:table-cell">Joined</th>
              <th className="text-right text-[11px] tracking-[0.12em] uppercase font-semibold p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors cursor-pointer" onClick={() => openProfile(p)}>
                <td className="p-4 text-sm font-medium">{p.full_name || 'N/A'}</td>
                <td className="p-4 text-sm text-muted-foreground">{p.email || 'N/A'}</td>
                <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">
                  {new Date(p.created_at).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <Button variant="ghost" size="sm" title="Send email">
                    <Mail size={14} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>}
        {!loading && filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">No users found.</div>
        )}
      </div>

      {/* Profile Deep-Dive Modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="heading-display tracking-wider">
              {selected?.full_name || 'Customer Profile'}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Email:</span> {selected.email}</p>
                <p><span className="text-muted-foreground">Phone:</span> {selected.phone || 'Not set'}</p>
              </div>

              {/* Saved Sizes */}
              <div>
                <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Saved Nail Sizes</h3>
                <div className="grid grid-cols-5 gap-2 text-center">
                  {['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'].map((finger, i) => (
                    <div key={finger} className="text-[11px]">
                      <p className="text-muted-foreground mb-1">{finger}</p>
                      <p className="font-medium">L: {selected[sizeFields[i]] ?? '-'}</p>
                      <p className="font-medium">R: {selected[sizeFields[i + 5]] ?? '-'}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order History */}
              <div>
                <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Order History ({orders.length})</h3>
                {orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No orders yet.</p>
                ) : (
                  <div className="space-y-2">
                    {orders.map(o => (
                      <div key={o.id} className="flex items-center justify-between bg-accent/30 rounded-lg p-3 text-sm">
                        <div>
                          <p className="font-medium">{o.order_number}</p>
                          <p className="text-[11px] text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${o.total}</p>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{o.status}</p>
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
    </div>
  );
};

export default UsersManagement;
