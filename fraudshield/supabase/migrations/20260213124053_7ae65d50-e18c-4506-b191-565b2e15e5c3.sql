-- Allow fraud analysts to view all transactions
CREATE POLICY "Fraud analysts can view all transactions"
ON public.transactions
FOR SELECT
USING (has_role(auth.uid(), 'fraud_analyst'::app_role));

-- Allow fraud analysts to view all alerts
CREATE POLICY "Fraud analysts can view all alerts"
ON public.fraud_alerts
FOR SELECT
USING (has_role(auth.uid(), 'fraud_analyst'::app_role));

-- Allow fraud analysts to view all profiles
CREATE POLICY "Fraud analysts can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'fraud_analyst'::app_role));

-- Allow fraud analysts to view active fraud rules
CREATE POLICY "Fraud analysts can view active rules"
ON public.fraud_rules
FOR SELECT
USING (has_role(auth.uid(), 'fraud_analyst'::app_role) AND is_active = true);

-- Allow fraud analysts to view audit logs
CREATE POLICY "Fraud analysts can view audit logs"
ON public.audit_logs
FOR SELECT
USING (has_role(auth.uid(), 'fraud_analyst'::app_role));