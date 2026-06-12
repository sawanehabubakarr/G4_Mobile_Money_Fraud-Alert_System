import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Search, Eye, AlertTriangle, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface UserWithStats {
  user_id: string;
  email: string;
  full_name: string;
  phone_number: string;
  created_at: string;
  alert_count: number;
  transaction_count: number;
  risk_level: 'safe' | 'medium' | 'high';
}

interface UserDetails {
  alerts: any[];
  transactions: any[];
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch alert counts per user
      const { data: alerts } = await supabase
        .from('fraud_alerts')
        .select('user_id, risk_level');

      // Fetch transaction counts per user
      const { data: transactions } = await supabase
        .from('transactions')
        .select('user_id');

      // Calculate stats for each user
      const usersWithStats: UserWithStats[] = (profiles || []).map(profile => {
        const userAlerts = alerts?.filter(a => a.user_id === profile.user_id) || [];
        const userTransactions = transactions?.filter(t => t.user_id === profile.user_id) || [];
        const highRiskCount = userAlerts.filter(a => a.risk_level === 'high').length;
        
        let riskLevel: 'safe' | 'medium' | 'high' = 'safe';
        if (highRiskCount >= 3) riskLevel = 'high';
        else if (highRiskCount >= 1 || userAlerts.length >= 5) riskLevel = 'medium';

        return {
          user_id: profile.user_id,
          email: profile.email,
          full_name: profile.full_name,
          phone_number: profile.phone_number,
          created_at: profile.created_at,
          alert_count: userAlerts.length,
          transaction_count: userTransactions.length,
          risk_level: riskLevel
        };
      });

      setUsers(usersWithStats);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      const [alertsRes, transactionsRes] = await Promise.all([
        supabase
          .from('fraud_alerts')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      setUserDetails({
        alerts: alertsRes.data || [],
        transactions: transactionsRes.data || []
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details');
    }
  };

  const handleViewUser = async (user: UserWithStats) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
    await fetchUserDetails(user.user_id);
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone_number.includes(searchTerm)
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          User Management
        </h1>
        <p className="text-muted-foreground mt-1">
          View and manage all registered users
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead className="hidden sm:table-cell">Joined</TableHead>
                <TableHead>Alerts</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map(user => (
                  <TableRow key={user.user_id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {user.phone_number}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{user.alert_count}</span>
                    </TableCell>
                    <TableCell>
                      <RiskBadge level={user.risk_level} size="sm" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewUser(user)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Details
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedUser.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedUser.phone_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                  <RiskBadge level={selectedUser.risk_level} />
                </div>
              </div>

              {/* Recent Alerts */}
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4" />
                  Recent Alerts ({userDetails?.alerts.length || 0})
                </h4>
                {userDetails?.alerts.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No alerts found</p>
                ) : (
                  <div className="space-y-2">
                    {userDetails?.alerts.map(alert => (
                      <div 
                        key={alert.id} 
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div>
                          <p className="font-medium text-sm">{alert.alert_type}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(alert.created_at), 'MMM d, yyyy HH:mm')}
                          </p>
                        </div>
                        <RiskBadge level={alert.risk_level} size="sm" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Transactions */}
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-3">
                  <Receipt className="h-4 w-4" />
                  Recent Transactions ({userDetails?.transactions.length || 0})
                </h4>
                {userDetails?.transactions.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No transactions found</p>
                ) : (
                  <div className="space-y-2">
                    {userDetails?.transactions.map(tx => (
                      <div 
                        key={tx.id} 
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div>
                          <p className="font-medium text-sm capitalize">{tx.transaction_type}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(tx.created_at), 'MMM d, yyyy HH:mm')}
                          </p>
                        </div>
                        <p className="font-semibold">${Number(tx.amount).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
