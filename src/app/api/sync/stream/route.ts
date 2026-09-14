export const dynamic = "force-dynamic";

export function GET() {
  // HTTP 204 tells older EventSource clients to stop reconnecting.
  return new Response(null, {
    status: 204,
    headers: {
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
