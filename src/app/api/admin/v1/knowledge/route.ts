import { knowledgeHandlers } from "@/features/knowledge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const GET = knowledgeHandlers.list;
export const POST = knowledgeHandlers.create;
