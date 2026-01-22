import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import type {
  Partner,
  Interaction,
  Thread,
  PartnerHealth,
  ThreadOwner,
  ThreadStatus,
  ThreadVisibility,
} from "@/types/cam";
import { mockInteractions, mockThreads } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type PartnerCreateInput = {
  name: string;
  tier: Partner["tier"];
  health: PartnerHealth;
  revenue: number;
  segment: string;
  accountManager: string;
};

type InteractionCreateInput = {
  partnerId: string;
  channel: Interaction["channel"];
  interactionType: Interaction["interactionType"];
  summary: string;
  followUpRequired: boolean;
  followUpDate?: Date;
  owner: ThreadOwner;
};

type ThreadCreateInput = {
  partnerId: string;
  title: string;
  status: ThreadStatus;
  visibility: ThreadVisibility;
  priority: Thread["priority"];
  owner: ThreadOwner;
  lastActivity: string;
};

type DataContextValue = {
  partners: Partner[];
  interactions: Interaction[];
  threads: Thread[];
  loading: boolean;

  addPartner: (input: PartnerCreateInput) => Promise<Partner | null>;
  logInteraction: (input: InteractionCreateInput) => Interaction;
  addThread: (input: ThreadCreateInput) => Thread;

  updatePartnerHealth: (partnerId: string, health: PartnerHealth) => Promise<void>;
};

const DataContext = createContext<DataContextValue | undefined>(undefined);

function makeId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function inferInteractionType(channel: Interaction["channel"]): Interaction["type"] {
  if (channel === "support" || channel === "system") return "indirect";
  return "direct";
}

// Helper function to transform Supabase partner row to Partner type
function transformSupabasePartner(row: Tables<"partners">): Partner {
  return {
    id: row.id,
    name: row.name,
    tier: row.tier,
    health: row.health,
    lastActivity: row.last_activity ? new Date(row.last_activity) : new Date(),
    openThreads: row.open_threads ?? 0,
    revenue: row.revenue ?? 0,
    segment: row.segment ?? "SMB",
    accountManager: "You", // Default since we don't store account manager names yet
  };
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [interactions, setInteractions] = useState<Interaction[]>(() => mockInteractions.map((i) => ({ ...i })));
  const [threads, setThreads] = useState<Thread[]>(() => mockThreads.map((t) => ({ ...t })));

  // Fetch partners from Supabase on mount
  useEffect(() => {
    async function fetchPartners() {
      setLoading(true);
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching partners:", error);
        setPartners([]);
      } else if (data) {
        setPartners(data.map(transformSupabasePartner));
      }
      setLoading(false);
    }

    fetchPartners();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("partners-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "partners" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newPartner = transformSupabasePartner(payload.new as Tables<"partners">);
            setPartners((prev) => [newPartner, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            const updatedPartner = transformSupabasePartner(payload.new as Tables<"partners">);
            setPartners((prev) =>
              prev.map((p) => (p.id === updatedPartner.id ? updatedPartner : p))
            );
          } else if (payload.eventType === "DELETE") {
            const deletedId = (payload.old as { id: string }).id;
            setPartners((prev) => prev.filter((p) => p.id !== deletedId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addPartner = async (input: PartnerCreateInput): Promise<Partner | null> => {
    const { data, error } = await supabase
      .from("partners")
      .insert({
        name: input.name.trim(),
        tier: input.tier,
        health: input.health,
        revenue: Number.isFinite(input.revenue) ? input.revenue : 0,
        segment: input.segment.trim() || "SMB",
        open_threads: 0,
        last_activity: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding partner:", error);
      return null;
    }

    // Realtime subscription will add the partner to state
    return transformSupabasePartner(data);
  };

  const logInteraction = (input: InteractionCreateInput) => {
    const partner = partners.find((p) => p.id === input.partnerId);

    const interaction: Interaction = {
      id: makeId("interaction"),
      partnerId: input.partnerId,
      partnerName: partner?.name ?? "Unknown Partner",
      type: inferInteractionType(input.channel),
      channel: input.channel,
      interactionType: input.interactionType,
      summary: input.summary.trim(),
      date: new Date(),
      resolved: false,
      followUpRequired: input.followUpRequired,
      followUpDate: input.followUpDate,
      owner: input.owner,
    };

    setInteractions((prev) => [interaction, ...prev]);

    setPartners((prev) =>
      prev.map((p) => (p.id === input.partnerId ? { ...p, lastActivity: new Date() } : p))
    );

    return interaction;
  };

  const addThread = (input: ThreadCreateInput) => {
    const partner = partners.find((p) => p.id === input.partnerId);
    const now = new Date();

    const thread: Thread = {
      id: makeId("thread"),
      partnerId: input.partnerId,
      partnerName: partner?.name ?? "Unknown Partner",
      title: input.title.trim(),
      status: input.status,
      owner: input.owner,
      visibility: input.visibility,
      priority: input.priority,
      createdAt: now,
      updatedAt: now,
      interactionCount: 0,
      lastActivity: input.lastActivity.trim() || "Thread created",
    };

    setThreads((prev) => [thread, ...prev]);

    setPartners((prev) =>
      prev.map((p) => {
        if (p.id !== input.partnerId) return p;
        const increment = input.status === "resolved" ? 0 : 1;
        return { ...p, lastActivity: new Date(), openThreads: p.openThreads + increment };
      })
    );

    return thread;
  };

  const updatePartnerHealth = async (partnerId: string, health: PartnerHealth) => {
    const { error } = await supabase
      .from("partners")
      .update({ health })
      .eq("id", partnerId);

    if (error) {
      console.error("Error updating partner health:", error);
      return;
    }

    // Optimistically update local state (realtime will confirm)
    setPartners((prev) => prev.map((p) => (p.id === partnerId ? { ...p, health } : p)));
  };

  const value = useMemo<DataContextValue>(
    () => ({
      partners,
      interactions,
      threads,
      loading,
      addPartner,
      logInteraction,
      addThread,
      updatePartnerHealth,
    }),
    [partners, interactions, threads, loading]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}
