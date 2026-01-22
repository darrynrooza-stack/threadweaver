import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import type { ThreadOwner, ThreadStatus, ThreadVisibility } from "@/types/cam";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddThreadModal({ open, onOpenChange }: Props) {
  const { toast } = useToast();
  const { partners, addThread } = useData();

  const [partnerId, setPartnerId] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<ThreadStatus>("open");
  const [visibility, setVisibility] = useState<ThreadVisibility>("owned");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [owner, setOwner] = useState<ThreadOwner>("cam");
  const [lastActivity, setLastActivity] = useState("Thread created");
  const [saving, setSaving] = useState(false);

  const isValid = useMemo(() => partnerId && title.trim().length > 3, [partnerId, title]);

  const reset = () => {
    setPartnerId("");
    setTitle("");
    setStatus("open");
    setVisibility("owned");
    setPriority("medium");
    setOwner("cam");
    setLastActivity("Thread created");
  };

  const close = () => {
    reset();
    onOpenChange(false);
  };

  const save = async () => {
    if (!isValid) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Partner and thread title are required.",
      });
      return;
    }

    setSaving(true);

    const thread = addThread({
      partnerId,
      title,
      status,
      visibility,
      priority,
      owner,
      lastActivity,
    });

    toast({
      title: "Thread created",
      description: `Created "${thread.title}" for ${thread.partnerName}.`,
    });

    setSaving(false);
    close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>New Thread</DialogTitle>
          <DialogDescription>Create a trackable handoff / issue thread.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Partner *</Label>
            <Select value={partnerId} onValueChange={setPartnerId}>
              <SelectTrigger className="bg-muted/50 border-border">
                <SelectValue placeholder="Select a partner..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {partners.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. API performance degradation" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ThreadStatus)}>
                <SelectTrigger className="bg-muted/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="awaiting_response">Awaiting Response</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select value={visibility} onValueChange={(v) => setVisibility(v as ThreadVisibility)}>
                <SelectTrigger className="bg-muted/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="owned">You Own</SelectItem>
                  <SelectItem value="action_required">Action Required</SelectItem>
                  <SelectItem value="fyi">FYI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                <SelectTrigger className="bg-muted/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Owner</Label>
              <Select value={owner} onValueChange={(v) => setOwner(v as ThreadOwner)}>
                <SelectTrigger className="bg-muted/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="cam">CAM</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="risk">Risk</SelectItem>
                  <SelectItem value="ops">Ops</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Last Activity</Label>
            <Input value={lastActivity} onChange={(e) => setLastActivity(e.target.value)} placeholder="e.g. Waiting on engineering hotfix" />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!isValid || saving}>
            {saving ? "Saving..." : "Create Thread"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
