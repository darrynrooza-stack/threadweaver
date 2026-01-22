import { useMemo, useState } from "react";
import { PartnerRow } from "@/components/partners/PartnerRow";
import { PartnerHealth } from "@/types/cam";
import { Search, Filter, SortAsc, Grid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { useData } from "@/contexts/DataContext";
import { AddPartnerModal } from "@/components/partners/AddPartnerModal";

type SortField = "name" | "health" | "revenue" | "lastActivity";

interface PartnersProps {
  onSelectPartner?: (partnerId: string) => void;
}

export function Partners({ onSelectPartner }: PartnersProps) {
  const { partners } = useData();

  const [searchQuery, setSearchQuery] = useState("");
  const [healthFilter, setHealthFilter] = useState<PartnerHealth | "all">("all");
  const [sortField, setSortField] = useState<SortField>("lastActivity");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [addOpen, setAddOpen] = useState(false);

  const filteredPartners = useMemo(() => {
    return partners
      .filter((partner) => {
        const matchesSearch = partner.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesHealth = healthFilter === "all" || partner.health === healthFilter;
        return matchesSearch && matchesHealth;
      })
      .sort((a, b) => {
        switch (sortField) {
          case "name":
            return a.name.localeCompare(b.name);
          case "health": {
            const healthOrder = { critical: 0, attention: 1, neutral: 2, healthy: 3 } as const;
            return healthOrder[a.health] - healthOrder[b.health];
          }
          case "revenue":
            return b.revenue - a.revenue;
          case "lastActivity":
          default:
            return b.lastActivity.getTime() - a.lastActivity.getTime();
        }
      });
  }, [partners, searchQuery, healthFilter, sortField]);

  const healthCounts = useMemo(() => {
    return partners.reduce(
      (acc, p) => ({ ...acc, [p.health]: (acc[p.health] || 0) + 1 }),
      {} as Record<PartnerHealth, number>
    );
  }, [partners]);

  return (
    <div className="min-h-screen p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Partners</h1>
          <p className="text-muted-foreground">{partners.length} active partners in your portfolio</p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Add Partner
        </button>
      </div>

      <div className="panel-card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search partners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex rounded-lg border border-border overflow-hidden">
              {(["all", "healthy", "attention", "critical"] as const).map((health) => (
                <button
                  key={health}
                  type="button"
                  onClick={() => setHealthFilter(health)}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium transition-colors",
                    healthFilter === health
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {health === "all" ? "All" : health.charAt(0).toUpperCase() + health.slice(1)}
                  {health !== "all" && healthCounts[health] ? (
                    <span className="ml-1 text-xs opacity-70">({healthCounts[health]})</span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SortAsc className="h-4 w-4 text-muted-foreground" />
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="bg-muted/50 border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="lastActivity">Last Activity</option>
              <option value="name">Name</option>
              <option value="health">Health</option>
              <option value="revenue">Revenue</option>
            </select>
          </div>

          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 transition-colors",
                viewMode === "list"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground"
              )}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 transition-colors",
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground"
              )}
              title="Grid view"
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="panel-card divide-y divide-border/50">
          {filteredPartners.length > 0 ? (
            filteredPartners.map((partner) => (
              <PartnerRow
                key={partner.id}
                partner={partner}
                onClick={() => onSelectPartner?.(partner.id)}
              />
            ))
          ) : (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">No partners match your criteria</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPartners.map((partner) => (
            <div
              key={partner.id}
              className="panel-card p-4 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => onSelectPartner?.(partner.id)}
              role="button"
              tabIndex={0}
            >
              <div className="text-lg font-semibold text-foreground">{partner.name}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {partner.segment} • {partner.tier} • {partner.health}
              </div>
              <div className="text-sm text-muted-foreground mt-3">
                Open threads: <span className="text-foreground font-medium">{partner.openThreads}</span>
              </div>
            </div>
          ))}
          {filteredPartners.length === 0 && (
            <div className="panel-card p-12 text-center sm:col-span-2 lg:col-span-3">
              <p className="text-muted-foreground">No partners match your criteria</p>
            </div>
          )}
        </div>
      )}

      <AddPartnerModal open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
