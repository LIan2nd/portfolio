export function isCurrentActivityQuery(query: string): boolean {
  return /\b(sekarang|saat ini|lagi apa|ngapain|ngerjain|kesibukan(?:mu)?|sibuk|aktivitas(?:mu)?|pantona|bootcamp|currently|doing now|these days|current (?:activity|activities|status)|status (?:kerja|karier|bootcamp|aktivitas))\b/i.test(
    query,
  );
}
