import { cn } from '@/lib/utils';
import { Interaction } from '@/types/cam';
import {
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  HeadphonesIcon,
  Cpu,
  ArrowUpRight,
  Clock,
} from 'lucide-react';

interface InteractionRowProps {
  interaction: Interaction;
  onClick?: () => void;
}

const channelIcons = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  slack: MessageSquare,
  support: HeadphonesIcon,
  system: Cpu,
};

const channelColors = {
  call: 'bg-blue-500/10 text-blue-400',
  email: 'bg-purple-500/10 text-purple-400',
  meeting: 'bg-teal-500/10 text-teal-400',
  slack: 'bg-orange-500/10 text-orange-400',
  support: 'bg-pink-500/10 text-pink-400',
  system: 'bg-gray-500/10 text-gray-400',
};

export function InteractionRow({ interaction, onClick }: InteractionRowProps) {
  const ChannelIcon = channelIcons[interaction.channel];

  return (
    <div
      onClick={onClick}
      className="group flex items-start gap-4 p-4 rounded-xl border border-transparent hover:bg-accent/50 hover:border-border/50 transition-all cursor-pointer"
    >
      {/* Channel Icon */}
      <div className={cn('p-2.5 rounded-lg shrink-0', channelColors[interaction.channel])}>
        <ChannelIcon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-foreground">{interaction.partnerName}</span>
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              interaction.type === 'direct'
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {interaction.type === 'direct' ? 'Direct' : 'Indirect'}
          </span>
          {interaction.followUpRequired && !interaction.resolved && (
            <span className="flex items-center gap-1 text-xs text-status-attention">
              <Clock className="h-3 w-3" />
              Follow-up
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{interaction.summary}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
          <span className="capitalize">{interaction.interactionType.replace('_', ' ')}</span>
          <span>•</span>
          <span>
            {interaction.date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </span>
          <span>•</span>
          <span className="capitalize">{interaction.owner}</span>
        </div>
      </div>

      {/* Status & Arrow */}
      <div className="flex items-center gap-3 shrink-0">
        <span
          className={cn(
            'text-xs px-2 py-1 rounded-full',
            interaction.resolved
              ? 'bg-status-healthy/10 text-status-healthy'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {interaction.resolved ? 'Resolved' : 'Open'}
        </span>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
      </div>
    </div>
  );
}
