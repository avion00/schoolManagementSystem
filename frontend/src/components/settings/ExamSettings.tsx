import { Award, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SettingsSection } from "./SettingsSection";

/** Grading lives with the exams module; this page points there. */
export function ExamSettings() {
  const navigate = useNavigate();
  return (
    <div className="space-y-5">
      <SettingsSection icon={Award} title="Grade Scales" subtitle="Grades and GPA come from the grade scale chosen on each exam">
        <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={() => navigate("/exams/grades")}>Manage grade scales</Button>
      </SettingsSection>
      <SettingsSection icon={BookOpen} title="Pass Marks and Components">
        <p className="text-[12.5px] text-muted-foreground">
          Full and pass marks, and the theory / practical / internal split, are set per subject and can be adjusted for each
          exam paper. Results are locked before publishing; publishing notifies students and guardians.
        </p>
        <Button size="sm" variant="outline" className="mt-3 h-8 text-[12px]" onClick={() => navigate("/subjects")}>Open subjects</Button>
      </SettingsSection>
    </div>
  );
}
