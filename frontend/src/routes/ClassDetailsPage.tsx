import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ClassProfileHero }        from "@/components/classes/details/ClassProfileHero";
import { ClassOverviewCards }      from "@/components/classes/details/ClassOverviewCards";
import { ClassSectionsCard }       from "@/components/classes/details/ClassSectionsCard";
import { ClassStudentsCard }       from "@/components/classes/details/ClassStudentsCard";
import { ClassTeachersCard }       from "@/components/classes/details/ClassTeachersCard";
import { ClassSubjectsCard }       from "@/components/classes/details/ClassSubjectsCard";
import { ClassTimetableCard }      from "@/components/classes/details/ClassTimetableCard";
import { ClassAttendanceCard }     from "@/components/classes/details/ClassAttendanceCard";
import { ClassPerformanceCard }    from "@/components/classes/details/ClassPerformanceCard";
import { ClassFeesCard }           from "@/components/classes/details/ClassFeesCard";
import { ClassExamsCard }          from "@/components/classes/details/ClassExamsCard";
import { ClassDocumentsCard }      from "@/components/classes/details/ClassDocumentsCard";
import { ClassActivityTimeline }   from "@/components/classes/details/ClassActivityTimeline";
import { Button }                  from "@/components/ui/button";
import { PremiumTabs, type PremiumTabOption } from "@/components/ui/PremiumTabs";
import { useClassDetail } from "@/api/classes";
import { errorMessage } from "@/api/http";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import { useAuth } from "@/lib/auth";

const TABS: PremiumTabOption[] = [
  { value: "overview",   label: "Overview"   },
  { value: "students",   label: "Students"   },
  { value: "teachers",   label: "Teachers"   },
  { value: "timetable",  label: "Timetable"  },
  { value: "reports",    label: "Reports"    },
  { value: "finance",    label: "Finance"    },
  { value: "documents",  label: "Documents"  },
];

export function ClassDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");

  const { hasPermission } = useAuth();
  const detail = useClassDetail(id, hasPermission("fee.view"));
  if (detail.isLoading) return <PremiumSkeleton className="h-96 w-full rounded-2xl" />;
  const notFound = (detail.error as { response?: { status?: number } } | null)?.response?.status === 404;
  if (detail.isError && !notFound) {
    return <PremiumEmptyState title="Couldn't load this class" description={errorMessage(detail.error)}
      action={<Button size="sm" variant="outline" onClick={() => detail.refetch()}>Try again</Button>} />;
  }
  const mock = detail.data;
  const cls = mock?.cls;

  if (!cls || !mock) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
        <p className="text-lg font-medium">Class not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/classes")}>
          Back to All Classes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <ClassProfileHero cls={cls} />
      <ClassOverviewCards cls={cls} mock={mock} />
      <PremiumTabs value={tab} onValueChange={setTab} options={TABS} />

      {/* Overview */}
      {tab === "overview" && (
        <div className="space-y-6">
          <ClassSectionsCard sections={cls.sections} />
        </div>
      )}

      {/* Students */}
      {tab === "students" && (
        <ClassStudentsCard students={mock.students} />
      )}

      {/* Teachers */}
      {tab === "teachers" && (
        <div className="space-y-6">
          <ClassTeachersCard teachers={mock.teachers} />
          <ClassSubjectsCard subjects={cls.subjects} />
        </div>
      )}

      {/* Timetable */}
      {tab === "timetable" && (
        <ClassTimetableCard timetable={mock.timetable} />
      )}

      {/* Reports */}
      {tab === "reports" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <ClassAttendanceCard attendance={mock.attendance} />
          {mock.performance ? <ClassPerformanceCard perf={mock.performance} /> : (
            <PremiumCard className="p-5">
              <PremiumEmptyState title="No exam results yet" description="Performance appears once a class exam has marks." className="py-6" />
            </PremiumCard>
          )}
        </div>
      )}

      {/* Finance */}
      {tab === "finance" && (
        <div className="space-y-6">
          {mock.fees ? <ClassFeesCard fees={mock.fees} /> : (
            <PremiumCard className="p-5">
              <PremiumEmptyState title="Fee details are restricted" description="You need fee access to see class fees." className="py-6" />
            </PremiumCard>
          )}
          <ClassExamsCard exams={mock.exams} />
        </div>
      )}

      {/* Documents */}
      {tab === "documents" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <ClassDocumentsCard documents={mock.documents} />
          <ClassActivityTimeline activities={mock.activities} />
        </div>
      )}
    </div>
  );
}
