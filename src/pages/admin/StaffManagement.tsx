import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, UserCog } from 'lucide-react';

interface StaffMember {
  user_id: string;
  role: string;
  email: string | null;
  full_name: string | null;
}

const StaffManagement = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchStaff = async () => {
    // Get all users with worker or admin roles
    const { data: roles } = await supabase.from('user_roles').select('user_id, role')
      .in('role', ['admin', 'worker']);
    
    if (!roles) { setLoading(false); return; }

    const userIds = [...new Set(roles.map(r => r.user_id))];
    const { data: profiles } = await supabase.from('profiles').select('user_id, email, full_name')
      .in('user_id', userIds);

    const staffList: StaffMember[] = roles.map(r => {
      const profile = profiles?.find(p => p.user_id === r.user_id);
      return {
        user_id: r.user_id,
        role: r.role,
        email: profile?.email ?? null,
        full_name: profile?.full_name ?? null,
      };
    });

    setStaff(staffList);
    setLoading(false);
  };

  useEffect(() => { fetchStaff(); }, []);

  const addWorker = async () => {
    if (!newEmail.trim() || !newPassword.trim()) {
      toast.error('Email and password are required');
      return;
    }
    setCreating(true);

    // Sign up the worker (the trigger will create profile + customer role)
    const { data, error } = await supabase.auth.signUp({
      email: newEmail.trim(),
      password: newPassword.trim(),
      options: { data: { full_name: newName.trim() } },
    });

    if (error) {
      toast.error(error.message);
      setCreating(false);
      return;
    }

    if (data.user) {
      // Add worker role
      const { error: roleError } = await supabase.from('user_roles').insert({
        user_id: data.user.id,
        role: 'worker' as const,
      });
      if (roleError) toast.error('User created but failed to assign worker role');
      else toast.success('Worker added successfully!');
    }

    setNewEmail('');
    setNewPassword('');
    setNewName('');
    setDialogOpen(false);
    setCreating(false);
    fetchStaff();
  };

  const removeWorkerRole = async (userId: string) => {
    const { error } = await supabase.from('user_roles').delete()
      .eq('user_id', userId)
      .eq('role', 'worker');
    if (error) toast.error('Failed to remove role');
    else { toast.success('Worker role removed'); fetchStaff(); }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="heading-display text-2xl tracking-wider">Staff Management</h1>
          <p className="text-body text-muted-foreground mt-1">Manage admin and worker accounts</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-luxury flex items-center gap-2">
              <Plus size={16} /> Add Worker
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="heading-display tracking-wider">Add New Worker</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-xs tracking-wider uppercase">Full Name</Label>
                <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Jane Doe" className="rounded-xl mt-1" />
              </div>
              <div>
                <Label className="text-xs tracking-wider uppercase">Email</Label>
                <Input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="worker@example.com" className="rounded-xl mt-1" type="email" />
              </div>
              <div>
                <Label className="text-xs tracking-wider uppercase">Password</Label>
                <Input value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className="rounded-xl mt-1" type="password" />
              </div>
              <Button onClick={addWorker} className="w-full btn-luxury" disabled={creating}>
                {creating ? 'Creating...' : 'Create Worker Account'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-[11px] tracking-[0.12em] uppercase font-semibold p-4">Name</th>
              <th className="text-left text-[11px] tracking-[0.12em] uppercase font-semibold p-4">Email</th>
              <th className="text-left text-[11px] tracking-[0.12em] uppercase font-semibold p-4">Role</th>
              <th className="text-right text-[11px] tracking-[0.12em] uppercase font-semibold p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s, i) => (
              <tr key={`${s.user_id}-${s.role}-${i}`} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <UserCog size={16} className="text-muted-foreground" />
                    <span className="text-sm font-medium">{s.full_name || 'N/A'}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-muted-foreground">{s.email || 'N/A'}</td>
                <td className="p-4">
                  <Badge variant={s.role === 'admin' ? 'default' : 'secondary'} className="text-[10px] tracking-wider uppercase">
                    {s.role}
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  {s.role === 'worker' && (
                    <Button variant="ghost" size="sm" onClick={() => removeWorkerRole(s.user_id)} className="text-destructive hover:text-destructive">
                      <Trash2 size={14} />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>}
        {!loading && staff.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">No staff members found.</div>
        )}
      </div>
    </div>
  );
};

export default StaffManagement;
