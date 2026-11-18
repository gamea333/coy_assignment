"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/client/api";
import type { Direction, Match, Profile } from "@/lib/types";
import { ProfileCard } from "./ProfileCard";
import { SwipeCard, type SwipeCardHandle } from "./SwipeCard";

interface Props {
  onMatch: (match: Match) => void;
  /** True while a modal is open, so arrow keys don't swipe behind it. */
  paused?: boolean;
}

type Status = "loading" | "ready" | "error";

/** Fetches the feed and runs the swipe loop. Optimistic: the card leaves at once; we roll back if the POST fails. */
export function DiscoverDeck({ onMatch, paused = false }: Props) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const topRef = useRef<SwipeCardHandle>(null);

  const load = useCallback(() => {
    setStatus("loading");
    api.feed().then(
      (p) => { setProfiles(p); setStatus("ready"); },
      () => setStatus("error"),
    );
  }, []);
  useEffect(load, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const handleSwiped = async (profile: Profile, dir: Direction) => {
    setProfiles((p) => p.filter((x) => x.id !== profile.id));
    setBusy(false);
    try {
      const res = await api.swipe(profile.id, dir);
      if (res.matched) onMatch(res.match);
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (code === "ALREADY_SWIPED" || code === "NOT_FOUND") return; // already gone server-side: keep it removed
      setProfiles((p) => [profile, ...p]); // roll back
      setToast("Couldn't save that swipe. Try again.");
    }
  };

  const press = (dir: Direction) => {
    if (busy || !topRef.current) return;
    setBusy(true);
    topRef.current.swipe(dir);
  };

  const [top, next] = profiles;

  // Keyboard: ← pass, → like (desktop).
  useEffect(() => {
    if (paused) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      if (e.key === "ArrowRight") { e.preventDefault(); press("like"); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); press("pass"); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Preload the photos of the next few cards so swipes never reveal a blank image.
  useEffect(() => {
    for (const p of profiles.slice(1, 4)) new Image().src = p.photoUrl;
  }, [profiles]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="relative mx-1 min-h-[400px] flex-1">
        {status === "loading" && <div className="absolute inset-0 animate-pulse rounded-[26px] border-2 border-line bg-soft" />}
        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-start justify-center rounded-[26px] border-2 border-ink bg-peach p-6 shadow-pop-lg">
            <div className="text-4xl" aria-hidden>😵‍💫</div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight">Couldn&apos;t load profiles</h2>
            <button onClick={load} className="btn mt-5">Try again</button>
          </div>
        )}
        {status === "ready" && !top && (
          <div className="absolute inset-0 flex flex-col items-start justify-center rounded-[26px] border-2 border-ink bg-lilac p-6 shadow-pop-lg">
            <div className="text-4xl" aria-hidden>🤫</div>
            <h2 className="mt-3 text-[2rem] leading-none font-extrabold tracking-[-0.035em]">You&apos;ve seen everyone</h2>
            <p className="mt-3 text-muted">No new profiles right now. Check back later.</p>
            <Link href="/discover/matches" className="btn mt-6">See your matches</Link>
          </div>
        )}
        {next && (
          <div className="absolute inset-0 translate-y-2.5 scale-[0.96]" aria-hidden>
            <ProfileCard profile={next} />
          </div>
        )}
        {top && <SwipeCard key={top.id} ref={topRef} profile={top} onSwiped={(d) => handleSwiped(top, d)} />}
      </div>

      {top && (
        <div className="mt-6 flex items-center justify-center gap-6">
          <button
            onClick={() => press("pass")}
            aria-label={`Pass on ${top.name}`}
            className="grid size-16 place-items-center rounded-full border-2 border-ink bg-bg text-2xl font-bold shadow-pop transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          >
            ✕
          </button>
          <button
            onClick={() => press("like")}
            aria-label={`Like ${top.name}`}
            className="grid size-[72px] place-items-center rounded-full border-2 border-ink bg-pink text-3xl shadow-pop transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          >
            ♥
          </button>
        </div>
      )}
      {top && (
        <p className="mt-4 hidden text-center text-sm text-muted [@media(hover:hover)]:block">
          Use <kbd className="rounded border border-line bg-soft px-1.5 font-sans font-semibold">←</kbd> to pass and{" "}
          <kbd className="rounded border border-line bg-soft px-1.5 font-sans font-semibold">→</kbd> to like
        </p>
      )}

      {toast && (
        <div role="status" className="fixed inset-x-0 bottom-24 z-50 mx-auto w-fit rounded-full border-2 border-ink bg-yellow px-4 py-2 text-sm font-bold shadow-pop">
          {toast}
        </div>
      )}
    </div>
  );
}
