import { useMemo, useState } from "react";
import { Eye, FolderOpen, Upload } from "lucide-react";
import { toast } from "sonner";

import { Reveal } from "@/components/motion";
import { MaterialCard } from "@/components/teacher/MaterialCard";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSearchInput } from "@/components/ui/PremiumSearchInput";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import {
  assignedClasses,
  teachingMaterials as SEED_MATERIALS,
  type MaterialType,
  type TeachingMaterial,
} from "@/data/teacherDashboardData";

const SUBJECTS = Array.from(new Set(SEED_MATERIALS.map((m) => m.subject)));

export function TeacherMaterials() {
  const [rows, setRows] = useState<TeachingMaterial[]>(SEED_MATERIALS);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterShared, setFilterShared] = useState("all");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [classId, setClassId] = useState(assignedClasses[0].id);
  const [type, setType] = useState<MaterialType>("PDF");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((m) => {
      if (q && !(m.title.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q) || m.className.toLowerCase().includes(q))) return false;
      if (filterClass !== "all" && m.classId !== filterClass) return false;
      if (filterSubject !== "all" && m.subject !== filterSubject) return false;
      if (filterType !== "all" && m.type !== filterType) return false;
      if (filterShared === "shared" && !m.sharedWithClass) return false;
      if (filterShared === "not-shared" && m.sharedWithClass) return false;
      return true;
    });
  }, [rows, search, filterClass, filterSubject, filterType, filterShared]);

  const totalViews = rows.reduce((sum, m) => sum + m.views, 0);
  const totalDownloads = rows.reduce((sum, m) => sum + m.downloads, 0);
  const sharedCount = rows.filter((m) => m.sharedWithClass).length;

  function upload() {
    const cls = assignedClasses.find((c) => c.id === classId)!;
    const material: TeachingMaterial = {
      id: `tm-${Date.now()}`,
      title: title || "Untitled material",
      classId: cls.id,
      className: cls.className,
      section: cls.section,
      subject: cls.subject,
      type,
      uploadedDate: new Date().toISOString().slice(0, 10),
      sharedWithClass: true,
      sizeLabel: "—",
      views: 0,
      downloads: 0,
    };
    setRows((r) => [material, ...r]);
    setOpen(false);
    setTitle("");
    toast.success("Material uploaded and shared with the class (demo — no file stored)");
  }

  function toggleShare(id: string) {
    setRows((r) => r.map((m) => (m.id === id ? { ...m, sharedWithClass: !m.sharedWithClass } : m)));
  }

  function deleteMaterial(id: string) {
    setRows((r) => r.filter((m) => m.id !== id));
    toast.success("Material deleted");
  }

  return (
    <div className="space-y-4">
      <Reveal className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Teaching Materials</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Upload and share resources with your assigned classes.</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
          <Upload className="h-4 w-4" /> Upload material
        </Button>
      </Reveal>

      <Reveal delay={40} className="grid grid-cols-3 gap-3 sm:grid-cols-3">
        <PremiumCard className="p-4">
          <p className="text-xl font-bold tabular-nums text-foreground">{rows.length}</p>
          <p className="text-[11.5px] text-muted-foreground">Total materials · {sharedCount} shared</p>
        </PremiumCard>
        <PremiumCard className="p-4">
          <p className="flex items-center gap-1.5 text-xl font-bold tabular-nums text-foreground"><Eye className="h-4 w-4 text-muted-foreground" /> {totalViews}</p>
          <p className="text-[11.5px] text-muted-foreground">Total views</p>
        </PremiumCard>
        <PremiumCard className="p-4">
          <p className="flex items-center gap-1.5 text-xl font-bold tabular-nums text-foreground"><Upload className="h-4 w-4 text-muted-foreground" /> {totalDownloads}</p>
          <p className="text-[11.5px] text-muted-foreground">Total downloads</p>
        </PremiumCard>
      </Reveal>

      <Reveal delay={60} className="flex flex-wrap items-center gap-2.5">
        <PremiumSearchInput value={search} onChange={setSearch} placeholder="Search materials…" className="min-w-[220px] max-w-xs" />
        <PremiumSelect value={filterClass} onChange={setFilterClass} className="w-40" options={[{ value: "all", label: "All classes" }, ...assignedClasses.map((c) => ({ value: c.id, label: `${c.className} · ${c.section}` }))]} />
        <PremiumSelect value={filterSubject} onChange={setFilterSubject} className="w-40" options={[{ value: "all", label: "All subjects" }, ...SUBJECTS.map((s) => ({ value: s, label: s }))]} />
        <PremiumSelect value={filterType} onChange={setFilterType} className="w-36" options={[{ value: "all", label: "All types" }, ...["PDF", "Doc", "Image", "Video"].map((t) => ({ value: t, label: t }))]} />
        <PremiumSelect value={filterShared} onChange={setFilterShared} className="w-40" options={[{ value: "all", label: "Any status" }, { value: "shared", label: "Shared" }, { value: "not-shared", label: "Not shared" }]} />
      </Reveal>

      {filtered.length === 0 ? (
        <PremiumCard><PremiumEmptyState icon={FolderOpen} title="No materials found" /></PremiumCard>
      ) : (
        <Reveal delay={100} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m, i) => (
            <MaterialCard key={m.id} material={m} index={i} onToggleShare={toggleShare} onDelete={deleteMaterial} />
          ))}
        </Reveal>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload teaching material</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <FormField label="Title" required>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Refraction Demo Video" />
            </FormField>
            <FormField label="Class">
              <PremiumSelect value={classId} onChange={setClassId} options={assignedClasses.map((c) => ({ value: c.id, label: `${c.className} · ${c.section} — ${c.subject}` }))} />
            </FormField>
            <FormField label="Type">
              <PremiumSelect value={type} onChange={(v) => setType(v as MaterialType)} options={["PDF", "Doc", "Image", "Video"].map((t) => ({ value: t, label: t }))} />
            </FormField>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); toast.info("File drop — demo only, files aren't actually stored"); }}
              className="rounded-xl border border-dashed border-border/60 p-6 text-center text-[12px] text-muted-foreground"
            >
              Drag &amp; drop a file here, or click to browse (demo — files aren't actually stored)
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={upload} disabled={!title}>Upload &amp; share</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
