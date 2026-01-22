import { Contact } from '@/types/cam';
import { cn } from '@/lib/utils';
import { Phone, Mail, User, Star, Plus } from 'lucide-react';

interface PartnerContactsProps {
  contacts: Contact[];
  onAddContact?: () => void;
}

const roleConfig = {
  finance: { label: 'Finance', className: 'bg-green-100 text-green-700' },
  marketing: { label: 'Marketing', className: 'bg-purple-100 text-purple-700' },
  technical: { label: 'Technical', className: 'bg-blue-100 text-blue-700' },
  operations: { label: 'Operations', className: 'bg-orange-100 text-orange-700' },
  executive: { label: 'Executive', className: 'bg-slate-100 text-slate-700' },
  other: { label: 'Other', className: 'bg-muted text-muted-foreground' },
};

export function PartnerContacts({ contacts, onAddContact }: PartnerContactsProps) {
  const primaryContact = contacts.find(c => c.isPrimary);
  const otherContacts = contacts.filter(c => !c.isPrimary);

  if (contacts.length === 0) {
    return (
      <div className="panel-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Contacts</h3>
          {onAddContact && (
            <button 
              onClick={onAddContact}
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          )}
        </div>
        <div className="py-8 text-center">
          <p className="text-muted-foreground font-medium mb-1">No contacts</p>
          <p className="text-sm text-muted-foreground">
            Add contacts to track key stakeholders for this partner.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Contacts</h3>
        {onAddContact && (
          <button 
            onClick={onAddContact}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        )}
      </div>

      <div className="space-y-3">
        {/* Primary Contact */}
        {primaryContact && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground">
                    {primaryContact.firstName} {primaryContact.lastName}
                  </span>
                  <Star className="h-3.5 w-3.5 text-primary fill-primary" />
                  <span className={cn('text-xs px-2 py-0.5 rounded', roleConfig[primaryContact.role].className)}>
                    {roleConfig[primaryContact.role].label}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {primaryContact.email && (
                    <a 
                      href={`mailto:${primaryContact.email}`}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {primaryContact.email}
                    </a>
                  )}
                  {primaryContact.phone && (
                    <a 
                      href={`tel:${primaryContact.phone}`}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {primaryContact.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other Contacts */}
        {otherContacts.map((contact) => (
          <div 
            key={contact.id}
            className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground text-sm">
                    {contact.firstName} {contact.lastName}
                  </span>
                  <span className={cn('text-xs px-2 py-0.5 rounded', roleConfig[contact.role].className)}>
                    {roleConfig[contact.role].label}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {contact.email && (
                    <a 
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      <Mail className="h-3 w-3" />
                      {contact.email}
                    </a>
                  )}
                  {contact.phone && (
                    <a 
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      <Phone className="h-3 w-3" />
                      {contact.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
