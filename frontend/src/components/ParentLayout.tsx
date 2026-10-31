import { Shell } from "@/components/Shell";
import { parentSidebar } from "@/config/sidebarConfig";

export function ParentLayout() {
  return <Shell nav={parentSidebar} brand="Parent Portal" />;
}
