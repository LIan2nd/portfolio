import { projectHandlers } from "@/features/project";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const GET = projectHandlers.list;
export const POST = projectHandlers.create;
