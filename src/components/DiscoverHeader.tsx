import Link from "next/link";
import { Wordmark } from "./Wordmark";

/** Discover header: wordmark on the left, Matches button (with count chip) on the right. */
export function DiscoverHeader({ matchCount }: { matchCount?: number }) {
  return (
    <header className="flex h-[72px] items-center justify-between">
      <Wordmark />
      <Link
        href="/discover/matches"
        className="inline-flex h-11 items-center gap-2 rounded-full border-2 border-ink bg-bg pl-4 pr-2 text-[0.95rem] font-bold shadow-pop transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
      >
        Matches
        <span className="grid min-w-7 place-items-center rounded-full bg-pink-soft px-2 py-0.5 text-sm font-bold tabular-nums">
          {matchCount ?? "·"}
        </span>
      </Link>
    </header>
  );
}
