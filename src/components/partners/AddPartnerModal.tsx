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
import type { Partner, PartnerHealth } from "@/types/cam";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddPartnerModal({ open, onOpenChange }: Props) {
  const { toast } = useToast();
  const { addPartner } = useData();

  const [name, setName] = useState("");
  const [tier, setTier] = useState<Partner["tier"]>("gold");
  const [health, setHealth] = useState<PartnerHealth>("neutral");
  const [revenue, setRevenue] = useState<string>("0");
  const [segment, setSegment] = useState("SMB");
  const [accountManager, setAccountManager] = useState("You");
  const [saving, setSaving] = useState(false);

  const isValid = useMemo(() => name.trim().length > 1, [name]);

  const reset = () => {
    setName("");
    setTier("gold");
    setHealth("neutral");
    setRevenue("0");
    setSegment("SMB");
    setAccountManager("You");
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
        description: "Partner name is required.",
      });
      return;
    }

    setSaving(true);

    const revenueNum = Number(revenue);
    const partner = addPartner({
      name,
      tier,
      health,
      revenue: Number.isFinite(revenueNum) ? revenueNum : 0,
      segment,
      accountManager,
    });

    toast({
      title: "Partner added",
      description: `${partner.name} is now in your portfolio.`,
    });

    setSaving(false);
    close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] bg-card border-border">
        <DialogHeader>
          <DialogTitle>Add Partner</DialogTitle>
          <DialogDescription>Create a new partner in your portfolio.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Partner Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. MerchantHaus" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tier</Label>
              <Select value={tier} onValueChange={(v) => setTier(v as Partner["tier"])}>
                <SelectTrigger className="bg-muted/50 border-border">
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="platinum">Platinum</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="bronze">Bronze</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Health</Label>
              <Select value={health} onValueChange={(v) => setHealth(v as PartnerHealth)}>
                <SelectTrigger className="bg-muted/50 border-border">
                  <SelectValue placeholder="Select health" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="healthy">Healthy</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="attention">Attention</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Annual Revenue</Label>
              <Input value={revenue} onChange={(e) => setRevenue(e.target.value)} placeholder="245000" inputMode="numeric" />
            </div>

            <div className="space-y-2">
              <Label>Segment</Label>
              <Input value={segment} onChange={(e) => setSegment(e.target.value)} placeholder="SMB / Mid-Market / Enterprise" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Account Manager</Label>
            <Input value={accountManager} onChange={(e) => setAccountManager(e.target.value)} placeholder="You" />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!isValid || saving}>
            {saving ? "Saving..." : "Add Partner"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
