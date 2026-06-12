import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Search, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: any;
  ip_address: string | null;
  created_at: string;
}

interface AlertReport {
  id: string;
  user_id: string;
  alert_type: string;
  alert_message: string;
  risk_level: 'safe' | 'medium' | 'high';
  risk_score: number;
  status: string;
  user_feedback: string | null;
  created_at: string;
  user_email?: string;
}

export default function AdminReports() {
  const [alerts, setAlerts] = useState<AlertReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'alerts' | 'audit'>('alerts');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all alerts with user profiles
      const { data: alertsData } = await supabase
        .from('fraud_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      // Get unique user IDs from alerts
      const userIds = [...new Set(alertsData?.map(a => a.user_id) || [])];
      
      // Fetch profiles for these users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, email')
        .in('user_id', userIds);

      // Merge alert data with user emails
      const alertsWithEmails: AlertReport[] = (alertsData || []).map(alert => ({
        ...alert,
        user_email: profiles?.find(p => p.user_id === alert.user_id)?.email
      }));

      setAlerts(alertsWithEmails);

      // Fetch audit logs
      const { data: logsData } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      setAuditLogs(logsData || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    const data = activeTab === 'alerts' ? filteredAlerts : auditLogs;
    
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = activeTab === 'alerts' 
      ? ['Date', 'User', 'Alert Type', 'Risk Level', 'Risk Score', 'Status', 'Feedback']
      : ['Date', 'Action', 'Entity Type', 'Entity ID', 'IP Address'];

    const rows = activeTab === 'alerts'
      ? filteredAlerts.map(a => [
          format(new Date(a.created_at), 'yyyy-MM-dd HH:mm'),
          a.user_email || a.user_id,
          a.alert_type,
          a.risk_level,
          a.risk_score,
          a.status,
          a.user_feedback || ''
        ])
      : auditLogs.map(l => [
          format(new Date(l.created_at), 'yyyy-MM-dd HH:mm'),
          l.action,
          l.entity_type,
          l.entity_id || '',
          l.ip_address || ''
        ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Report exported successfully');
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      alert.alert_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const confirmedFraudCount = alerts.filter(a => a.status === 'confirmed_fraud').length;
  const dismissedCount = alerts.filter(a => a.status === 'dismissed').length;
  const pendingCount = alerts.filter(a => a.status === 'pending').length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Reports & Logs
          </h1>
          <p className="text-muted-foreground mt-1">
            View fraud reports and audit trail
          </p>
        </div>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Confirmed Fraud
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-risk-high">{confirmedFraudCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Dismissed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">{dismissedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-risk-medium">{pendingCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          className={`px-4 py-2 font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'alerts' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('alerts')}
        >
          Fraud Alerts
        </button>
        <button
          className={`px-4 py-2 font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'audit' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('audit')}
        >
          Audit Logs
        </button>
      </div>

      {/* Filters */}
      {activeTab === 'alerts' && (
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
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
        </div>
      )}

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          {activeTab === 'alerts' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden md:table-cell">Alert Type</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Feedback</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No alerts found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAlerts.map(alert => (
                    <TableRow key={alert.id}>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(alert.created_at), 'MMM d, HH:mm')}
                      </TableCell>
                      <TableCell className="font-medium truncate max-w-[150px]">
                        {alert.user_email || 'Unknown'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {alert.alert_type}
                      </TableCell>
                      <TableCell>
                        <RiskBadge level={alert.risk_level} size="sm" />
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          alert.status === 'confirmed_fraud' 
                            ? 'bg-risk-high-bg text-risk-high' 
                            : alert.status === 'dismissed'
                            ? 'bg-success-bg text-success'
                            : 'bg-risk-medium-bg text-risk-medium'
                        }`}>
                          {alert.status.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {alert.user_feedback?.replace('_', ' ') || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead className="hidden sm:table-cell">IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  auditLogs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(log.created_at), 'MMM d, HH:mm')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {log.action}
                      </TableCell>
                      <TableCell>
                        {log.entity_type}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {log.ip_address || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
