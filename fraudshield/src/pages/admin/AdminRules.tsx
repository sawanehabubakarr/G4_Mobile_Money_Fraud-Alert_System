import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FraudRule } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Scale, Plus, Edit2, Trash2, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminRules() {
  const [rules, setRules] = useState<FraudRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingRule, setEditingRule] = useState<FraudRule | null>(null);
  const [formData, setFormData] = useState({
    rule_name: '',
    rule_description: '',
    threshold_value: 0,
    risk_weight: 10,
    is_active: true
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const { data, error } = await supabase
        .from('fraud_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRules(data as FraudRule[]);
    } catch (error) {
      console.error('Error fetching rules:', error);
      toast.error('Failed to load fraud rules');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (rule?: FraudRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        rule_name: rule.rule_name,
        rule_description: rule.rule_description,
        threshold_value: Number(rule.threshold_value) || 0,
        risk_weight: rule.risk_weight,
        is_active: rule.is_active
      });
    } else {
      setEditingRule(null);
      setFormData({
        rule_name: '',
        rule_description: '',
        threshold_value: 0,
        risk_weight: 10,
        is_active: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveRule = async () => {
    if (!formData.rule_name.trim() || !formData.rule_description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      if (editingRule) {
        const { error } = await supabase
          .from('fraud_rules')
          .update({
            rule_name: formData.rule_name,
            rule_description: formData.rule_description,
            threshold_value: formData.threshold_value,
            risk_weight: formData.risk_weight,
            is_active: formData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingRule.id);

        if (error) throw error;
        toast.success('Rule updated successfully');
      } else {
        const { error } = await supabase
          .from('fraud_rules')
          .insert({
            rule_name: formData.rule_name,
            rule_description: formData.rule_description,
            threshold_value: formData.threshold_value,
            risk_weight: formData.risk_weight,
            is_active: formData.is_active
          });

        if (error) throw error;
        toast.success('Rule created successfully');
      }

      setIsDialogOpen(false);
      fetchRules();
    } catch (error) {
      console.error('Error saving rule:', error);
      toast.error('Failed to save rule');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      const { error } = await supabase
        .from('fraud_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;
      toast.success('Rule deleted successfully');
      fetchRules();
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast.error('Failed to delete rule');
    }
  };

  const handleToggleActive = async (rule: FraudRule) => {
    try {
      const { error } = await supabase
        .from('fraud_rules')
        .update({ 
          is_active: !rule.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', rule.id);

      if (error) throw error;
      
      setRules(prev => 
        prev.map(r => r.id === rule.id ? { ...r, is_active: !r.is_active } : r)
      );
      
      toast.success(`Rule ${!rule.is_active ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error toggling rule:', error);
      toast.error('Failed to update rule');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            Fraud Detection Rules
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure detection thresholds and risk weights
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>

      {/* Rules Grid */}
      {rules.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Scale className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No rules configured</h3>
            <p className="text-muted-foreground mt-1">
              Create your first fraud detection rule to get started
            </p>
            <Button className="mt-4" onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rules.map(rule => (
            <Card key={rule.id} className={!rule.is_active ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{rule.rule_name}</CardTitle>
                    <CardDescription>{rule.rule_description}</CardDescription>
                  </div>
                  <Switch
                    checked={rule.is_active}
                    onCheckedChange={() => handleToggleActive(rule)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Threshold</p>
                    <p className="font-semibold">{rule.threshold_value || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Risk Weight</p>
                    <p className="font-semibold">{rule.risk_weight}/100</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleOpenDialog(rule)}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteRule(rule.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Rule Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRule ? 'Edit Rule' : 'Create New Rule'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ruleName">Rule Name *</Label>
              <Input
                id="ruleName"
                value={formData.rule_name}
                onChange={(e) => setFormData({ ...formData, rule_name: e.target.value })}
                placeholder="e.g., High Transaction Amount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ruleDescription">Description *</Label>
              <Textarea
                id="ruleDescription"
                value={formData.rule_description}
                onChange={(e) => setFormData({ ...formData, rule_description: e.target.value })}
                placeholder="Describe what this rule detects..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="threshold">Threshold Value</Label>
              <Input
                id="threshold"
                type="number"
                value={formData.threshold_value}
                onChange={(e) => setFormData({ ...formData, threshold_value: Number(e.target.value) })}
                placeholder="e.g., 10000"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Risk Weight</Label>
                <span className="text-sm font-medium">{formData.risk_weight}/100</span>
              </div>
              <Slider
                value={[formData.risk_weight]}
                onValueChange={([value]) => setFormData({ ...formData, risk_weight: value })}
                max={100}
                step={5}
              />
              <p className="text-xs text-muted-foreground">
                Higher weight means more impact on the overall risk score
              </p>
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRule} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Rule
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
