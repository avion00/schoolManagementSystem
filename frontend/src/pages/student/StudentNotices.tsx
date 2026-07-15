import { Pin } from "lucide-react";
import { useMemo, useState } from "react";

import { Reveal, SlidingTabs } from "@/components/motion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PremiumBadge, type PremiumBadgeTone } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumSearchInput } from "@/components/ui/PremiumSearchInput";
import { markNoticeRead, notices as initialNotices, toggleNoticePinned, type NoticeCategory, type StudentNotice } from "@/data/studentDashboardData";

const CATEGORY_TONE: Record<NoticeCategory, PremiumBadgeTone> = {
  School: "neutral", Class: "info", Exam: "purple", Fee: "warning", Event: "success", Urgent: "danger",
};
const TABS = [{ value: "All", label: "All" }, { value: "Unread", label: "Unread" }, ...(["School", "Class", "Exam", "Fee", "Event", "Urgent"] as NoticeCategory[]).map((c) => ({ value: c, label: c }))];

export function StudentNotices() {
  const [notices, setNotices] = useState(initialNotices);
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<StudentNotice | null>(null);

  function refresh() { setNotices([...initialNotices]); }

  const rows = useMemo(() => {
    let list = notices;
    if (tab === "Unread") list = list.filter((n) => n.unread);
    else if (tab !== "All") list = list.filter((n) => n.category === tab);
    if (search.trim()) list = list.filter((n) => n.title.toLowerCase().includes(search.trim().toLowerCase()));
    return [...list].sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [notices, tab, search]);

  function open(n: StudentNotice) {
    setActive(n);
    if (n.unread) { markNoticeRead(n.id); refresh(); }
  }

  return (
    <div className="space-y-4">
      <Reveal>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Notices</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{notices.filter((n) => n.unread).length} unread</p>
      </Reveal>

      <Reveal delay={40} className="flex flex-wrap items-center gap-2">
        <div className="-mx-1 overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <SlidingTabs value={tab} onValueChange={setTab} options={TABS} className="w-max" />
        </div>
        <PremiumSearchInput value={search} onChange={setSearch} placeholder="Search notices…" className="ml-auto max-w-xs" />
      </Reveal>

      <Reveal delay={80} className="space-y-2">
        {rows.map((n) => (
          <PremiumCard key={n.id} hoverable className="flex cursor-pointer items-start gap-3 p-3.5" onClick={() => open(n)}>
            {n.pinned && <Pin className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className={`truncate text-[13px] ${n.unread ? "font-semibold text-foreground" : "font-medium text-foreground/90"}`}>{n.title}</p>
                <PremiumBadge label={n.category} tone={CATEGORY_TONE[n.category]} />
              </div>
              <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">{n.date}</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); toggleNoticePinned(n.id); refresh(); }}
              className="shrink-0 text-[11px] font-medium text-muted-foreground hover:text-foreground"
            >
              {n.pinned ? "Unpin" : "Pin"}
            </button>
            {n.unread && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
          </PremiumCard>
        ))}
        {rows.length === 0 && <p className="py-8 text-center text-[12.5px] text-muted-foreground">No notices found.</p>}
      </Reveal>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent>
          {active && (
            <>
              <DialogHeader>
                <DialogTitle>{active.title}</DialogTitle>
                <DialogDescription>{active.category} · {active.date}</DialogDescription>
              </DialogHeader>
              <p className="text-[13px] text-foreground">{active.body}</p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
