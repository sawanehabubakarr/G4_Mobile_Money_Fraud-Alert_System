import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { History } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Transaction } from '@/lib/types';

export default function AnalystTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setTransactions((data as Transaction[]) || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
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
          <History className="h-6 w-6 text-primary" />
          All Transactions
        </h1>
        <p className="text-muted-foreground mt-1">{transactions.length} transactions</p>
      </div>

      <div className="space-y-3">
        {transactions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">No transactions found</CardContent>
          </Card>
        ) : (
          transactions.map(tx => (
            <Card key={tx.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <p className="font-medium">{tx.transaction_type} — SLE {Number(tx.amount).toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">{tx.sender_phone} → {tx.receiver_phone}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(tx.created_at), 'PPpp')}</p>
                </div>
                <RiskBadge level={tx.risk_level || 'safe'} />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
