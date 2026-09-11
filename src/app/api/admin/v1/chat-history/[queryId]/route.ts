import { historyHandlers } from "@/features/chat-history";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ queryId: string }> },
) {
  return historyHandlers.detail(request, (await params).queryId);
}
