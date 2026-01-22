import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  GitBranch,
  BarChart3,
  FileText,
  BookOpen,
  Settings,
  Search,
  Plus,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { useInteractionModal } from '@/contexts/InteractionModalContext';
import { mockDailyFocus, mockInteractions } from '@/data/mockData';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
  badgeType?: 'default' | 'warning' | 'critical';
}

// Calculate action required counts from mock data
const getActionRequiredCount = () => {
  const focusActionRequired = mockDailyFocus.filter(item => item.actionRequired).length;
  const interactionActionRequired = mockInteractions.filter(item => item.followUpRequired && !item.resolved).length;
  return focusActionRequired + interactionActionRequired;
};

const mainNav: NavItem[] = [
  { icon: LayoutDashboard, label: 'Daily Focus', href: '/', badge: getActionRequiredCount(), badgeType: 'warning' },
  { icon: Users, label: 'Partners', href: '/partners', badge: 847 },
  { icon: MessageSquare, label: 'Interactions', href: '/interactions' },
  { icon: GitBranch, label: 'Threads', href: '/threads', badge: 23 },
];

const insightsNav: NavItem[] = [
  { icon: BarChart3, label: 'Trends', href: '/trends' },
  { icon: FileText, label: 'Reports', href: '/reports' },
  { icon: BookOpen, label: 'Playbook', href: '/playbook' },
];

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function Sidebar({ currentPath, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { openModal } = useInteractionModal();
  const { user, signOut } = useAuth();

  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || 'U';

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = currentPath === item.href;
    const Icon = item.icon;

    return (
      <button
        onClick={() => onNavigate(item.href)}
        className={cn(
          'nav-item w-full',
          isActive && 'nav-item-active'
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  item.badgeType === 'warning' && 'bg-status-attention/20 text-status-attention',
                  item.badgeType === 'critical' && 'bg-status-critical/20 text-status-critical',
                  !item.badgeType && 'bg-muted text-muted-foreground'
                )}
              >
                {item.badge}
              </span>
            )}
          </>
        )}
      </button>
    );
  };

  return (
    <aside
      className={cn(
        'h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-sidebar-primary flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-black text-sm">NMI</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-sidebar-foreground text-sm">CAM Intelligence</h1>
              <p className="text-xs text-sidebar-foreground/60">Partner CRM</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {!collapsed && (
        <div className="p-3 space-y-2">
          <button 
            onClick={() => openModal()}
            className="w-full flex items-center gap-2 px-3 py-2 bg-sidebar-primary text-sidebar-primary-foreground rounded-md text-sm font-semibold hover:bg-sidebar-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sidebar-foreground/50" />
            <input
              type="text"
              placeholder="Search partners..."
              className="w-full pl-9 pr-3 py-2 bg-sidebar-accent/50 border border-sidebar-border rounded-md text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:outline-none focus:ring-1 focus:ring-sidebar-primary/50"
            />
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-6 overflow-y-auto scrollbar-thin">
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Workspace
            </p>
          )}
          {mainNav.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>

        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Insights
            </p>
          )}
          {insightsNav.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => onNavigate('/settings')}
          className="nav-item w-full"
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </button>

        {!collapsed && (
          <div className="mt-3 relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full p-3 rounded-md bg-sidebar-accent/30 hover:bg-sidebar-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center">
                  <span className="text-sidebar-primary text-sm font-semibold">{userInitials}</span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{userName}</p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</p>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 text-sidebar-foreground/60 transition-transform",
                  showUserMenu && "rotate-180"
                )} />
              </div>
            </button>
            
            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-sidebar border border-sidebar-border rounded-md shadow-lg overflow-hidden">
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
