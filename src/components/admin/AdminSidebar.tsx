import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard, ShoppingBag, Package, Users, UserCog,
  Settings, LogOut, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const AdminSidebar = () => {
  const { isAdmin, isWorker, signOut, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
    { to: '/admin/products', icon: Package, label: 'Products' },
    { to: '/admin/users', icon: Users, label: 'Users', adminOnly: true },
    { to: '/admin/staff', icon: UserCog, label: 'Staff Management', adminOnly: true },
    { to: '/admin/settings', icon: Settings, label: 'Site Settings', adminOnly: true },
  ];

  const visibleLinks = adminLinks.filter(link => {
    if (link.adminOnly && !isAdmin) return false;
    return true;
  });

  return (
    <aside className={`bg-sidebar-background border-r border-sidebar-border flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        {!collapsed && (
          <div>
            <h2 className="heading-display text-lg tracking-wider">Precious Chic Nails</h2>
            <p className="text-[10px] tracking-widest uppercase text-muted-foreground mt-0.5">
              {isAdmin ? 'Admin Panel' : 'Worker Panel'}
            </p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {visibleLinks.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
          >
            <link.icon size={18} />
            {!collapsed && <span className="tracking-wide">{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        {!collapsed && (
          <p className="text-[11px] text-muted-foreground mb-2 px-3 truncate">{user?.email}</p>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
        >
          <LogOut size={16} />
          {!collapsed && <span className="text-xs tracking-wider">Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
