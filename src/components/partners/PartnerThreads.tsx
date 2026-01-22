import { Thread } from '@/types/cam';
import { cn } from '@/lib/utils';
import { MessageSquare, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PartnerThreadsProps {
  threads: Thread[];
}

const statusConfig = {
  open: { label: 'Open', className: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'In Progress', className: 'bg-purple-100 text-purple-700' },
  awaiting_response: { label: 'Awaiting', className: 'bg-warning/10 text-warning' },
  resolved: { label: 'Resolved', className: 'bg-success/10 text-success' },
};

const priorityConfig = {
  low: { className: 'border-l-muted-foreground' },
  medium: { className: 'border-l-blue-500' },
  high: { className: 'border-l-warning' },
  urgent: { className: 'border-l-destructive' },
};

export function PartnerThreads({ threads }: PartnerThreadsProps) {
  const activeThreads = threads.filter(t => t.status !== 'resolved');
  const resolvedThreads = threads.filter(t => t.status === 'resolved');

  if (threads.length === 0) {
    return (
      <div className="panel-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Threads</h3>
        <div className="py-8 text-center">
          <p className="text-muted-foreground font-medium mb-1">No threads</p>
          <p className="text-sm text-muted-foreground">
            Open threads track ongoing issues and discussions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Threads</h3>
        <span className="text-sm text-muted-foreground">
          {activeThreads.length} active
        </span>
      </div>
      
      <div className="space-y-3">
        {activeThreads.map((thread) => {
          const status = statusConfig[thread.status];
          const priority = priorityConfig[thread.priority];
          
          return (
            <div 
              key={thread.id} 
              className={cn(
                'p-3 bg-muted/30 rounded-lg border-l-2 hover:bg-muted/50 transition-colors cursor-pointer',
                priority.className
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-medium text-foreground text-sm leading-tight">
                  {thread.title}
                </h4>
                <span className={cn('text-xs px-2 py-0.5 rounded shrink-0', status.className)}>
                  {status.label}
                </span>
              </div>
              
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {thread.owner.toUpperCase()}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {thread.interactionCount}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(thread.updatedAt, { addSuffix: true })}
                </span>
              </div>
            </div>
          );
        })}

        {resolvedThreads.length > 0 && (
          <div className="pt-2 border-t border-border">
            <div className="text-xs text-muted-foreground mb-2">
              {resolvedThreads.length} resolved
            </div>
            {resolvedThreads.slice(0, 2).map((thread) => (
              <div 
                key={thread.id} 
                className="py-2 text-sm text-muted-foreground opacity-60"
              >
                {thread.title}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
