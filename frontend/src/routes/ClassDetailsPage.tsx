import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { SlidingTabs, type SlidingTabOption } from "@/components/motion";
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
import { CLASSES }                 from "@/data/classesData";
import { CLASS_DETAIL_MOCK }       from "@/data/classDetailData";

const TABS: SlidingTabOption[] = [
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

  const cls = CLASSES.find((c) => c.id === Number(id));

  if (!cls) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
        <p className="text-lg font-medium">Class not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/classes")}>
          Back to All Classes
        </Button>
      </div>
    );
  }

  const mock = CLASS_DETAIL_MOCK;

  return (
    <div className="space-y-6 pb-12">
      <ClassProfileHero cls={cls} />
      <ClassOverviewCards cls={cls} mock={mock} />
      <SlidingTabs value={tab} onValueChange={setTab} options={TABS} />

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
          <ClassPerformanceCard perf={mock.performance} />
        </div>
      )}

      {/* Finance */}
      {tab === "finance" && (
        <div className="space-y-6">
          <ClassFeesCard fees={mock.fees} />
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
