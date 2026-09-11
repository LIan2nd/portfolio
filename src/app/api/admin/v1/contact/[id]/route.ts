import { contactHandlers } from "@/features/contact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return contactHandlers.detail(request, (await params).id);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return contactHandlers.markRead(request, (await params).id);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return contactHandlers.delete(request, (await params).id);
}
