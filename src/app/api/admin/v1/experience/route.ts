import { experienceHandlers } from "@/features/experience";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const GET = experienceHandlers.list;
export const POST = experienceHandlers.create;
