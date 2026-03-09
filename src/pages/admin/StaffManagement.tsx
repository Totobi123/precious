import { useEffect, useState } from 'react';
import { api } from '@/integrations/superbase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, UserCog } from 'lucide-react';

const StaffManagement = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchStaff = async () => {
    try {
      const users = await api.admin.getUsers();
      // In Superbase, we can filter for admin emails or a 'role' field if added to the user record
      // For now, let's treat admin@preciousnails.com and admin@gmail.com as staff
      const staffList = users.filter((u: any) => 
        u.email?.includes('admin') || u.email?.includes('worker')
      );
      setStaff(staffList);
    } catch (err) {
      console.error('Fetch staff failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const addWorker = async () => {
    if (!newEmail.trim() || !newPassword.trim()) {
      toast.error('Email and password are required');
      return;
    }
    setCreating(true);

    try {
      await api.auth.signup({
        email: newEmail.trim(),
        password: newPassword.trim(),
        full_name: newName.trim()
      });
      toast.success('Worker account created! They need to verify OTP.');
      setNewEmail('');
      setNewPassword('');
      setNewName('');
      setDialogOpen(false);
      fetchStaff();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setCreating(false);
    }
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
            </tr>
          </thead>
          <tbody>
            {staff.map((s, i) => (
              <tr key={s.id || s.email} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <UserCog size={16} className="text-muted-foreground" />
                    <span className="text-sm font-medium">{s.full_name || 'N/A'}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-muted-foreground">{s.email || 'N/A'}</td>
                <td className="p-4">
                  <Badge variant={s.email?.includes('admin') ? 'default' : 'secondary'} className="text-[10px] tracking-wider uppercase">
                    {s.email?.includes('admin') ? 'admin' : 'worker'}
                  </Badge>
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
