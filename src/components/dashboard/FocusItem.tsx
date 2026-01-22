import { cn } from '@/lib/utils';
import { DailyFocusItem, ThreadOwner } from '@/types/cam';
import {
  AlertTriangle,
  Clock,
  TrendingUp,
  MessageSquare,
  User,
  ChevronRight,
} from 'lucide-react';

interface FocusItemProps {
  item: DailyFocusItem;
  onClick?: () => void;
}

const typeConfig = {
  escalation: {
    icon: AlertTriangle,
    color: 'text-status-critical',
    bg: 'bg-status-critical/10',
  },
  follow_up: {
    icon: Clock,
    color: 'text-status-attention',
    bg: 'bg-status-attention/10',
  },
  silent_partner: {
    icon: User,
    color: 'text-muted-foreground',
    bg: 'bg-muted',
  },
  thread: {
    icon: MessageSquare,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  upsell: {
    icon: TrendingUp,
    color: 'text-status-healthy',
    bg: 'bg-status-healthy/10',
  },
};

const ownerLabels: Record<ThreadOwner, string> = {
  cam: 'You own this',
  support: 'Support owns this',
  risk: 'Risk owns this',
  ops: 'Ops owns this',
  finance: 'Finance owns this',
  other: 'External team',
};

export function FocusItem({ item, onClick }: FocusItemProps) {
  const config = typeConfig[item.type];
  const Icon = config.icon;

  return (
    <div
      onClick={onClick}
      className={cn(
        'group flex items-start gap-4 p-4 rounded-xl border border-transparent transition-all duration-200 cursor-pointer',
        'hover:bg-accent/50 hover:border-border/50',
        item.priority === 'urgent' && 'border-status-critical/30 bg-status-critical/5',
        item.priority === 'high' && 'border-status-attention/20 bg-status-attention/5'
      )}
    >
      {/* Icon */}
      <div className={cn('p-2 rounded-lg shrink-0', config.bg)}>
        <Icon className={cn('h-4 w-4', config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{item.partnerName}</span>
          {item.priority === 'urgent' && (
            <span className="status-badge status-critical">Urgent</span>
          )}
          {item.priority === 'high' && (
            <span className="status-badge status-attention">High</span>
          )}
        </div>
        <h4 className="font-medium text-foreground truncate">{item.title}</h4>
        <p className="text-sm text-muted-foreground">{item.reason}</p>
        <div className="flex items-center gap-3 pt-1">
          <span
            className={cn(
              'text-xs',
              item.actionRequired ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {ownerLabels[item.owner]}
          </span>
          {item.dueDate && (
            <span className="text-xs text-muted-foreground">
              Due {item.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-foreground shrink-0 transition-colors" />
    </div>
  );
}
