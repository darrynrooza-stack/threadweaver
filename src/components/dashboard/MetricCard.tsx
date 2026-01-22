import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'warning' | 'critical';
}

export function MetricCard({
  label,
  value,
  change,
  changeLabel,
  trend,
  icon,
  variant = 'default',
}: MetricCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div
      className={cn(
        'metric-card group',
        variant === 'primary' && 'border-primary/30',
        variant === 'warning' && 'border-status-attention/30',
        variant === 'critical' && 'border-status-critical/30'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p
            className={cn(
              'text-2xl font-semibold',
              variant === 'primary' && 'text-primary',
              variant === 'warning' && 'text-status-attention',
              variant === 'critical' && 'text-status-critical'
            )}
          >
            {value}
          </p>
        </div>
        {icon && (
          <div
            className={cn(
              'p-2 rounded-lg',
              variant === 'default' && 'bg-muted',
              variant === 'primary' && 'bg-primary/10',
              variant === 'warning' && 'bg-status-attention/10',
              variant === 'critical' && 'bg-status-critical/10'
            )}
          >
            {icon}
          </div>
        )}
      </div>
      {(change !== undefined || changeLabel) && (
        <div className="mt-3 flex items-center gap-1.5 text-sm">
          {change !== undefined && (
            <>
              <TrendIcon
                className={cn(
                  'h-3.5 w-3.5',
                  trend === 'up' && 'text-status-healthy',
                  trend === 'down' && 'text-status-critical',
                  trend === 'neutral' && 'text-muted-foreground'
                )}
              />
              <span
                className={cn(
                  trend === 'up' && 'text-status-healthy',
                  trend === 'down' && 'text-status-critical',
                  trend === 'neutral' && 'text-muted-foreground'
                )}
              >
                {change > 0 ? '+' : ''}
                {change}%
              </span>
            </>
          )}
          {changeLabel && (
            <span className="text-muted-foreground">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
