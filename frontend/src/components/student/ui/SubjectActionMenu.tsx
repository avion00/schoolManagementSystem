import {
  BookOpen, ClipboardList, FolderOpen, HelpCircle, MessageSquare, MoreHorizontal, UserRound,
} from "lucide-react";

import { PremiumDropdownMenu } from "@/components/ui/PremiumDropdownMenu";

/** The three-dot menu on a subject card — syllabus/homework/materials plus teacher-contact actions. */
export function SubjectActionMenu({
  onViewSyllabus,
  onViewHomework,
  onOpenMaterials,
  onMessageTeacher,
  onAskQuestion,
  onViewTeacherProfile,
}: {
  onViewSyllabus: () => void;
  onViewHomework: () => void;
  onOpenMaterials: () => void;
  onMessageTeacher: () => void;
  onAskQuestion: () => void;
  onViewTeacherProfile: () => void;
}) {
  return (
    <PremiumDropdownMenu
      align="end"
      width="w-56"
      trigger={
        <button
          type="button"
          aria-label="Subject actions"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/70 hover:text-foreground"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      }
      items={[
        { label: "View syllabus", icon: BookOpen, onClick: onViewSyllabus },
        { label: "View homework", icon: ClipboardList, onClick: onViewHomework },
        { label: "Open materials", icon: FolderOpen, onClick: onOpenMaterials },
        "separator",
        { label: "Message teacher", icon: MessageSquare, onClick: onMessageTeacher },
        { label: "Ask a question", icon: HelpCircle, onClick: onAskQuestion },
        { label: "View teacher profile", icon: UserRound, onClick: onViewTeacherProfile },
      ]}
    />
  );
}
