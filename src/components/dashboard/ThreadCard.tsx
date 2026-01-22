import { cn } from '@/lib/utils';
import { Thread, ThreadOwner } from '@/types/cam';
import { MessageSquare, User, Clock, AlertCircle } from 'lucide-react';

interface ThreadCardProps {
  thread: Thread;
  onClick?: () => void;
}

const statusConfig = {
  open: { label: 'Open', className: 'status-neutral' },
  in_progress: { label: 'In Progress', className: 'status-healthy' },
  awaiting_response: { label: 'Awaiting', className: 'status-attention' },
  resolved: { label: 'Resolved', className: 'bg-muted/50 text-muted-foreground' },
};

const ownerIcons: Record<ThreadOwner, React.ElementType> = {
  cam: User,
  support: MessageSquare,
  risk: AlertCircle,
  ops: Clock,
  finance: Clock,
  other: Clock,
};

export function ThreadCard({ thread, onClick }: ThreadCardProps) {
  const status = statusConfig[thread.status];
  const OwnerIcon = ownerIcons[thread.owner];

  return (
    <div
      onClick={onClick}
      className="thread-card group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{thread.partnerName}</span>
            <span className={cn('status-badge', status.className)}>
              {status.label}
            </span>
            {thread.priority === 'urgent' && (
              <span className="status-badge status-critical">Urgent</span>
            )}
          </div>
          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
            {thread.title}
          </h4>
          <p className="text-sm text-muted-foreground truncate">{thread.lastActivity}</p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <OwnerIcon className="h-3.5 w-3.5" />
            <span className="text-xs capitalize">{thread.owner}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageSquare className="h-3 w-3" />
            {thread.interactionCount}
          </div>
        </div>
      </div>
    </div>
  );
}
