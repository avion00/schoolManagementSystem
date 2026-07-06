import { useState, useMemo, useCallback } from "react";
import { useNavigate }                    from "react-router-dom";
import { SlidingTabs, type SlidingTabOption } from "@/components/motion";
import { ClassRoutineSummaryCards }   from "@/components/classRoutine/ClassRoutineSummaryCards";
import { ClassRoutineToolbar, type RoutineFilters } from "@/components/classRoutine/ClassRoutineToolbar";
import { ClassRoutineTable }          from "@/components/classRoutine/ClassRoutineTable";
import { ClassRoutineGrid }           from "@/components/classRoutine/ClassRoutineGrid";
import { ROUTINES, ROUTINE_STATS }    from "@/data/classRoutineData";

const VIEWS: SlidingTabOption[] = [
  { value: "table", label: "Table View"   },
  { value: "grid",  label: "Weekly Grid"  },
];

const EMPTY_FILTERS: RoutineFilters = {
  search: "", className: "", section: "", day: "",
  teacher: "", subject: "", shift: "", status: "", year: "",
};

export function ClassRoutinePage() {
  const navigate = useNavigate();
  const [view,    setView]    = useState<"table" | "grid">("table");
  const [filters, setFilters] = useState<RoutineFilters>(EMPTY_FILTERS);

  const handleChange = useCallback((key: keyof RoutineFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleClear = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase();
    return ROUTINES.filter((r) => {
      if (q && ![r.className, r.section, r.subject, r.teacher, r.room, r.routineId, r.day]
          .some((v) => v.toLowerCase().includes(q))) return false;
      if (filters.className && r.className !== filters.className) return false;
      if (filters.section   && r.section   !== filters.section)   return false;
      if (filters.day       && r.day       !== filters.day)       return false;
      if (filters.teacher   && r.teacher   !== filters.teacher)   return false;
      if (filters.subject   && r.subject   !== filters.subject)   return false;
      if (filters.shift     && r.shift     !== filters.shift)     return false;
      if (filters.status    && r.status    !== filters.status)    return false;
      if (filters.year      && r.academicYear !== filters.year)   return false;
      return true;
    });
  }, [filters]);

  return (
    <div className="space-y-5 pb-12">
      <ClassRoutineSummaryCards stats={ROUTINE_STATS} />

      <SlidingTabs
        value={view}
        onValueChange={(v) => setView(v as "table" | "grid")}
        options={VIEWS}
      />

      <ClassRoutineToolbar
        filters={filters}
        onChange={handleChange}
        onClear={handleClear}
        onAdd={() => navigate("/class-routine/new")}
        onPrint={() => navigate("/class-routine/print")}
        resultCount={filtered.length}
      />

      {view === "table" ? (
        <ClassRoutineTable
          routines={filtered}
          onView={(id) => navigate(`/class-routine/${id}`)}
          onEdit={(id) => navigate(`/class-routine/${id}/edit`)}
        />
      ) : (
        <ClassRoutineGrid />
      )}
    </div>
  );
}
