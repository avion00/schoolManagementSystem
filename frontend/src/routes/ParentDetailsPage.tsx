import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { SlidingTabs } from "@/components/motion";
import type { SlidingTabOption } from "@/components/motion";
import { ParentProfileHero } from "@/components/parents/details/ParentProfileHero";
import { ParentSummaryCards } from "@/components/parents/details/ParentSummaryCards";
import { ParentInfoCard } from "@/components/parents/details/ParentInfoCard";
import { ParentChildrenCard } from "@/components/parents/details/ParentChildrenCard";
import { ParentChildrenAcademicCard } from "@/components/parents/details/ParentChildrenAcademicCard";
import { ParentFeesCard } from "@/components/parents/details/ParentFeesCard";
import { ParentNoticeBoard } from "@/components/parents/details/ParentNoticeBoard";
import { ParentDocumentsCard } from "@/components/parents/details/ParentDocumentsCard";
import { ParentActivityTimeline } from "@/components/parents/details/ParentActivityTimeline";
import { PARENTS } from "@/data/parentsData";
import { PARENT_DETAIL_MOCK } from "@/data/parentDetailsData";

const TABS: SlidingTabOption[] = [
  { value: "overview",  label: "Overview"  },
  { value: "academics", label: "Academics" },
  { value: "fees",      label: "Fees"      },
  { value: "notices",   label: "Notices"   },
  { value: "activity",  label: "Activity"  },
];

export function ParentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");

  const parent = PARENTS.find((p) => p.id === Number(id));

  if (!parent) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
        <p className="text-lg font-medium">Parent not found.</p>
        <button className="mt-4 text-sm underline" onClick={() => navigate("/parents")}>
          Back to All Parents
        </button>
      </div>
    );
  }

  const mock = PARENT_DETAIL_MOCK;

  return (
    <div className="space-y-6 pb-12">
      {/* Hero */}
      <ParentProfileHero parent={parent} />

      {/* Summary cards */}
      <ParentSummaryCards cards={mock.summaryCards} />

      {/* Tab navigation */}
      <SlidingTabs value={tab} onValueChange={setTab} options={TABS} />

      {/* Overview tab */}
      {tab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <ParentInfoCard parent={parent} mock={mock} />
            <ParentDocumentsCard documents={mock.documents} />
          </div>
          <div className="space-y-6">
            <ParentChildrenCard
              children={parent.linkedChildren}
              academicData={mock.childrenAcademic}
            />
          </div>
        </div>
      )}

      {/* Academics tab */}
      {tab === "academics" && (
        <ParentChildrenAcademicCard academicData={mock.childrenAcademic} />
      )}

      {/* Fees tab */}
      {tab === "fees" && (
        <ParentFeesCard records={mock.feeRecords} summary={mock.feesSummary} />
      )}

      {/* Notices tab */}
      {tab === "notices" && (
        <ParentNoticeBoard notices={mock.notices} />
      )}

      {/* Activity tab */}
      {tab === "activity" && (
        <ParentActivityTimeline activities={mock.activities} />
      )}
    </div>
  );
}
