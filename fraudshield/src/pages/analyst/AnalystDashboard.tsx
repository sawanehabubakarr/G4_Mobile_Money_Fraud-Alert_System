import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StatCard } from '@/components/ui/StatCard';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  TrendingUp,
  Activity
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { format, subDays } from 'date-fns';
import { toast } from 'sonner';

export default function AnalystDashboard() {
  const [stats, setStats] = useState({ totalAlerts: 0, pendingAlerts: 0, confirmedFraud: 0, highRiskAlerts: 0 });
  const [alertsPerDay, setAlertsPerDay] = useState<{ date: string; count: number }[]>([]);
  const [riskDistribution, setRiskDistribution] = useState<{ level: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: alerts } = await supabase
        .from('fraud_alerts')
        .select('status, risk_level, created_at');

      const pendingCount = alerts?.filter(a => a.status === 'pending').length || 0;
      const confirmedCount = alerts?.filter(a => a.status === 'confirmed_fraud').length || 0;
      const highRiskCount = alerts?.filter(a => a.risk_level === 'high').length || 0;

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const count = alerts?.filter(a => format(new Date(a.created_at), 'yyyy-MM-dd') === dateStr).length || 0;
        return { date: format(date, 'MMM d'), count };
      });

      const riskDist = [
        { level: 'High', count: alerts?.filter(a => a.risk_level === 'high').length || 0 },
        { level: 'Medium', count: alerts?.filter(a => a.risk_level === 'medium').length || 0 },
        { level: 'Safe', count: alerts?.filter(a => a.risk_level === 'safe').length || 0 }
      ];

      setStats({ totalAlerts: alerts?.length || 0, pendingAlerts: pendingCount, confirmedFraud: confirmedCount, highRiskAlerts: highRiskCount });
      setAlertsPerDay(last7Days);
      setRiskDistribution(riskDist);
    } catch (error) {
      console.error('Error fetching analyst data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          Fraud Analytics
        </h1>
        <p className="text-muted-foreground mt-1">Overview of fraud detection metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Alerts" value={stats.totalAlerts} icon={AlertTriangle} />
        <StatCard title="Pending Review" value={stats.pendingAlerts} icon={Activity} variant="warning" />
        <StatCard title="Confirmed Fraud" value={stats.confirmedFraud} icon={TrendingUp} variant="danger" />
        <StatCard title="High Risk" value={stats.highRiskAlerts} icon={AlertTriangle} variant="danger" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Alerts Trend (Last 7 Days)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={alertsPerDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Risk Level Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="level" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
