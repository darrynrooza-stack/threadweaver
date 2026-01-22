import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInteractionModal } from '@/contexts/InteractionModalContext';
import { mockPartners } from '@/data/mockData';
import { InteractionChannel, InteractionType } from '@/types/cam';
import { Phone, Mail, MessageSquare, Calendar as CalendarIcon, Headphones, Cpu, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const channelOptions: { value: InteractionChannel; label: string; icon: React.ElementType }[] = [
  { value: 'call', label: 'Call', icon: Phone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'slack', label: 'Slack', icon: MessageSquare },
  { value: 'meeting', label: 'Meeting', icon: CalendarIcon },
  { value: 'support', label: 'Support', icon: Headphones },
  { value: 'system', label: 'System', icon: Cpu },
];

const interactionTypeOptions: { value: InteractionType; label: string }[] = [
  { value: 'tech_query', label: 'Tech Query' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'meeting_request', label: 'Meeting Request' },
  { value: 'integration_help', label: 'Integration Help' },
  { value: 'account_closure', label: 'Account Closure' },
  { value: 'process_advice', label: 'Process Advice' },
  { value: 'escalation', label: 'Escalation' },
  { value: 'support_ticket', label: 'Support Ticket' },
  { value: 'system_alert', label: 'System Alert' },
];

export function LogInteractionModal() {
  const { isOpen, closeModal, preselectedPartnerId } = useInteractionModal();
  const { toast } = useToast();
  
  const [partnerId, setPartnerId] = useState<string>('');
  const [channel, setChannel] = useState<InteractionChannel | ''>('');
  const [interactionType, setInteractionType] = useState<InteractionType | ''>('');
  const [summary, setSummary] = useState('');
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>();
  const [actionRequired, setActionRequired] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && preselectedPartnerId) {
      setPartnerId(preselectedPartnerId);
    }
  }, [isOpen, preselectedPartnerId]);

  const resetForm = () => {
    setPartnerId('');
    setChannel('');
    setInteractionType('');
    setSummary('');
    setFollowUpDate(undefined);
    setActionRequired(false);
  };

  const handleClose = () => {
    resetForm();
    closeModal();
  };

  const handleSubmit = async () => {
    if (!partnerId || !channel || !interactionType || !summary.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const partner = mockPartners.find(p => p.id === partnerId);
    
    toast({
      title: 'Interaction logged',
      description: `Successfully logged ${channel} interaction with ${partner?.name}.`,
    });
    
    setIsSubmitting(false);
    handleClose();
  };

  const isFormValid = partnerId && channel && interactionType && summary.trim();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Log Interaction</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Record a partner interaction for tracking and follow-up.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Partner Select */}
          <div className="space-y-2">
            <Label htmlFor="partner">Partner *</Label>
            <Select value={partnerId} onValueChange={setPartnerId}>
              <SelectTrigger id="partner" className="bg-muted/50 border-border">
                <SelectValue placeholder="Select a partner..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                {mockPartners.map((partner) => (
                  <SelectItem key={partner.id} value={partner.id}>
                    <div className="flex items-center gap-2">
                      <span>{partner.name}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        ({partner.tier})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Channel Select */}
          <div className="space-y-2">
            <Label htmlFor="channel">Channel *</Label>
            <Select value={channel} onValueChange={(val) => setChannel(val as InteractionChannel)}>
              <SelectTrigger id="channel" className="bg-muted/50 border-border">
                <SelectValue placeholder="Select channel..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                {channelOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Interaction Type Select */}
          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select value={interactionType} onValueChange={(val) => setInteractionType(val as InteractionType)}>
              <SelectTrigger id="type" className="bg-muted/50 border-border">
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                {interactionTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Summary Textarea */}
          <div className="space-y-2">
            <Label htmlFor="summary">Summary *</Label>
            <Textarea
              id="summary"
              placeholder="Describe the interaction..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="bg-muted/50 border-border min-h-[100px] resize-none"
            />
          </div>

          {/* Follow-up Date Picker */}
          <div className="space-y-2">
            <Label>Follow-up Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-muted/50 border-border",
                    !followUpDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {followUpDate ? format(followUpDate, "PPP") : <span>Pick a follow-up date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50" align="start">
                <Calendar
                  mode="single"
                  selected={followUpDate}
                  onSelect={setFollowUpDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Action Required Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4">
            <div className="space-y-0.5">
              <Label htmlFor="action-required" className="text-sm font-medium">
                Action Required
              </Label>
              <p className="text-xs text-muted-foreground">
                Mark if this interaction needs follow-up action
              </p>
            </div>
            <Switch
              id="action-required"
              checked={actionRequired}
              onCheckedChange={setActionRequired}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isFormValid || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Log Interaction'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
