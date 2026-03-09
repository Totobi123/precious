import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, ShoppingBag, Users, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  newCustomers: number;
  lowStockAlerts: number;
}

interface SalesPoint {
  day: string;
  sales: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0, totalOrders: 0, newCustomers: 0, lowStockAlerts: 0,
  });
  const [salesData, setSalesData] = useState<SalesPoint[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [orders, products, adminUsers] = await Promise.all([
          api.data.getAll('orders'),
          api.data.getAll('products'),
          api.admin.getUsers().catch(() => []), // fallback if not admin
        ]);

        const revenue = (orders || []).reduce((sum: number, o: any) => sum + (o.total || 0), 0);
        const lowStock = (products || []).filter((p: any) => (p.stock_level || 0) < 5).length;
        
        setStats({
          totalRevenue: revenue,
          totalOrders: (orders || []).length,
          newCustomers: (adminUsers || []).length,
          lowStockAlerts: lowStock,
        });

        // Build real sales chart from orders
        const last30 = Array.from({ length: 30 }, (_, i) => {
          const date = subDays(new Date(), 29 - i);
          const key = format(date, 'yyyy-MM-dd');
          const label = format(date, 'MMM d');
          const daySales = (orders || [])
            .filter((o: any) => o.created_at?.startsWith(key))
            .reduce((sum: number, o: any) => sum + (o.total || 0), 0);
          return { day: label, sales: daySales };
        });
        setSalesData(last30);
      } catch (err) {
        console.error('Stats fetch failed:', err);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600' },
    { label: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingBag, color: 'text-blue-600' },
    { label: 'New Customers', value: stats.newCustomers.toString(), icon: Users, color: 'text-violet-600' },
    { label: 'Low Stock Alerts', value: stats.lowStockAlerts.toString(), icon: AlertTriangle, color: 'text-amber-600' },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="heading-display text-2xl tracking-wider">Dashboard</h1>
        <p className="text-body text-muted-foreground mt-1">Overview of your store performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <div key={s.label} className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground font-medium">{s.label}</span>
              <s.icon size={18} className={s.color} />
            </div>
            <p className="heading-display text-2xl">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="heading-display text-lg tracking-wider mb-4">Sales Over Last 30 Days</h2>
        <div className="h-[300px]">
          {salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Sales']}
                />
                <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              No order data yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
