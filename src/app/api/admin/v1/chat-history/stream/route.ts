import { historyHandlers } from "@/features/chat-history";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const GET = historyHandlers.stream;
