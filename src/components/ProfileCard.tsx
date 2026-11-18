"use client";

import { useState } from "react";
import type { Profile } from "@/lib/types";

/** Coy-style card: photo on top, white info panel below, ink edge with a hard shadow. */
export function ProfileCard({ profile }: { profile: Profile }) {
  const { name, age, photoUrl, bio, city, college, interests } = profile;
  const [broken, setBroken] = useState(false);
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[26px] border-2 border-ink bg-bg shadow-pop-lg select-none">
      <div className="relative min-h-0 flex-1 border-b-2 border-ink bg-soft">
        {broken ? (
          <div className="absolute inset-0 grid place-items-center bg-lilac text-7xl font-extrabold" aria-label={`${name}'s photo is unavailable`}>
            {name[0]}
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- placeholder images, no optimisation needed
          <img src={photoUrl} alt={`${name}'s photo`} draggable={false} onError={() => setBroken(true)} className="absolute inset-0 size-full object-cover" />
        )}
        <span className="absolute left-4 top-4 rounded-full border-2 border-ink bg-yellow px-3 py-1 text-sm font-bold -rotate-3">
          📍 {city}
        </span>
      </div>
      <div className="shrink-0 px-5 pt-4 pb-5">
        <h2 className="text-[1.75rem] leading-tight font-extrabold tracking-[-0.03em]">
          {name}, <span className="font-semibold">{age}</span>
        </h2>
        {college && <p className="mt-0.5 text-[0.95rem] font-semibold text-muted">🎓 {college}</p>}
        <p className="mt-2 line-clamp-2 text-[1rem] leading-snug">{bio}</p>
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Interests">
          {interests.map((i) => (
            <li key={i} className="rounded-full border border-line bg-soft px-2.5 py-1 text-[0.8rem] font-semibold">
              {i}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
