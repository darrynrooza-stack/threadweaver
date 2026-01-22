import { cn } from '@/lib/utils';

interface HealthRingProps {
  healthy: number;
  attention: number;
  critical: number;
  size?: 'sm' | 'md' | 'lg';
}

export function HealthRing({ healthy, attention, critical, size = 'md' }: HealthRingProps) {
  const total = healthy + attention + critical;
  const healthyPercent = (healthy / total) * 100;
  const attentionPercent = (attention / total) * 100;
  const criticalPercent = (critical / total) * 100;

  const dimensions = {
    sm: { size: 80, stroke: 8 },
    md: { size: 120, stroke: 10 },
    lg: { size: 160, stroke: 12 },
  };

  const { size: ringSize, stroke } = dimensions[size];
  const radius = (ringSize - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const healthyOffset = 0;
  const attentionOffset = (healthyPercent / 100) * circumference;
  const criticalOffset = ((healthyPercent + attentionPercent) / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={ringSize}
        height={ringSize}
        viewBox={`0 0 ${ringSize} ${ringSize}`}
        className="transform -rotate-90"
      >
        {/* Background */}
        <circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
        />
        
        {/* Healthy segment */}
        <circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--status-healthy))"
          strokeWidth={stroke}
          strokeDasharray={`${(healthyPercent / 100) * circumference} ${circumference}`}
          strokeDashoffset={-healthyOffset}
          strokeLinecap="round"
        />
        
        {/* Attention segment */}
        <circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--status-attention))"
          strokeWidth={stroke}
          strokeDasharray={`${(attentionPercent / 100) * circumference} ${circumference}`}
          strokeDashoffset={-attentionOffset}
          strokeLinecap="round"
        />
        
        {/* Critical segment */}
        <circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--status-critical))"
          strokeWidth={stroke}
          strokeDasharray={`${(criticalPercent / 100) * circumference} ${circumference}`}
          strokeDashoffset={-criticalOffset}
          strokeLinecap="round"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn(
          'font-bold text-foreground',
          size === 'sm' && 'text-lg',
          size === 'md' && 'text-2xl',
          size === 'lg' && 'text-3xl'
        )}>
          {total}
        </span>
        <span className="text-xs text-muted-foreground">partners</span>
      </div>
    </div>
  );
}
