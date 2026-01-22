import { useMemo, useState } from "react";
import { ThreadCard } from "@/components/dashboard/ThreadCard";
import { ThreadStatus, ThreadVisibility } from "@/types/cam";
import { Search, Filter, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useData } from "@/contexts/DataContext";
import { AddThreadModal } from "@/components/threads/AddThreadModal";

type VisibilityFilter = "all" | ThreadVisibility;
type StatusFilter = "all" | ThreadStatus;

export function Threads() {
  const { threads } = useData();

  const [searchQuery, setSearchQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [addOpen, setAddOpen] = useState(false);

  const filteredThreads = useMemo(() => {
    return threads
      .filter((thread) => {
        const matchesSearch =
          thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          thread.partnerName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesVisibility = visibilityFilter === "all" || thread.visibility === visibilityFilter;
        const matchesStatus = statusFilter === "all" || thread.status === statusFilter;
        return matchesSearch && matchesVisibility && matchesStatus;
      })
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }, [threads, searchQuery, visibilityFilter, statusFilter]);

  const ownedCount = threads.filter((t) => t.visibility === "owned").length;
  const fyiCount = threads.filter((t) => t.visibility === "fyi").length;
  const actionCount = threads.filter((t) => t.visibility === "action_required").length;

  const groupedByVisibility = useMemo(() => {
    return {
      owned: filteredThreads.filter((t) => t.visibility === "owned"),
      action_required: filteredThreads.filter((t) => t.visibility === "action_required"),
      fyi: filteredThreads.filter((t) => t.visibility === "fyi"),
    };
  }, [filteredThreads]);

  return (
    <div className="min-h-screen p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Threads</h1>
          <p className="text-muted-foreground">Track issues and handoffs across teams</p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Thread
        </button>
      </div>

      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search threads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex rounded-lg border border-border overflow-hidden">
              {([
                { key: "all", label: "All" },
                { key: "owned", label: "You Own", count: ownedCount },
                { key: "action_required", label: "Action Needed", count: actionCount },
                { key: "fyi", label: "FYI", count: fyiCount },
              ] as const).map(({ key, label, count }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setVisibilityFilter(key)}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
                    visibilityFilter === key
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {label}
                  {key !== "all" && <span className="ml-1 text-xs opacity-70">({count})</span>}
                </button>
              ))}
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="bg-muted/50 border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="awaiting_response">Awaiting Response</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {visibilityFilter === "all" ? (
        <div className="space-y-8">
          {groupedByVisibility.owned.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                You Own ({groupedByVisibility.owned.length})
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {groupedByVisibility.owned.map((thread) => (
                  <ThreadCard key={thread.id} thread={thread} />
                ))}
              </div>
            </div>
          )}

          {groupedByVisibility.action_required.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-status-attention uppercase tracking-wide">
                Action Required ({groupedByVisibility.action_required.length})
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {groupedByVisibility.action_required.map((thread) => (
                  <ThreadCard key={thread.id} thread={thread} />
                ))}
              </div>
            </div>
          )}

          {groupedByVisibility.fyi.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                FYI - Stay Informed ({groupedByVisibility.fyi.length})
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {groupedByVisibility.fyi.map((thread) => (
                  <ThreadCard key={thread.id} thread={thread} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filteredThreads.map((thread) => (
            <ThreadCard key={thread.id} thread={thread} />
          ))}
        </div>
      )}

      {filteredThreads.length === 0 && (
        <div className="glass-card rounded-xl p-12 text-center">
          <p className="text-muted-foreground">No threads match your criteria</p>
        </div>
      )}

      <AddThreadModal open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
