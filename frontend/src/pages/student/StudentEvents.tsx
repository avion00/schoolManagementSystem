import { useState } from "react";
import { toast } from "sonner";

import { Reveal } from "@/components/motion";
import { StudentEventCard } from "@/components/student/StudentEventCard";
import { events as initialEvents, registerForEvent } from "@/data/studentDashboardData";

export function StudentEvents() {
  const [events, setEvents] = useState(initialEvents);

  function register(id: string) {
    registerForEvent(id);
    setEvents([...initialEvents]);
    toast.success("You're registered — see you there!");
  }

  return (
    <div className="space-y-4">
      <Reveal>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Events</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">Upcoming school events and competitions.</p>
      </Reveal>

      <Reveal delay={60} className="grid gap-3 sm:grid-cols-2">
        {events.map((e) => <StudentEventCard key={e.id} event={e} onRegister={() => register(e.id)} />)}
      </Reveal>
    </div>
  );
}
