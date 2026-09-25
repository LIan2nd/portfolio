import { galleryHandlers } from "@/features/gallery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const POST = galleryHandlers.createUploadTicket;
export const DELETE = galleryHandlers.discardUpload;
