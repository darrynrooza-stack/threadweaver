import { mockPartners, mockInteractions, mockThreads, mockContacts } from '@/data/mockData';
import { ArrowLeft, Phone, Mail, Calendar, TrendingUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PartnerTimeline } from './PartnerTimeline';
import { PartnerHealthHistory } from './PartnerHealthHistory';
import { PartnerThreads } from './PartnerThreads';
import { PartnerContacts } from './PartnerContacts';

interface PartnerProfileViewProps {
  partnerId: string;
  onBack: () => void;
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

export function PartnerProfileView({ partnerId, onBack }: PartnerProfileViewProps) {
  const partner = mockPartners.find(p => p.id === partnerId);
  const partnerInteractions = mockInteractions.filter(i => i.partnerId === partnerId);
  const partnerThreads = mockThreads.filter(t => t.partnerId === partnerId);
  const partnerContacts = mockContacts.filter(c => c.partnerId === partnerId);
  
  if (!partner) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="panel-card p-12 text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">Partner not found</h2>
          <p className="text-muted-foreground mb-4">The partner you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Back to Partners
          </button>
        </div>
      </div>
    );
  }

  const health = healthConfig[partner.health];

  return (
    <div className="min-h-screen p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'h-12 w-12 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0',
                tierColors[partner.tier]
              )}
            >
              <span className="text-white font-semibold">
                {partner.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{partner.name}</h1>
                <span className={cn('status-badge', health.className)}>
                  {health.label}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="capitalize">{partner.tier} Tier</span>
                <span>•</span>
                <span>{partner.segment}</span>
                <span>•</span>
                <span>Owner: {partner.accountManager}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Call">
            <Phone className="h-5 w-5 text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Email">
            <Mail className="h-5 w-5 text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Schedule">
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="panel-card p-4">
          <div className="text-sm text-muted-foreground mb-1">Annual Revenue</div>
          <div className="text-2xl font-bold text-foreground">${(partner.revenue / 1000).toFixed(0)}k</div>
          <div className="flex items-center gap-1 text-sm text-success mt-1">
            <TrendingUp className="h-4 w-4" />
            <span>+12% YoY</span>
          </div>
        </div>
        <div className="panel-card p-4">
          <div className="text-sm text-muted-foreground mb-1">Open Threads</div>
          <div className="text-2xl font-bold text-foreground">{partner.openThreads}</div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <Minus className="h-4 w-4" />
            <span>No change</span>
          </div>
        </div>
        <div className="panel-card p-4">
          <div className="text-sm text-muted-foreground mb-1">Last Activity</div>
          <div className="text-2xl font-bold text-foreground">
            {partner.lastActivity.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <span>{Math.floor((Date.now() - partner.lastActivity.getTime()) / (1000 * 60 * 60 * 24))} days ago</span>
          </div>
        </div>
        <div className="panel-card p-4">
          <div className="text-sm text-muted-foreground mb-1">Total Interactions</div>
          <div className="text-2xl font-bold text-foreground">{partnerInteractions.length}</div>
          <div className="flex items-center gap-1 text-sm text-success mt-1">
            <TrendingUp className="h-4 w-4" />
            <span>+3 this week</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <PartnerTimeline interactions={partnerInteractions} />
        </div>

        {/* Sidebar - Contacts, Health & Threads */}
        <div className="space-y-6">
          <PartnerContacts contacts={partnerContacts} />
          <PartnerHealthHistory partner={partner} />
          <PartnerThreads threads={partnerThreads} />
        </div>
      </div>
    </div>
  );
}
