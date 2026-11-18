"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { CURRENT_USER_PHOTO } from "@/lib/constants";
import type { Match } from "@/lib/types";

interface Props {
  match: Match | null;
  onKeepSwiping: () => void;
  onViewMatches: () => void;
}

/** "It's a match!" screen, in the style of Coy's own match card (ink edge, hard shadow, slight tilt, pink heart). */
export function MatchModal({ match, onKeepSwiping, onViewMatches }: Props) {
  const primaryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!match) return;
    primaryRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onKeepSwiping();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [match, onKeepSwiping]);

  return (
    <AnimatePresence>
      {match && (
        <motion.div
          key={match.id}
          role="dialog"
          aria-modal="true"
          aria-labelledby="match-title"
          className="fixed inset-0 z-50 grid place-items-center bg-ink/60 px-5 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-[380px]"
            initial={{ scale: 0.7, y: 40, rotate: -6, opacity: 0 }}
            animate={{ scale: 1, y: 0, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 20 }}
          >
            <div className="-rotate-2 rounded-[26px] border-2 border-ink bg-bg px-5 pt-6 pb-6 text-center shadow-pop-lg">
              <span className="inline-block rotate-[-3deg] rounded-full border-2 border-ink bg-yellow px-3 py-1.5 text-sm font-bold">
                Both of you said yes 🤫
              </span>

              <div className="relative mx-auto mt-6 flex w-fit items-center">
                <Face src={CURRENT_USER_PHOTO} alt="You" tilt="-rotate-6" />
                <span className="relative z-10 -mx-4 grid size-[46px] place-items-center rounded-full border-2 border-ink bg-pink text-xl" aria-hidden>
                  ♥
                </span>
                <Face src={match.photoUrl} alt={match.name} tilt="rotate-6" />
              </div>

              <h2 id="match-title" className="mt-6 text-[2.5rem] leading-none font-extrabold tracking-[-0.04em]">
                It&apos;s a match!
              </h2>
              <p className="mt-3 text-[1.05rem] text-muted">
                You and <strong className="text-ink">{match.name}</strong> liked each other.
              </p>
            </div>

            <div className="mt-7 flex flex-col gap-3">
              <button ref={primaryRef} onClick={onKeepSwiping} className="btn w-full">
                Keep swiping
              </button>
              <button
                onClick={onViewMatches}
                className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full border-2 border-ink bg-bg text-[1.0625rem] font-bold shadow-pop transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
              >
                View matches
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Face({ src, alt, tilt }: { src: string; alt: string; tilt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- placeholder images
    <img src={src} alt={alt} className={`size-[104px] rounded-full border-2 border-ink bg-soft object-cover ${tilt}`} />
  );
}
