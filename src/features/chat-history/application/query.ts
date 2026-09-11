import type { HistoryQuery } from "../domain/types";

export class InvalidHistoryQuery extends Error {}

export function isQueryId(value: string) {
  return /^[a-f\d]{24}$/i.test(value);
}

export function parseHistoryQuery(params: URLSearchParams): HistoryQuery {
  for (const key of params.keys()) {
    if (
      !["q", "status", "date", "limit", "cursor"].includes(key) ||
      params.getAll(key).length !== 1
    ) {
      throw new InvalidHistoryQuery("Unsupported or repeated query parameter.");
    }
  }
  const q = (params.get("q") ?? "").trim();
  const status = params.get("status") ?? "";
  const date = params.get("date") ?? "";
  const rawLimit = params.get("limit") ?? "25";
  const limit = Number(rawLimit);
  if (
    q.length > 200 ||
    !["", "answered", "missing"].includes(status) ||
    !/^\d+$/.test(rawLimit) ||
    limit < 1 ||
    limit > 50
  ) {
    throw new InvalidHistoryQuery(
      "Invalid search, response status, or page size.",
    );
  }
  if (
    date &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(Date.parse(date)) ||
      new Date(date).toISOString().slice(0, 10) !== date)
  ) {
    throw new InvalidHistoryQuery(
      "Invalid date. Use YYYY-MM-DD in Jakarta time.",
    );
  }
  let cursor: HistoryQuery["cursor"];
  const encoded = params.get("cursor");
  if (encoded) {
    try {
      if (encoded.length > 256 || !/^[\w-]+$/.test(encoded)) throw new Error();
      const value: unknown = JSON.parse(
        Buffer.from(encoded, "base64url").toString(),
      );
      if (
        !value ||
        typeof value !== "object" ||
        !("id" in value) ||
        !("createdAt" in value) ||
        typeof value.id !== "string" ||
        !isQueryId(value.id) ||
        typeof value.createdAt !== "string" ||
        new Date(value.createdAt).toISOString() !== value.createdAt
      )
        throw new Error();
      cursor = { id: value.id, createdAt: value.createdAt };
    } catch {
      throw new InvalidHistoryQuery("Invalid page cursor.");
    }
  }
  return { q, status: status as HistoryQuery["status"], date, limit, cursor };
}
