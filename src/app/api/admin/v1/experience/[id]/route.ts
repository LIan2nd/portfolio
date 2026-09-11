import { experienceHandlers } from "@/features/experience";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return experienceHandlers.detail(request, (await params).id);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return experienceHandlers.update(request, (await params).id);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return experienceHandlers.delete(request, (await params).id);
}
