-- Add fraud_analyst to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'fraud_analyst';