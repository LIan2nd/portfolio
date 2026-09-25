import { galleryHandlers } from "@/features/gallery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const GET = galleryHandlers.list;
export const POST = galleryHandlers.create;
