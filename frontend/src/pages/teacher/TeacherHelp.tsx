import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Reveal, SlidingTabs } from "@/components/motion";
import { AssignedHelpTickets } from "@/components/teacher/help/AssignedHelpTickets";
import { CreateHelpRequestModal } from "@/components/teacher/help/CreateHelpRequestModal";
import { HelpKnowledgeBase } from "@/components/teacher/help/HelpKnowledgeBase";
import { MyRequestsTable } from "@/components/teacher/help/MyRequestsTable";
import { QuickContactCards } from "@/components/teacher/help/QuickContactCards";
import { QuickRequestCards } from "@/components/teacher/help/QuickRequestCards";
import { StudentSupportCases } from "@/components/teacher/help/StudentSupportCases";
import { TeacherHelpHero } from "@/components/teacher/help/TeacherHelpHero";
import { TeacherHelpStats } from "@/components/teacher/help/TeacherHelpStats";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PremiumCard } from "@/components/ui/PremiumCard";
import {
  assignedTickets as initialAssignedTickets,
  closeMyRequest,
  computeTeacherHelpStats,
  markAssignedHandled,
  markParentConcernAnswered,
  markSupportCaseResolved,
  myRequests as initialMyRequests,
  parentConcerns as initialParentConcerns,
  requestAdminSupportFor,
  studentSupportCases as initialStudentSupportCases,
  type AssignedTicket,
  type HelpArticle,
  type HelpRequestType,
  type SendToOption,
} from "@/data/teacherHelpData";
import { useAuth } from "@/lib/auth";
import { resolveCurrentChatUser } from "@/lib/messagesService";

const SECTION_TABS = [{ value: "mine", label: "My Requests" }, { value: "assigned", label: "Assigned to Me" }];

export function TeacherHelp() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user ? resolveCurrentChatUser(user).id : "";

  const [myRequests, setMyRequests] = useState(initialMyRequests);
  const [assignedTickets, setAssignedTickets] = useState(initialAssignedTickets);
  const [supportCases, setSupportCases] = useState(initialStudentSupportCases);
  const [parentConcerns, setParentConcerns] = useState(initialParentConcerns);
  const [sectionTab, setSectionTab] = useState("mine");

  const [createOpen, setCreateOpen] = useState(false);
  const [createCategory, setCreateCategory] = useState<HelpRequestType | undefined>();
  const [createSendTo, setCreateSendTo] = useState<SendToOption | undefined>();
  const [createTitle, setCreateTitle] = useState<string | undefined>();

  const [articleOpen, setArticleOpen] = useState<HelpArticle | null>(null);

  function refreshAll() {
    setMyRequests([...initialMyRequests]);
    setAssignedTickets([...initialAssignedTickets]);
    setSupportCases([...initialStudentSupportCases]);
  }

  function openCreate(category?: HelpRequestType, sendTo?: SendToOption, title?: string) {
    setCreateCategory(category);
    setCreateSendTo(sendTo);
    setCreateTitle(title);
    setCreateOpen(true);
  }

  function handleRequestAdminSupport(ticket: AssignedTicket) {
    requestAdminSupportFor(ticket);
    refreshAll();
    toast.success("Admin support requested — tracked under My Requests.");
    setSectionTab("mine");
  }

  const stats = computeTeacherHelpStats();

  return (
    <div className="space-y-4">
      <TeacherHelpHero
        onNewRequest={(category, sendTo) => openCreate(category, sendTo)}
        onViewTickets={() => setSectionTab("mine")}
      />

      <TeacherHelpStats stats={stats} />

      <QuickRequestCards onCreate={(type) => openCreate(type.category, type.sendTo, type.label)} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <Reveal delay={100} className="-mx-1 overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <SlidingTabs value={sectionTab} onValueChange={setSectionTab} options={SECTION_TABS} className="w-max" />
          </Reveal>

          <Reveal delay={120}>
            {sectionTab === "mine" ? (
              <MyRequestsTable
                requests={myRequests}
                onView={(id) => navigate(`/teacher/help/${id}`)}
                onClose={(id) => { closeMyRequest(id); refreshAll(); toast.success("Request closed."); }}
              />
            ) : (
              <AssignedHelpTickets
                tickets={assignedTickets}
                currentUserId={currentUserId}
                onView={(id) => navigate(`/teacher/help/${id}`)}
                onMarkHandled={(id) => { markAssignedHandled(id); refreshAll(); toast.success("Marked as handled."); }}
                onRequestAdminSupport={handleRequestAdminSupport}
              />
            )}
          </Reveal>
        </div>

        <div className="space-y-4">
          <Reveal delay={140}>
            <h2 className="mb-2 text-[13px] font-semibold text-foreground">Quick contacts</h2>
            <QuickContactCards currentUserId={currentUserId} onCreateRequest={(sendTo) => openCreate("Other", sendTo)} />
          </Reveal>

          <Reveal delay={160}>
            <h2 className="mb-2 text-[13px] font-semibold text-foreground">Student & parent support</h2>
            <StudentSupportCases
              cases={supportCases}
              currentUserId={currentUserId}
              onResolve={(id) => { markSupportCaseResolved(id); refreshAll(); toast.success("Marked resolved."); }}
            />
            {parentConcerns.some((c) => c.status === "Pending") && (
              <PremiumCard className="mt-2.5 p-3.5">
                <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">Parent questions pending</p>
                <div className="space-y-2">
                  {parentConcerns.filter((c) => c.status === "Pending").map((c) => (
                    <div key={c.id} className="flex items-start justify-between gap-2 text-[12px]">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{c.parentName} <span className="font-normal text-muted-foreground">· {c.className}</span></p>
                        <p className="truncate text-muted-foreground">{c.question}</p>
                      </div>
                      <button
                        type="button"
                        className="shrink-0 text-[11px] font-medium text-primary hover:underline"
                        onClick={() => { markParentConcernAnswered(c.id); setParentConcerns([...initialParentConcerns]); toast.success("Marked answered."); }}
                      >
                        Mark answered
                      </button>
                    </div>
                  ))}
                </div>
              </PremiumCard>
            )}
          </Reveal>

          <Reveal delay={180}>
            <h2 className="mb-2 text-[13px] font-semibold text-foreground">Knowledge base</h2>
            <HelpKnowledgeBase onView={setArticleOpen} />
          </Reveal>
        </div>
      </div>

      <CreateHelpRequestModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultCategory={createCategory}
        defaultSendTo={createSendTo}
        defaultTitle={createTitle}
        onCreated={refreshAll}
      />

      <Dialog open={!!articleOpen} onOpenChange={(open) => !open && setArticleOpen(null)}>
        <DialogContent className="max-w-lg">
          {articleOpen && (
            <>
              <DialogHeader>
                <DialogTitle>{articleOpen.title}</DialogTitle>
                <DialogDescription>{articleOpen.category} · {articleOpen.readMins} min read</DialogDescription>
              </DialogHeader>
              <ol className="list-decimal space-y-2 pl-5 text-[13px] text-foreground">
                {articleOpen.steps.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
              <Button variant="outline" onClick={() => setArticleOpen(null)}>Close</Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
