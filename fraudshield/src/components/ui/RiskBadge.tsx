import { cn } from '@/lib/utils';
import { RiskLevel } from '@/lib/types';
import { Shield, AlertTriangle, AlertOctagon } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const riskConfig = {
  safe: {
    label: 'Safe',
    icon: Shield,
    className: 'risk-badge-safe',
  },
  medium: {
    label: 'Medium Risk',
    icon: AlertTriangle,
    className: 'risk-badge-medium',
  },
  high: {
    label: 'High Risk',
    icon: AlertOctagon,
    className: 'risk-badge-high',
  },
};

const sizeConfig = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

const iconSizeConfig = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function RiskBadge({ level, showIcon = true, size = 'md', className }: RiskBadgeProps) {
  const config = riskConfig[level];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        config.className,
        sizeConfig[size],
        className
      )}
    >
      {showIcon && <Icon className={iconSizeConfig[size]} />}
      {config.label}
    </span>
  );
}