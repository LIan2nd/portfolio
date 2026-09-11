"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function LiveContentSync() {
  const router = useRouter();

  useEffect(() => {
    let es: EventSource | null = null;
    try {
      es = new EventSource("/api/sync/stream");
      es.addEventListener("content_update", () => {
        router.refresh();
      });
    } catch {
      // Graceful fallback if EventSource is unavailable
    }

    return () => {
      es?.close();
    };
  }, [router]);

  return null;
}
