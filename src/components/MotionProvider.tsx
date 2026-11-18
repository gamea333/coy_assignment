"use client";

import { MotionConfig } from "framer-motion";

/** Respect the OS "reduce motion" setting for all Framer Motion animations. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
