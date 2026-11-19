import { useEffect, useMemo } from "react";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { useExamSchedule } from "@/api/exams";
import { useAcademicOptions } from "@/api/students";
import type { Exam, ExamSchedule } from "@/api/types/exams";

export interface ExamSelection { exam: string; classLevel: string; subject: string; section: string }
export const EMPTY_SELECTION: ExamSelection = { exam: "", classLevel: "", subject: "", section: "" };

/**
 * Exam → class → (subject paper | section) selector. Choices come from the
 * papers actually scheduled, and the first option is picked automatically.
 */
export function ExamPicker({ value, onChange, mode, onlyPublished }: {
  value: ExamSelection;
  onChange: (next: ExamSelection) => void;
  mode: "subject" | "section";
  onlyPublished?: boolean;
}) {
  const schedule = useExamSchedule();
  const academics = useAcademicOptions();
  const exams = useMemo(
    () => (schedule.data?.exams ?? []).filter((e) => !onlyPublished || e.isPublished),
    [schedule.data, onlyPublished]);
  const papers = useMemo(() => (schedule.data?.schedule ?? []).filter((p) => p.examRecordId === value.exam), [schedule.data, value.exam]);
  const classes = useMemo(() => {
    const seen = new Map<string, string>();
    for (const p of papers) seen.set(p.classLevelId, p.className);
    const order = new Map((academics.data?.classes ?? []).map((c) => [c.id, c.order]));
    return [...seen].sort((a, b) => (order.get(a[0]) ?? 0) - (order.get(b[0]) ?? 0));
  }, [papers, academics.data]);
  const subjects = papers.filter((p) => p.classLevelId === value.classLevel);
  const sections = (academics.data?.sections ?? []).filter((s) => s.classId === value.classLevel);

  useEffect(() => {
    if (!value.exam && exams.length) onChange({ ...EMPTY_SELECTION, exam: exams[0].id });
  }, [value.exam, exams, onChange]);
  useEffect(() => {
    if (value.exam && !value.classLevel && classes.length) onChange({ ...value, classLevel: classes[0][0], subject: "", section: "" });
  }, [value, classes, onChange]);
  useEffect(() => {
    if (mode === "subject" && value.classLevel && !value.subject && subjects.length) onChange({ ...value, subject: subjects[0].id });
  }, [mode, value, subjects, onChange]);

  const field = (label: string, node: React.ReactNode) => (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium text-foreground">{label}</label>
      {node}
    </div>
  );

  return (
    <div className="flex flex-wrap items-end gap-3">
      {field("Exam", (
        <PremiumSelect value={value.exam} className="w-60" placeholder={schedule.isLoading ? "Loading…" : "Select exam"}
          onChange={(v) => onChange({ ...EMPTY_SELECTION, exam: v })}
          options={exams.map((e) => ({ value: e.id, label: `${e.name}${e.academicYear ? ` · ${e.academicYear}` : ""}` }))} />
      ))}
      {field("Class", (
        <PremiumSelect value={value.classLevel} className="w-44" placeholder={classes.length ? "Select class" : "No papers"}
          disabled={!classes.length}
          onChange={(v) => onChange({ ...value, classLevel: v, subject: "", section: "" })}
          options={classes.map(([id, name]) => ({ value: id, label: name }))} />
      ))}
      {mode === "subject" && field("Subject", (
        <PremiumSelect value={value.subject} className="w-52" placeholder="Select subject" disabled={!subjects.length}
          onChange={(v) => onChange({ ...value, subject: v })}
          options={subjects.map((p) => ({ value: p.id, label: p.subject }))} />
      ))}
      {mode === "section" && field("Section", (
        <PremiumSelect value={value.section} className="w-40" placeholder="All sections" disabled={!sections.length}
          onChange={(v) => onChange({ ...value, section: v })}
          options={[{ value: "", label: "All sections" }, ...sections.map((s) => ({ value: s.id, label: `Section ${s.name}` }))]} />
      ))}
    </div>
  );
}

/** The exam and paper a selection points at. */
export function useSelection(value: ExamSelection): { exam: Exam | undefined; paper: ExamSchedule | undefined } {
  const schedule = useExamSchedule();
  return {
    exam: schedule.data?.exams.find((e) => e.id === value.exam),
    paper: schedule.data?.schedule.find((p) => p.id === value.subject),
  };
}
