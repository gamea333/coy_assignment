"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { forwardRef, useImperativeHandle } from "react";
import type { Direction, Profile } from "@/lib/types";
import { ProfileCard } from "./ProfileCard";

const SWIPE_OFFSET = 110; // px dragged before release counts as a swipe
const SWIPE_VELOCITY = 600; // px/s flick also counts

export interface SwipeCardHandle {
  swipe: (dir: Direction) => void;
}

interface Props {
  profile: Profile;
  onSwiped: (dir: Direction) => void;
}

/** The draggable top card. Rotates with the drag, shows LIKE/NOPE stamps, flies off on release. */
export const SwipeCard = forwardRef<SwipeCardHandle, Props>(function SwipeCard({ profile, onSwiped }, ref) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], reduce ? [0, 0] : [-14, 14]);
  const likeOpacity = useTransform(x, [20, SWIPE_OFFSET], [0, 1]);
  const nopeOpacity = useTransform(x, [-SWIPE_OFFSET, -20], [1, 0]);

  const flyOut = (dir: Direction) => {
    const to = (dir === "like" ? 1 : -1) * (typeof window !== "undefined" ? window.innerWidth : 600) * 1.2;
    animate(x, to, { type: "tween", duration: reduce ? 0.1 : 0.28, ease: "easeIn", onComplete: () => onSwiped(dir) });
  };

  useImperativeHandle(ref, () => ({ swipe: flyOut }));

  return (
    <motion.div
      className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
      style={{ x, rotate }}
      drag="x"
      dragElastic={0.9}
      onDragEnd={(_, info) => {
        if (info.offset.x > SWIPE_OFFSET || info.velocity.x > SWIPE_VELOCITY) flyOut("like");
        else if (info.offset.x < -SWIPE_OFFSET || info.velocity.x < -SWIPE_VELOCITY) flyOut("pass");
        else animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
      }}
      initial={{ scale: 0.96, y: 10 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      <ProfileCard profile={profile} />
      <motion.span
        style={{ opacity: likeOpacity }}
        className="pointer-events-none absolute left-5 top-14 rounded-xl border-[3px] border-ink bg-mint px-3 py-1 text-3xl font-extrabold tracking-tight -rotate-12"
      >
        LIKE 💗
      </motion.span>
      <motion.span
        style={{ opacity: nopeOpacity }}
        className="pointer-events-none absolute right-5 top-14 rounded-xl border-[3px] border-ink bg-bg px-3 py-1 text-3xl font-extrabold tracking-tight rotate-12"
      >
        NOPE
      </motion.span>
    </motion.div>
  );
});
