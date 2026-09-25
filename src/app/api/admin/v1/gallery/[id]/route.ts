import { galleryHandlers } from "@/features/gallery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return galleryHandlers.detail(request, (await params).id);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return galleryHandlers.update(request, (await params).id);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return galleryHandlers.delete(request, (await params).id);
}
