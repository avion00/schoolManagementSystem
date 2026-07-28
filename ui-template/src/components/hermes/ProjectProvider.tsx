import { createContext, useContext, useState, type ReactNode } from "react";
import type { ProjectId } from "@/lib/hermes-data";

type ProjectCtx = {
  projectId: ProjectId;
  setProjectId: (id: ProjectId) => void;
  researchPaused: boolean;
  setResearchPaused: (p: boolean) => void;
};

const Ctx = createContext<ProjectCtx | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projectId, setProjectId] = useState<ProjectId>("flottahub");
  const [researchPaused, setResearchPaused] = useState(false);
  return (
    <Ctx.Provider value={{ projectId, setProjectId, researchPaused, setResearchPaused }}>
      {children}
    </Ctx.Provider>
  );
}

export function useProject() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useProject outside provider");
  return v;
}
