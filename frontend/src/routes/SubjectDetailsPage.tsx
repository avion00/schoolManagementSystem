import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { SlidingTabs, type SlidingTabOption } from "@/components/motion";
import { SubjectProfileHero }       from "@/components/subjects/details/SubjectProfileHero";
import { SubjectOverviewCards }     from "@/components/subjects/details/SubjectOverviewCards";
import { SubjectClassMappingCard }  from "@/components/subjects/details/SubjectClassMappingCard";
import { SubjectTeachersCard }      from "@/components/subjects/details/SubjectTeachersCard";
import { SubjectMarksCard }         from "@/components/subjects/details/SubjectMarksCard";
import { SubjectSyllabusCard }      from "@/components/subjects/details/SubjectSyllabusCard";
import { SubjectExamSettingsCard }  from "@/components/subjects/details/SubjectExamSettingsCard";
import { SubjectPerformanceCard }   from "@/components/subjects/details/SubjectPerformanceCard";
import { SubjectDocumentsCard }     from "@/components/subjects/details/SubjectDocumentsCard";
import { SubjectActivityTimeline }  from "@/components/subjects/details/SubjectActivityTimeline";
import { Button }                   from "@/components/ui/button";
import { SUBJECTS }                 from "@/data/subjectsData";
import { SUBJECT_DETAIL_MOCK }      from "@/data/subjectDetailData";

const TABS: SlidingTabOption[] = [
  { value: "overview",  label: "Overview"  },
  { value: "classes",   label: "Classes"   },
  { value: "teachers",  label: "Teachers"  },
  { value: "syllabus",  label: "Syllabus"  },
  { value: "marks",     label: "Marks"     },
  { value: "reports",   label: "Reports"   },
  { value: "documents", label: "Documents" },
];

export function SubjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");

  const sub = SUBJECTS.find((s) => s.id === Number(id));

  if (!sub) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
        <p className="text-lg font-medium">Subject not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/subjects")}>
          Back to All Subjects
        </Button>
      </div>
    );
  }

  const mock = SUBJECT_DETAIL_MOCK;

  return (
    <div className="space-y-6 pb-12">
      <SubjectProfileHero sub={sub} />
      <SubjectOverviewCards sub={sub} mock={mock} />
      <SlidingTabs value={tab} onValueChange={setTab} options={TABS} />

      {/* Overview */}
      {tab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <SubjectClassMappingCard classMappings={mock.classMappings} />
          <SubjectSyllabusCard syllabusUnits={mock.syllabusUnits} />
        </div>
      )}

      {/* Classes */}
      {tab === "classes" && (
        <SubjectClassMappingCard classMappings={mock.classMappings} />
      )}

      {/* Teachers */}
      {tab === "teachers" && (
        <SubjectTeachersCard teachers={mock.teachers} />
      )}

      {/* Syllabus */}
      {tab === "syllabus" && (
        <SubjectSyllabusCard syllabusUnits={mock.syllabusUnits} />
      )}

      {/* Marks */}
      {tab === "marks" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <SubjectMarksCard sub={sub} />
          <SubjectExamSettingsCard sub={sub} />
        </div>
      )}

      {/* Reports */}
      {tab === "reports" && (
        <SubjectPerformanceCard perf={mock.performance} />
      )}

      {/* Documents */}
      {tab === "documents" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <SubjectDocumentsCard documents={mock.documents} />
          <SubjectActivityTimeline activities={mock.activities} />
        </div>
      )}
    </div>
  );
}
