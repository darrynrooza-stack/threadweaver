import React, { createContext, useContext, useMemo, useState } from "react";
import type {
  Partner,
  Interaction,
  Thread,
  PartnerHealth,
  ThreadOwner,
  ThreadStatus,
  ThreadVisibility,
} from "@/types/cam";
import { mockPartners, mockInteractions, mockThreads } from "@/data/mockData";

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

  addPartner: (input: PartnerCreateInput) => Partner;
  logInteraction: (input: InteractionCreateInput) => Interaction;
  addThread: (input: ThreadCreateInput) => Thread;

  updatePartnerHealth: (partnerId: string, health: PartnerHealth) => void;
};

const DataContext = createContext<DataContextValue | undefined>(undefined);

function makeId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function inferInteractionType(channel: Interaction["channel"]): Interaction["type"] {
  if (channel === "support" || channel === "system") return "indirect";
  return "direct";
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [partners, setPartners] = useState<Partner[]>(() => mockPartners.map((p) => ({ ...p })));
  const [interactions, setInteractions] = useState<Interaction[]>(() => mockInteractions.map((i) => ({ ...i })));
  const [threads, setThreads] = useState<Thread[]>(() => mockThreads.map((t) => ({ ...t })));

  const addPartner = (input: PartnerCreateInput) => {
    const partner: Partner = {
      id: makeId("partner"),
      name: input.name.trim(),
      tier: input.tier,
      health: input.health,
      lastActivity: new Date(),
      openThreads: 0,
      revenue: Number.isFinite(input.revenue) ? input.revenue : 0,
      segment: input.segment.trim() || "SMB",
      accountManager: input.accountManager.trim() || "You",
    };

    setPartners((prev) => [partner, ...prev]);
    return partner;
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

  const updatePartnerHealth = (partnerId: string, health: PartnerHealth) => {
    setPartners((prev) => prev.map((p) => (p.id === partnerId ? { ...p, health } : p)));
  };

  const value = useMemo<DataContextValue>(
    () => ({
      partners,
      interactions,
      threads,
      addPartner,
      logInteraction,
      addThread,
      updatePartnerHealth,
    }),
    [partners, interactions, threads]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}
