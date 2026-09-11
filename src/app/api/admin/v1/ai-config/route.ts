import { aiConfigHandlers } from "@/features/ai-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const GET = aiConfigHandlers.getConfig;
export const PUT = aiConfigHandlers.updateConfig;
