import { useCallback, useEffect, useState } from "react";

import { messagesService } from "@/lib/messagesService";
import { realtimeService } from "@/lib/realtimeService";

/** Reactive view over the full conversation list — re-renders on any mutation. */
export function useConversations() {
  const [, bump] = useState(0);

  useEffect(() => {
    const unsubscribe = realtimeService.subscribeToConversationsList(() => bump((n) => n + 1));
    return unsubscribe;
  }, []);

  const refresh = useCallback(() => bump((n) => n + 1), []);

  return { conversations: messagesService.getConversations(), refresh };
}
