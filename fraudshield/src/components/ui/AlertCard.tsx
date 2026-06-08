import { cn } from '@/lib/utils';
import { FraudAlert } from '@/lib/types';
import { RiskBadge } from './RiskBadge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, MapPin, Smartphone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AlertCardProps {
  alert: FraudAlert;
  onRespond?: (alertId: string, response: 'this_was_me' | 'this_is_fraud') => void;
  showActions?: boolean;
  className?: string;
}

export function AlertCard({ alert, onRespond, showActions = true, className }: AlertCardProps) {
  const isPending = alert.status === 'pending';

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-200',
        isPending && 'border-l-4',
        alert.risk_level === 'high' && 'border-l-risk-high',
        alert.risk_level === 'medium' && 'border-l-risk-medium',
        alert.risk_level === 'safe' && 'border-l-risk-safe',
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{alert.alert_type}</h3>
            <p className="text-sm text-muted-foreground">{alert.alert_message}</p>
          </div>
          <RiskBadge level={alert.risk_level} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {alert.transaction && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Amount: </span>
              <span className="font-medium text-foreground">
                SLE {alert.transaction.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}</span>
            </div>
            {alert.transaction.gps_location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{alert.transaction.gps_location}</span>
              </div>
            )}
            {alert.transaction.device_fingerprint && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Smartphone className="h-4 w-4" />
                <span className="truncate">{alert.transaction.device_fingerprint}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Risk Score: <span className="font-semibold">{alert.risk_score}/100</span>
          </p>
          
          {showActions && isPending && onRespond && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRespond(alert.id, 'this_was_me')}
              >
                This was me
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onRespond(alert.id, 'this_is_fraud')}
              >
                Report Fraud
              </Button>
            </div>
          )}

          {!isPending && (
            <span
              className={cn(
                'text-xs font-medium px-2 py-1 rounded',
                alert.status === 'confirmed_fraud'
                  ? 'bg-risk-high-bg text-risk-high'
                  : 'bg-success-bg text-success'
              )}
            >
              {alert.status === 'confirmed_fraud' ? 'Confirmed Fraud' : 'Dismissed'}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}