import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StatCard } from '@/components/ui/StatCard';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Users, 
  TrendingUp,
  Activity
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { format, subDays } from 'date-fns';
import { toast } from 'sonner';

interface DashboardStats {
  totalUsers: number;
  totalAlerts: number;
  pendingAlerts: number;
  confirmedFraud: number;
  highRiskUsers: { user_id: string; email: string; alert_count: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAlerts: 0,
    pendingAlerts: 0,
    confirmedFraud: 0,
    highRiskUsers: []
  });
  const [alertsPerDay, setAlertsPerDay] = useState<{ date: string; count: number }[]>([]);
  const [riskDistribution, setRiskDistribution] = useState<{ level: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch total users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch alerts stats
      const { data: alerts } = await supabase
        .from('fraud_alerts')
        .select('status, risk_level, created_at, user_id');

      const pendingCount = alerts?.filter(a => a.status === 'pending').length || 0;
      const confirmedCount = alerts?.filter(a => a.status === 'confirmed_fraud').length || 0;

      // Calculate alerts per day for the last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const count = alerts?.filter(a => 
          format(new Date(a.created_at), 'yyyy-MM-dd') === dateStr
        ).length || 0;
        return { date: format(date, 'MMM d'), count };
      });

      // Calculate risk distribution
      const riskDist = [
        { level: 'High', count: alerts?.filter(a => a.risk_level === 'high').length || 0 },
        { level: 'Medium', count: alerts?.filter(a => a.risk_level === 'medium').length || 0 },
        { level: 'Safe', count: alerts?.filter(a => a.risk_level === 'safe').length || 0 }
      ];

      // Get high-risk users (users with most alerts)
      const userAlertCounts = new Map<string, number>();
      alerts?.forEach(a => {
        userAlertCounts.set(a.user_id, (userAlertCounts.get(a.user_id) || 0) + 1);
      });

      const topUsers = Array.from(userAlertCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      // Fetch user emails for top users
      const userIds = topUsers.map(([id]) => id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, email')
        .in('user_id', userIds);

      const highRiskUsers = topUsers.map(([userId, count]) => ({
        user_id: userId,
        email: profiles?.find(p => p.user_id === userId)?.email || 'Unknown',
        alert_count: count
      }));

      setStats({
        totalUsers: usersCount || 0,
        totalAlerts: alerts?.length || 0,
        pendingAlerts: pendingCount,
        confirmedFraud: confirmedCount,
        highRiskUsers
      });
      setAlertsPerDay(last7Days);
      setRiskDistribution(riskDist);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Overview of fraud detection system performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Alerts"
          value={stats.totalAlerts}
          icon={AlertTriangle}
        />
        <StatCard
          title="Pending Review"
          value={stats.pendingAlerts}
          icon={Activity}
          variant="warning"
        />
        <StatCard
          title="Confirmed Fraud"
          value={stats.confirmedFraud}
          icon={TrendingUp}
          variant="danger"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Alerts Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alerts Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={alertsPerDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Risk Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Risk Level Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="level" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* High Risk Users */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">High Risk Users</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.highRiskUsers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No high-risk users identified</p>
          ) : (
            <div className="space-y-3">
              {stats.highRiskUsers.map((user, i) => (
                <div 
                  key={user.user_id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground">#{i + 1}</span>
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.alert_count} alert{user.alert_count > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <RiskBadge level={user.alert_count >= 5 ? 'high' : user.alert_count >= 2 ? 'medium' : 'safe'} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
