import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { VendorsTable } from "@/components/billing/VendorsTable";
import { Button } from "@/components/ui/button";
import { VENDORS, VENDOR_CATEGORY_OPTIONS } from "@/data/billingData";

const selectClass = "h-8 rounded-lg border border-input bg-background px-2.5 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring";

export function BillingVendorsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return VENDORS.filter((v) => {
      if (category !== "all" && v.category !== category) return false;
      if (q && !`${v.vendorId} ${v.vendorName}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, category]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-3.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by vendor ID or name..."
              className="h-8 w-full rounded-lg border border-input bg-background pl-8 pr-3 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
            <option value="all">All Categories</option>
            {VENDOR_CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <Button size="sm" className="ml-auto h-8 gap-1.5 text-[12px]" onClick={() => toast.info("Add vendor form — coming soon.")}>
            <Plus className="h-3.5 w-3.5" /> Add Vendor
          </Button>
        </div>
      </div>

      <VendorsTable vendors={filtered} />
    </div>
  );
}
