import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

const SiteSettings = () => {
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('site_settings').select('*');
      if (data) {
        const textSetting = data.find(s => s.key === 'announcement_bar_text');
        const enabledSetting = data.find(s => s.key === 'announcement_bar_enabled');
        if (textSetting) setAnnouncementText(textSetting.value || '');
        if (enabledSetting) setAnnouncementEnabled(enabledSetting.value === 'true');
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const save = async () => {
    setSaving(true);
    const updates = [
      supabase.from('site_settings').update({ value: announcementText }).eq('key', 'announcement_bar_text'),
      supabase.from('site_settings').update({ value: announcementEnabled ? 'true' : 'false' }).eq('key', 'announcement_bar_enabled'),
    ];
    await Promise.all(updates);
    toast.success('Settings saved!');
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading settings...</div>;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="heading-display text-2xl tracking-wider">Site Settings</h1>
        <p className="text-body text-muted-foreground mt-1">Configure your store settings</p>
      </div>

      <div className="max-w-2xl space-y-8">
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

        {/* API Keys (placeholder) */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="heading-display text-lg tracking-wider mb-4">API Integrations</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-xs tracking-wider uppercase">Stripe Secret Key</Label>
              <Input type="password" placeholder="sk_live_..." className="rounded-xl mt-1" disabled />
              <p className="text-[11px] text-muted-foreground mt-1">Configure via Cloud → Secrets</p>
            </div>
            <div>
              <Label className="text-xs tracking-wider uppercase">Email Service API Key</Label>
              <Input type="password" placeholder="key-..." className="rounded-xl mt-1" disabled />
              <p className="text-[11px] text-muted-foreground mt-1">Configure via Cloud → Secrets</p>
            </div>
          </div>
        </div>

        <Button onClick={save} className="btn-luxury flex items-center gap-2" disabled={saving}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default SiteSettings;
