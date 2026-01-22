import { Partner } from '@/types/cam';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PartnerHealthHistoryProps {
  partner: Partner;
}

// Mock health history - in production, this would come from the database
const mockHealthHistory = [
  { date: new Date('2025-01-18'), health: 'healthy' as const, reason: 'QBR completed successfully' },
  { date: new Date('2025-01-10'), health: 'attention' as const, reason: 'Support ticket volume increased' },
  { date: new Date('2024-12-20'), health: 'healthy' as const, reason: 'Contract renewed' },
  { date: new Date('2024-11-15'), health: 'neutral' as const, reason: 'Initial onboarding' },
];

const healthConfig = {
  healthy: { label: 'Healthy', className: 'bg-success/10 text-success', dotClass: 'bg-success' },
  attention: { label: 'Attention', className: 'bg-warning/10 text-warning', dotClass: 'bg-warning' },
  critical: { label: 'Critical', className: 'bg-destructive/10 text-destructive', dotClass: 'bg-destructive' },
  neutral: { label: 'Neutral', className: 'bg-muted text-muted-foreground', dotClass: 'bg-muted-foreground' },
};

function getHealthTrend(current: string, previous: string | undefined) {
  if (!previous) return null;
  const order = { critical: 0, attention: 1, neutral: 2, healthy: 3 };
  const currentScore = order[current as keyof typeof order] ?? 2;
  const previousScore = order[previous as keyof typeof order] ?? 2;
  
  if (currentScore > previousScore) return 'improving';
  if (currentScore < previousScore) return 'declining';
  return 'stable';
}

export function PartnerHealthHistory({ partner }: PartnerHealthHistoryProps) {
  const history = mockHealthHistory;
  const trend = getHealthTrend(partner.health, history[1]?.health);
  const currentHealth = healthConfig[partner.health];

  return (
    <div className="panel-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Health Status</h3>
      
      {/* Current Status */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className={cn('h-3 w-3 rounded-full', currentHealth.dotClass)} />
          <span className="font-medium text-foreground">{currentHealth.label}</span>
        </div>
        {trend && (
          <div className={cn(
            'flex items-center gap-1 text-sm',
            trend === 'improving' && 'text-success',
            trend === 'declining' && 'text-destructive',
            trend === 'stable' && 'text-muted-foreground'
          )}>
            {trend === 'improving' && <TrendingUp className="h-4 w-4" />}
            {trend === 'declining' && <TrendingDown className="h-4 w-4" />}
            {trend === 'stable' && <Minus className="h-4 w-4" />}
            <span className="capitalize">{trend}</span>
          </div>
        )}
      </div>

      {/* History */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-muted-foreground mb-2">History</div>
        {history.map((entry, index) => {
          const config = healthConfig[entry.health];
          return (
            <div key={index} className="flex items-start gap-3 text-sm">
              <div className={cn('h-2 w-2 rounded-full mt-1.5 shrink-0', config.dotClass)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-foreground">{config.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {entry.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-muted-foreground truncate">{entry.reason}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
