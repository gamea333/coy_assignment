"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client/api";
import type { Match } from "@/lib/types";

function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

/** Matches view (inside the Discover tab): mutual matches only. */
export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(() => {
    setFailed(false);
    api.matches().then(setMatches, () => setFailed(true));
  }, []);
  useEffect(load, [load]);

  return (
    <>
      <header className="flex h-[72px] items-center gap-3">
        <Link
          href="/discover"
          aria-label="Back to Discover"
          className="grid size-11 place-items-center rounded-full border-2 border-ink bg-bg shadow-pop active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="flex-1 text-[1.75rem] leading-none tracking-[-0.03em]">Your matches</h1>
        {matches && <span className="rounded-full bg-soft px-3 py-1 text-sm font-bold tabular-nums">{matches.length}</span>}
      </header>

      {failed && (
        <div className="mt-2 rounded-[26px] border-2 border-ink bg-peach p-6 shadow-pop-lg">
          <div className="text-4xl" aria-hidden>😵‍💫</div>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight">Couldn&apos;t load matches</h2>
          <button onClick={load} className="btn mt-5">Try again</button>
        </div>
      )}

      {!failed && matches === null && (
        <ul className="mt-2 space-y-3" aria-busy>
          {[0, 1, 2].map((i) => <li key={i} className="h-[88px] animate-pulse rounded-[20px] border-2 border-line bg-soft" />)}
        </ul>
      )}

      {matches?.length === 0 && (
        <div className="mt-2 rounded-[26px] border-2 border-dashed border-ink/40 p-7 text-center">
          <div className="text-4xl" aria-hidden>🤫</div>
          <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.02em]">No matches yet</h2>
          <p className="mt-2 text-muted">When you and someone both like each other, they show up here. Nobody finds out otherwise.</p>
          <Link href="/discover" className="btn mt-6">Start swiping</Link>
        </div>
      )}

      {matches && matches.length > 0 && (
        <ul className="mt-2 space-y-3">
          {matches.map((m) => (
            <li key={m.id} className="flex items-center gap-4 rounded-[20px] border-2 border-ink bg-bg p-3 shadow-pop">
              {/* eslint-disable-next-line @next/next/no-img-element -- placeholder images */}
              <img src={m.photoUrl} alt={`${m.name}'s photo`} className="size-16 shrink-0 rounded-full border-2 border-ink bg-soft object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[1.15rem] font-extrabold tracking-[-0.02em]">
                  {m.name}, <span className="font-semibold">{m.age}</span>
                </p>
                <p className="truncate text-sm text-muted">{m.college ? `${m.college} · ${m.city}` : m.city}</p>
              </div>
              <span className="shrink-0 self-start rounded-full bg-pink-soft px-2.5 py-1 text-xs font-bold">{timeAgo(m.matchedAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
