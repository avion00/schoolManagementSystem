import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
import { PremiumTabs, type PremiumTabOption } from "@/components/ui/PremiumTabs";
import { errorMessage } from "@/api/http";
import { useSubjectDetail } from "@/api/subjects";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";

const TABS: PremiumTabOption[] = [
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

  const detail = useSubjectDetail(id);
  if (detail.isLoading) return <PremiumSkeleton className="h-96 w-full rounded-2xl" />;
  const notFound = (detail.error as { response?: { status?: number } } | null)?.response?.status === 404;
  if (detail.isError && !notFound) {
    return <PremiumEmptyState title="Couldn't load this subject" description={errorMessage(detail.error)} />;
  }
  const mock = detail.data;
  const sub = mock?.subject;

  if (!sub || !mock) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
        <p className="text-lg font-medium">Subject not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/subjects")}>
          Back to All Subjects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <SubjectProfileHero sub={sub} />
      <SubjectOverviewCards sub={sub} mock={mock} />
      <PremiumTabs value={tab} onValueChange={setTab} options={TABS} />

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
        mock.performance ? <SubjectPerformanceCard perf={mock.performance} /> : (
          <PremiumCard className="p-5">
            <PremiumEmptyState title="No published results yet" description="Performance appears once exams with this subject are published." className="py-6" />
          </PremiumCard>
        )
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
