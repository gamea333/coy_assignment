import type { Direction, Match, Profile, SwipeResult } from "../types";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...init });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(body.message ?? `Request failed (${res.status})`), { code: body.error, status: res.status });
  return body as T;
}

export const api = {
  feed: () => request<{ profiles: Profile[] }>("/api/feed").then((r) => r.profiles),
  matches: () => request<{ matches: Match[] }>("/api/matches").then((r) => r.matches),
  swipe: (targetId: number, direction: Direction) =>
    request<SwipeResult>("/api/swipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId, direction }),
    }),
};
