import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { FraudAlert } from '@/lib/types';

export default function AnalystAlerts() {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('fraud_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts((data as FraudAlert[]) || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-primary" />
          All Fraud Alerts
        </h1>
        <p className="text-muted-foreground mt-1">{alerts.length} total alerts</p>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">No alerts found</CardContent>
          </Card>
        ) : (
          alerts.map(alert => (
            <Card key={alert.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <p className="font-medium">{alert.alert_type}</p>
                  <p className="text-sm text-muted-foreground">{alert.alert_message}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(alert.created_at), 'PPpp')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={alert.status === 'pending' ? 'outline' : alert.status === 'confirmed_fraud' ? 'destructive' : 'secondary'}>
                    {alert.status}
                  </Badge>
                  <RiskBadge level={alert.risk_level} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
