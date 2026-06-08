import { useEffect, useState } from 'react';
import { Activity, Bell, TrendingUp, AlertTriangle } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { AlertCard } from '@/components/ui/AlertCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { FraudAlert, Transaction, RiskLevel, AlertStatus } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function UserDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [stats, setStats] = useState({ totalTransactions: 0, totalAlerts: 0, highRiskAlerts: 0, pendingAlerts: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch transactions count
      const { count: txCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      // Fetch alerts with transactions
      const { data: alertsData } = await supabase
        .from('fraud_alerts')
        .select('*, transactions(*)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      const typedAlerts: FraudAlert[] = (alertsData || []).map((alert: any) => ({
        ...alert,
        risk_level: alert.risk_level as RiskLevel,
        status: alert.status as AlertStatus,
        transaction: alert.transactions ? {
          ...alert.transactions,
          risk_level: alert.transactions.risk_level as RiskLevel,
        } as Transaction : undefined,
      }));

      // Calculate stats
      const highRisk = typedAlerts.filter(a => a.risk_level === 'high').length;
      const pending = typedAlerts.filter(a => a.status === 'pending').length;

      setAlerts(typedAlerts);
      setStats({
        totalTransactions: txCount || 0,
        totalAlerts: typedAlerts.length,
        highRiskAlerts: highRisk,
        pendingAlerts: pending,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAlertResponse = async (alertId: string, response: 'this_was_me' | 'this_is_fraud') => {
    const newStatus: AlertStatus = response === 'this_is_fraud' ? 'confirmed_fraud' : 'dismissed';
    
    const { error } = await supabase
      .from('fraud_alerts')
      .update({ status: newStatus, user_feedback: response })
      .eq('id', alertId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update alert', variant: 'destructive' });
    } else {
      toast({ title: 'Alert updated', description: 'Thank you for your feedback.' });
      fetchDashboardData();
    }
  };

  const chartData = [
    { name: 'Mon', alerts: 2 }, { name: 'Tue', alerts: 1 }, { name: 'Wed', alerts: 4 },
    { name: 'Thu', alerts: 3 }, { name: 'Fri', alerts: 2 }, { name: 'Sat', alerts: 1 }, { name: 'Sun', alerts: 0 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Monitor your account security</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Transactions" value={stats.totalTransactions} icon={Activity} variant="primary" />
        <StatCard title="Total Alerts" value={stats.totalAlerts} icon={Bell} />
        <StatCard title="High Risk Alerts" value={stats.highRiskAlerts} icon={AlertTriangle} variant="danger" />
        <StatCard title="Pending Review" value={stats.pendingAlerts} icon={TrendingUp} variant="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Alert Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Line type="monotone" dataKey="alerts" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No alerts yet. Your account is secure!</p>
            ) : (
              alerts.slice(0, 3).map((alert) => (
                <AlertCard key={alert.id} alert={alert} onRespond={handleAlertResponse} />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}