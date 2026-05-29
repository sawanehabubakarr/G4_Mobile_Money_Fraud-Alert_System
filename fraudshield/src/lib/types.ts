// Core types for the Fraud Alert System

export type RiskLevel = 'safe' | 'medium' | 'high';
export type AlertStatus = 'pending' | 'confirmed_fraud' | 'dismissed';
export type TransactionType = 'send' | 'receive' | 'withdraw' | 'deposit';
export type UserRole = 'admin' | 'user' | 'fraud_analyst';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone_number: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: TransactionType;
  sender_phone: string;
  receiver_phone: string;
  description: string | null;
  ip_address: string | null;
  gps_location: string | null;
  device_fingerprint: string | null;
  risk_score: number;
  risk_level: RiskLevel;
  created_at: string;
}

export interface FraudAlert {
  id: string;
  user_id: string;
  transaction_id: string;
  alert_type: string;
  alert_message: string;
  risk_score: number;
  risk_level: RiskLevel;
  status: AlertStatus;
  user_feedback: string | null;
  created_at: string;
  updated_at: string;
  transaction?: Transaction;
}

export interface FraudRule {
  id: string;
  rule_name: string;
  rule_description: string;
  threshold_value: number | null;
  risk_weight: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

// Dashboard stats
export interface DashboardStats {
  totalTransactions: number;
  totalAlerts: number;
  highRiskAlerts: number;
  pendingAlerts: number;
}

export interface AlertTrend {
  date: string;
  count: number;
  highRisk: number;
  mediumRisk: number;
}