import { useEffect, useState } from 'react';
import { api } from '@/integrations/superbase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Save, Lock, Shield, Mail } from 'lucide-react';

const SiteSettings = () => {
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);
  const [adminRoute, setAdminRoute] = useState('admin');
  const [adminEmail, setAdminEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [fromName, setFromName] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.admin.getSettings();
        if (data) {
          setSmtpUser(data.active_smtp_user || '');
          setSmtpPass(data.smtp_password || '');
          setSmtpHost(data.smtp_host || '');
          setFromName(data.from_name || '');
          setAdminRoute(data.admin_route || 'admin');
          setAdminEmail(data.admin_email || '');
          setAnnouncementText(data.otp_subject || ''); // Using existing field as placeholder for now
        }
      } catch (err) {
        console.error('Fetch settings failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      if (newPassword && newPassword !== confirmPassword) {
        toast.error('Passwords do not match');
        setSaving(false);
        return;
      }

      await api.admin.updateSettings({
        active_smtp_user: smtpUser,
        smtp_password: smtpPass,
        smtp_host: smtpHost,
        from_name: fromName,
        admin_route: adminRoute,
        admin_email: adminEmail,
        admin_password: newPassword || undefined,
        otp_subject: announcementText, // Placeholder mapping
        otp_body_template: "Hello, your code is {otp}." // Placeholder
      });
      
      if (newPassword) {
        setNewPassword('');
        setConfirmPassword('');
        // Update the stored key if it was the admin password
        if (localStorage.getItem('superbase_api_key') === 'Titobilove123@') {
            localStorage.setItem('superbase_api_key', newPassword);
        }
      }

      toast.success('Settings saved!');
      // If admin route changed, suggest a reload
      if (adminRoute !== window.location.pathname.split('/')[1]) {
          toast.info("Admin route changed. You'll need to use the new URL next time.");
      }
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
        {/* Admin Account */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail size={18} className="text-primary" />
            <h2 className="heading-display text-lg tracking-wider">Admin Account</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-xs tracking-wider uppercase">Admin Contact Email</Label>
              <Input
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                className="rounded-xl mt-1"
                placeholder="admin@preciousnails.com"
              />
              <p className="text-[11px] text-muted-foreground mt-1">Primary email used for store communications.</p>
            </div>
          </div>
        </div>

        {/* SMTP Settings */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail size={18} className="text-primary" />
            <h2 className="heading-display text-lg tracking-wider">Email (SMTP) Settings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
                <Label className="text-xs tracking-wider uppercase">Sender Name</Label>
                <Input value={fromName} onChange={e => setFromName(e.target.value)} className="rounded-xl mt-1" />
            </div>
            <div>
                <Label className="text-xs tracking-wider uppercase">SMTP Host</Label>
                <Input value={smtpHost} onChange={e => setSmtpHost(e.target.value)} className="rounded-xl mt-1" />
            </div>
            <div>
                <Label className="text-xs tracking-wider uppercase">SMTP User</Label>
                <Input value={smtpUser} onChange={e => setSmtpUser(e.target.value)} className="rounded-xl mt-1" />
            </div>
            <div className="md:col-span-2">
                <Label className="text-xs tracking-wider uppercase">SMTP Password</Label>
                <Input type="password" value={smtpPass} onChange={e => setSmtpPass(e.target.value)} className="rounded-xl mt-1" />
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
            <h2 className="heading-display text-lg tracking-wider">Change Admin Password</h2>
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

        <Button onClick={save} className="btn-luxury flex items-center gap-2 w-full md:w-auto" disabled={saving}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default SiteSettings;
