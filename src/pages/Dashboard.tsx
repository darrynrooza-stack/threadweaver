import { MetricCard } from "@/components/dashboard/MetricCard";
import { FocusItem } from "@/components/dashboard/FocusItem";
import { ThreadCard } from "@/components/dashboard/ThreadCard";
import { HealthRing } from "@/components/dashboard/HealthRing";
import { mockDailyFocus } from "@/data/mockData";
import { Users, GitBranch, Clock, Activity, AlertTriangle, TrendingUp } from "lucide-react";
import { useData } from "@/contexts/DataContext";

export function Dashboard() {
  const { partners, threads, interactions } = useData();

  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const openThreads = threads.filter(t => t.status !== "resolved").length;

  const overdueFollowUps = interactions.filter(i => {
    if (!i.followUpRequired) return false;
    if (!i.followUpDate) return false;
    if (i.resolved) return false;
    return i.followUpDate < startOfToday;
  }).length;

  const weeklyInteractions = interactions.filter(i => {
    const diffMs = now.getTime() - i.date.getTime();
    const days = diffMs / (1000 * 60 * 60 * 24);
    return days <= 7;
  }).length;

  const healthyPartners = partners.filter(p => p.health === "healthy").length;
  const attentionNeeded = partners.filter(p => p.health === "attention").length;
  const criticalPartners = partners.filter(p => p.health === "critical").length;

  const urgentItems = mockDailyFocus.filter(item => item.priority === "urgent" || item.priority === "high");
  const otherItems = mockDailyFocus.filter(item => item.priority !== "urgent" && item.priority !== "high");

  const recentThreads = threads
    .filter(t => t.visibility === "owned")
    .slice()
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen p-6 lg:p-8 space-y-8 bg-background">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{todayLabel}</p>
        <h1 className="text-2xl lg:text-3xl font-black text-foreground">Daily Focus</h1>
        <p className="text-muted-foreground">
          <span className="text-status-attention font-semibold">{overdueFollowUps}</span> overdue follow-ups ·{" "}
          <span className="text-primary font-semibold">{openThreads}</span> open threads
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Active Partners"
          value={partners.length}
          change={2.4}
          changeLabel="this month"
          trend="up"
          icon={<Users className="h-5 w-5 text-primary" />}
          variant="primary"
        />
        <MetricCard
          label="Open Threads"
          value={openThreads}
          change={-12}
          changeLabel="vs last week"
          trend="down"
          icon={<GitBranch className="h-5 w-5 text-muted-foreground" />}
        />
        <MetricCard
          label="Overdue Follow-ups"
          value={overdueFollowUps}
          changeLabel="need attention"
          icon={<Clock className="h-5 w-5 text-status-attention" />}
          variant="warning"
        />
        <MetricCard
          label="Weekly Interactions"
          value={weeklyInteractions}
          change={8}
          changeLabel="vs last week"
          trend="up"
          icon={<Activity className="h-5 w-5 text-muted-foreground" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {urgentItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-status-critical" />
                <h2 className="section-label">Needs Attention</h2>
              </div>
              <div className="panel-card rounded-lg divide-y divide-border">
                {urgentItems.map(item => (
                  <FocusItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <h2 className="section-label">Today's Focus</h2>
            </div>
            <div className="panel-card rounded-lg divide-y divide-border">
              {otherItems.map(item => (
                <FocusItem key={item.id} item={item} />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="section-label">Active Threads</h2>
              <button
                type="button"
                onClick={() => (window.location.hash = "/threads")}
                className="text-sm text-primary hover:underline font-medium"
              >
                View all
              </button>
            </div>
            <div className="space-y-3">
              {recentThreads.map(thread => (
                <ThreadCard key={thread.id} thread={thread} />
              ))}
              {recentThreads.length === 0 && (
                <div className="panel-card rounded-lg p-6 text-center text-muted-foreground">
                  No owned threads yet. Create one from the Threads page.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel-card rounded-lg p-5 space-y-4">
            <h3 className="section-label">Partner Health</h3>
            <div className="flex justify-center py-4">
              <HealthRing healthy={healthyPartners} attention={attentionNeeded} critical={criticalPartners} size="lg" />
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-status-healthy" />
                  <span className="text-lg font-semibold text-foreground">{healthyPartners}</span>
                </div>
                <span className="text-xs text-muted-foreground">Healthy</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-status-attention" />
                  <span className="text-lg font-semibold text-foreground">{attentionNeeded}</span>
                </div>
                <span className="text-xs text-muted-foreground">Attention</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-status-critical" />
                  <span className="text-lg font-semibold text-foreground">{criticalPartners}</span>
                </div>
                <span className="text-xs text-muted-foreground">Critical</span>
              </div>
            </div>
          </div>

          <div className="panel-card rounded-lg p-5 space-y-4">
            <h3 className="section-label">Response Time</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. Response</span>
                <span className="text-lg font-semibold text-foreground">4.2h</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-secondary rounded-full" />
              </div>
              <p className="helper-text">Target: Under 4 hours</p>
            </div>
          </div>

          <div className="panel-card rounded-lg p-5 space-y-4">
            <h3 className="section-label">Team Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Support handling</span>
                <span className="text-foreground font-medium">12 threads</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Finance reviewing</span>
                <span className="text-foreground font-medium">3 threads</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ops in progress</span>
                <span className="text-foreground font-medium">5 threads</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
