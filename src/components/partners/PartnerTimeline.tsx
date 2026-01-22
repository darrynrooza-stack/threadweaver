import { Interaction } from '@/types/cam';
import { cn } from '@/lib/utils';
import { Phone, Mail, MessageSquare, Users, Headphones, AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface PartnerTimelineProps {
  interactions: Interaction[];
}

const channelIcons = {
  call: Phone,
  email: Mail,
  slack: MessageSquare,
  meeting: Users,
  support: Headphones,
  system: AlertCircle,
};

const channelColors = {
  call: 'bg-blue-100 text-blue-700',
  email: 'bg-purple-100 text-purple-700',
  slack: 'bg-pink-100 text-pink-700',
  meeting: 'bg-green-100 text-green-700',
  support: 'bg-orange-100 text-orange-700',
  system: 'bg-red-100 text-red-700',
};

const typeLabels: Record<string, string> = {
  tech_query: 'Technical Query',
  pricing: 'Pricing Discussion',
  meeting_request: 'Meeting',
  integration_help: 'Integration Support',
  account_closure: 'Account Closure',
  process_advice: 'Process Advice',
  escalation: 'Escalation',
  support_ticket: 'Support Ticket',
  system_alert: 'System Alert',
};

export function PartnerTimeline({ interactions }: PartnerTimelineProps) {
  const sortedInteractions = [...interactions].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  if (interactions.length === 0) {
    return (
      <div className="panel-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Activity Timeline</h3>
        <div className="py-8 text-center">
          <p className="text-muted-foreground font-medium mb-1">No interactions recorded</p>
          <p className="text-sm text-muted-foreground">
            Capture partner activity to track engagement and surface risk early.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Activity Timeline</h3>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
        
        <div className="space-y-4">
          {sortedInteractions.map((interaction, index) => {
            const Icon = channelIcons[interaction.channel];
            const isLast = index === sortedInteractions.length - 1;
            
            return (
              <div key={interaction.id} className="relative flex gap-4">
                {/* Icon */}
                <div className={cn(
                  'relative z-10 h-10 w-10 rounded-full flex items-center justify-center shrink-0',
                  channelColors[interaction.channel]
                )}>
                  <Icon className="h-4 w-4" />
                </div>

                {/* Content */}
                <div className={cn(
                  'flex-1 pb-4',
                  !isLast && 'border-b border-border'
                )}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {typeLabels[interaction.interactionType] || interaction.interactionType}
                      </span>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded',
                        interaction.type === 'direct' 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-muted text-muted-foreground'
                      )}>
                        {interaction.type === 'direct' ? 'Direct' : 'Indirect'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {format(interaction.date, 'MMM d, h:mm a')}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {interaction.summary}
                  </p>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-muted-foreground capitalize">
                      Owner: {interaction.owner}
                    </span>
                    {interaction.followUpRequired && interaction.followUpDate && (
                      <span className="flex items-center gap-1 text-warning">
                        <Clock className="h-3 w-3" />
                        Follow-up: {format(interaction.followUpDate, 'MMM d')}
                      </span>
                    )}
                    {interaction.resolved && (
                      <span className="text-success">Resolved</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
