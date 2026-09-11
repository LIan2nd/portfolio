import { knowledgeHandlers } from "@/features/knowledge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return knowledgeHandlers.detail(request, (await params).id);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return knowledgeHandlers.update(request, (await params).id);
}
