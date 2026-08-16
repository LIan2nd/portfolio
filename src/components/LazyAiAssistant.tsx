"use client";

import dynamic from "next/dynamic";

const AiAssistant = dynamic(
  () =>
    import("@/components/AiAssistant").then((mod) => ({
      default: mod.AiAssistant,
    })),
  { ssr: false }
);

export function LazyAiAssistant() {
  return <AiAssistant />;
}
