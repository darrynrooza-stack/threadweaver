// CAM Intelligence CRM Types

export type PartnerHealth = 'healthy' | 'attention' | 'critical' | 'neutral';

export type InteractionChannel = 'call' | 'email' | 'slack' | 'meeting' | 'support' | 'system';

export type InteractionType = 
  | 'tech_query' 
  | 'pricing' 
  | 'meeting_request' 
  | 'integration_help' 
  | 'account_closure' 
  | 'process_advice'
  | 'escalation'
  | 'support_ticket'
  | 'system_alert';

export type ThreadOwner = 'cam' | 'support' | 'risk' | 'ops' | 'finance' | 'other';

export type ThreadStatus = 'open' | 'in_progress' | 'awaiting_response' | 'resolved';

export type ThreadVisibility = 'action_required' | 'fyi' | 'owned';

export type ContactRole = 'finance' | 'marketing' | 'technical' | 'operations' | 'executive' | 'other';

export interface Partner {
  id: string;
  name: string;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  health: PartnerHealth;
  lastActivity: Date;
  openThreads: number;
  revenue: number;
  segment: string;
  accountManager: string;
}

export interface Contact {
  id: string;
  partnerId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role: ContactRole;
  isPrimary: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Interaction {
  id: string;
  partnerId: string;
  partnerName: string;
  type: 'direct' | 'indirect';
  channel: InteractionChannel;
  interactionType: InteractionType;
  summary: string;
  date: Date;
  resolved: boolean;
  followUpRequired: boolean;
  followUpDate?: Date;
  owner: ThreadOwner;
}

export interface Thread {
  id: string;
  partnerId: string;
  partnerName: string;
  title: string;
  status: ThreadStatus;
  owner: ThreadOwner;
  visibility: ThreadVisibility;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
  interactionCount: number;
  lastActivity: string;
}

export interface DailyFocusItem {
  id: string;
  type: 'follow_up' | 'thread' | 'silent_partner' | 'escalation' | 'upsell';
  partnerId: string;
  partnerName: string;
  title: string;
  reason: string;
  owner: ThreadOwner;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  actionRequired: boolean;
}

export interface MetricCard {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
}
