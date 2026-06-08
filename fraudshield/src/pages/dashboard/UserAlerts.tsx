import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { FraudAlert } from '@/lib/types';
import { AlertCard } from '@/components/ui/AlertCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function UserAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchAlerts();
    }
  }, [user]);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('fraud_alerts')
        .select(`
          *,
          transaction:transactions(*)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data as FraudAlert[]);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAlertResponse = async (alertId: string, response: 'this_was_me' | 'this_is_fraud') => {
    try {
      const newStatus = response === 'this_is_fraud' ? 'confirmed_fraud' : 'dismissed';
      
      const { error } = await supabase
        .from('fraud_alerts')
        .update({ 
          status: newStatus,
          user_feedback: response,
          updated_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: newStatus, user_feedback: response } 
            : alert
        )
      );

      toast.success(
        response === 'this_is_fraud' 
          ? 'Alert reported as fraud. We will investigate.' 
          : 'Alert dismissed. Thank you for confirming.'
      );
    } catch (error) {
      console.error('Error updating alert:', error);
      toast.error('Failed to update alert');
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      alert.alert_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.alert_message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    const matchesRisk = riskFilter === 'all' || alert.risk_level === riskFilter;
    
    return matchesSearch && matchesStatus && matchesRisk;
  });

  const pendingCount = alerts.filter(a => a.status === 'pending').length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Fraud Alerts
          </h1>
          <p className="text-muted-foreground mt-1">
            {pendingCount > 0 
              ? `You have ${pendingCount} pending alert${pendingCount > 1 ? 's' : ''} requiring attention`
              : 'No pending alerts at this time'
            }
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search alerts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed_fraud">Confirmed</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="safe">Low Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No alerts found</h3>
          <p className="text-muted-foreground mt-1">
            {searchTerm || statusFilter !== 'all' || riskFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Your account has no fraud alerts'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAlerts.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onRespond={handleAlertResponse}
              showActions={alert.status === 'pending'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
