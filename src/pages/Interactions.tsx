import { useMemo, useState } from "react";
import { InteractionRow } from "@/components/interactions/InteractionRow";
import type { Interaction } from "@/types/cam";
import { Search, Filter, Plus, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useData } from "@/contexts/DataContext";
import { useInteractionModal } from "@/contexts/InteractionModalContext";

type TypeFilter = "all" | "direct" | "indirect";

export function Interactions() {
  const { interactions } = useData();
  const { openModal } = useInteractionModal();

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const filteredInteractions = useMemo(() => {
    return interactions
      .filter((interaction) => {
        const matchesSearch =
          interaction.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          interaction.summary.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === "all" || interaction.type === typeFilter;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [interactions, searchQuery, typeFilter]);

  const directCount = interactions.filter((i) => i.type === "direct").length;
  const indirectCount = interactions.filter((i) => i.type === "indirect").length;

  const groupedByDate = useMemo(() => {
    return filteredInteractions.reduce((groups, interaction) => {
      const dateKey = interaction.date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(interaction);
      return groups;
    }, {} as Record<string, Interaction[]>);
  }, [filteredInteractions]);

  return (
    <div className="min-h-screen p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Interactions</h1>
          <p className="text-muted-foreground">Track direct and indirect partner activity</p>
        </div>
        <button
          type="button"
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Log Interaction
        </button>
      </div>

      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search interactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex rounded-lg border border-border overflow-hidden">
              {(["all", "direct", "indirect"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTypeFilter(type)}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium transition-colors",
                    typeFilter === type
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                  {type === "direct" && <span className="ml-1 text-xs opacity-70">({directCount})</span>}
                  {type === "indirect" && <span className="ml-1 text-xs opacity-70">({indirectCount})</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedByDate).map(([date, items]) => (
          <div key={date} className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-muted-foreground">{date}</h2>
            </div>
            <div className="glass-card rounded-xl divide-y divide-border/50">
              {items.map((interaction) => (
                <InteractionRow key={interaction.id} interaction={interaction} />
              ))}
            </div>
          </div>
        ))}

        {Object.keys(groupedByDate).length === 0 && (
          <div className="glass-card rounded-xl p-12 text-center">
            <p className="text-muted-foreground">No interactions found</p>
          </div>
        )}
      </div>
    </div>
  );
}
