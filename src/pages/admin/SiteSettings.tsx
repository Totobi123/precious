import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Save, Lock, Shield } from 'lucide-react';

const SiteSettings = () => {
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);
  const [adminRoute, setAdminRoute] = useState('admin');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('site_settings').select('*');
      if (data) {
        const textSetting = data.find(s => s.key === 'announcement_bar_text');
        const enabledSetting = data.find(s => s.key === 'announcement_bar_enabled');
        const routeSetting = data.find(s => s.key === 'admin_route_path');
        if (textSetting) setAnnouncementText(textSetting.value || '');
        if (enabledSetting) setAnnouncementEnabled(enabledSetting.value === 'true');
        if (routeSetting) setAdminRoute(routeSetting.value || 'admin');
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const updates = [
        supabase.from('site_settings').upsert({ key: 'announcement_bar_text', value: announcementText }, { onConflict: 'key' }),
        supabase.from('site_settings').upsert({ key: 'announcement_bar_enabled', value: announcementEnabled ? 'true' : 'false' }, { onConflict: 'key' }),
        supabase.from('site_settings').upsert({ key: 'admin_route_path', value: adminRoute }, { onConflict: 'key' }),
      ];
      
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          toast.error('Passwords do not match');
          setSaving(false);
          return;
        }
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        setNewPassword('');
        setConfirmPassword('');
      }

      await Promise.all(updates);
      toast.success('Settings saved!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading settings...</div>;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="heading-display text-2xl tracking-wider">Site Settings</h1>
        <p className="text-body text-muted-foreground mt-1">Configure your store settings</p>
      </div>

      <div className="max-w-2xl space-y-8 pb-12">
        {/* Announcement Bar */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="heading-display text-lg tracking-wider mb-4">Announcement Bar</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs tracking-wider uppercase">Enabled</Label>
              <Switch checked={announcementEnabled} onCheckedChange={setAnnouncementEnabled} />
            </div>
            <div>
              <Label className="text-xs tracking-wider uppercase">Announcement Text</Label>
              <Input
                value={announcementText}
                onChange={e => setAnnouncementText(e.target.value)}
                className="rounded-xl mt-1"
                placeholder="Your announcement text..."
              />
            </div>
          </div>
        </div>

        {/* Security / Admin Path */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} className="text-primary" />
            <h2 className="heading-display text-lg tracking-wider">Admin Security</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-xs tracking-wider uppercase">Custom Admin Path</Label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">genxflow.store/</span>
                <Input
                  value={adminRoute}
                  onChange={e => setAdminRoute(e.target.value.replace(/[^a-z0-9-]/gi, '').toLowerCase())}
                  className="rounded-xl"
                  placeholder="admin"
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Changing this will hide the admin panel at a new secret URL.</p>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={18} className="text-primary" />
            <h2 className="heading-display text-lg tracking-wider">Change Password</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs tracking-wider uppercase">New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="rounded-xl mt-1"
                placeholder="••••••••"
              />
            </div>
            <div>
              <Label className="text-xs tracking-wider uppercase">Confirm Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="rounded-xl mt-1"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        {/* API Keys (placeholder) */}
        <div className="bg-card rounded-xl border border-border p-6 opacity-60">
          <h2 className="heading-display text-lg tracking-wider mb-4">API Integrations</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-xs tracking-wider uppercase">Stripe Secret Key</Label>
              <Input type="password" placeholder="sk_live_..." className="rounded-xl mt-1" disabled />
              <p className="text-[11px] text-muted-foreground mt-1">Configure via Cloud → Secrets</p>
            </div>
          </div>
        </div>

        <Button onClick={save} className="btn-luxury flex items-center gap-2 w-full md:w-auto" disabled={saving}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default SiteSettings;
