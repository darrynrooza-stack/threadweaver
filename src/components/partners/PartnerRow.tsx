import { cn } from '@/lib/utils';
import { Partner } from '@/types/cam';
import { ChevronRight, GitBranch } from 'lucide-react';

interface PartnerRowProps {
  partner: Partner;
  onClick?: () => void;
}

const healthConfig = {
  healthy: { label: 'Healthy', className: 'status-healthy' },
  attention: { label: 'Attention', className: 'status-attention' },
  critical: { label: 'Critical', className: 'status-critical' },
  neutral: { label: 'Neutral', className: 'status-neutral' },
};

const tierColors = {
  platinum: 'from-slate-300 to-slate-500',
  gold: 'from-amber-400 to-amber-600',
  silver: 'from-gray-300 to-gray-500',
  bronze: 'from-orange-400 to-orange-700',
};

export function PartnerRow({ partner, onClick }: PartnerRowProps) {
  const health = healthConfig[partner.health];

  return (
    <div
      onClick={onClick}
      className="partner-row group"
    >
      {/* Avatar */}
      <div
        className={cn(
          'h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0',
          tierColors[partner.tier]
        )}
      >
        <span className="text-white font-semibold text-sm">
          {partner.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
            {partner.name}
          </h4>
          <span className={cn('status-badge', health.className)}>
            {health.label}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="capitalize">{partner.tier}</span>
          <span>•</span>
          <span>{partner.segment}</span>
          <span>•</span>
          <span>${(partner.revenue / 1000).toFixed(0)}k ARR</span>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 shrink-0">
        {partner.openThreads > 0 && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <GitBranch className="h-4 w-4" />
            <span className="text-sm">{partner.openThreads}</span>
          </div>
        )}
        <div className="text-xs text-muted-foreground">
          {partner.lastActivity.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
      </div>
    </div>
  );
}
