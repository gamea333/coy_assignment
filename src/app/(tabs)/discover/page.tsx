"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DiscoverDeck } from "@/components/DiscoverDeck";
import { DiscoverHeader } from "@/components/DiscoverHeader";
import { MatchModal } from "@/components/MatchModal";
import { api } from "@/lib/client/api";
import type { Match } from "@/lib/types";

export default function DiscoverPage() {
  const router = useRouter();
  const [matchCount, setMatchCount] = useState<number>();
  const [latestMatch, setLatestMatch] = useState<Match | null>(null);

  useEffect(() => {
    api.matches().then((m) => setMatchCount(m.length), () => {});
  }, []);

  const onMatch = (m: Match) => {
    setMatchCount((c) => (c ?? 0) + 1);
    setLatestMatch(m);
  };
  const close = useCallback(() => setLatestMatch(null), []);

  return (
    <>
      <DiscoverHeader matchCount={matchCount} />
      <DiscoverDeck onMatch={onMatch} paused={latestMatch !== null} />
      <MatchModal match={latestMatch} onKeepSwiping={close} onViewMatches={() => router.push("/discover/matches")} />
    </>
  );
}
