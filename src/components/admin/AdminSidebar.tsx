import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard, ShoppingBag, Package, Users, UserCog,
  Settings, LogOut, ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const AdminSidebar = () => {
  const { isAdmin, isWorker, signOut, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminPath, setAdminPath] = useState('admin');

  useEffect(() => {
    const fetchAdminPath = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'admin_route_path')
        .single();
      if (data?.value) setAdminPath(data.value);
    };
    fetchAdminPath();
  }, []);

  const adminLinks = [
    { to: `/${adminPath}`, icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: `/${adminPath}/orders`, icon: ShoppingBag, label: 'Orders' },
    { to: `/${adminPath}/products`, icon: Package, label: 'Products' },
    { to: `/${adminPath}/users`, icon: Users, label: 'Users', adminOnly: true },
    { to: `/${adminPath}/staff`, icon: UserCog, label: 'Staff Management', adminOnly: true },
    { to: `/${adminPath}/settings`, icon: Settings, label: 'Site Settings', adminOnly: true },
  ];

  const visibleLinks = adminLinks.filter(link => {
    if (link.adminOnly && !isAdmin) return false;
    return true;
  });

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        {(!collapsed || mobileOpen) && (
          <div>
            <h2 className="heading-display text-lg tracking-wider">Precious Chic Nails</h2>
            <p className="text-[10px] tracking-widest uppercase text-muted-foreground mt-0.5">
              {isAdmin ? 'Admin Panel' : 'Worker Panel'}
            </p>
          </div>
        )}
        {!mobileOpen && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
        {mobileOpen && (
          <button onClick={() => setMobileOpen(false)} className="p-1.5">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {visibleLinks.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
          >
            <link.icon size={18} />
            {(!collapsed || mobileOpen) && <span className="tracking-wide">{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        {(!collapsed || mobileOpen) && (
          <p className="text-[11px] text-muted-foreground mb-2 px-3 truncate">{user?.email}</p>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
        >
          <LogOut size={16} />
          {(!collapsed || mobileOpen) && <span className="text-xs tracking-wider">Sign Out</span>}
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-[60]">
        <Button variant="outline" size="icon" onClick={() => setMobileOpen(true)} className="bg-background shadow-md">
          <Menu size={20} />
        </Button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[100] lg:hidden" 
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Desktop/Mobile */}
      <aside className={`
        fixed inset-y-0 left-0 z-[110] lg:static lg:z-0
        bg-sidebar-background border-r border-sidebar-border flex flex-col transition-all duration-300
        ${mobileOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${collapsed ? 'lg:w-16' : 'lg:w-64'}
      `}>
        <SidebarContent />
      </aside>
    </>
  );
};

export default AdminSidebar;
