import type { DB } from "./db";

export type Direction = "like" | "pass";

/** The only profile fields ever sent to the client. Deliberately has no like-related data. */
export interface Profile {
  id: number;
  name: string;
  age: number;
  photoUrl: string;
  bio: string;
  city: string;
  college: string | null;
  interests: string[];
}

export interface Match extends Profile {
  matchedAt: string;
}

export type SwipeResult = { matched: false } | { matched: true; match: Match };

export type SwipeErrorCode = "INVALID_DIRECTION" | "INVALID_TARGET" | "SELF_SWIPE" | "NOT_FOUND" | "ALREADY_SWIPED";

export class SwipeError extends Error {
  constructor(public code: SwipeErrorCode, message: string) {
    super(message);
    this.name = "SwipeError";
  }
}

interface UserRow {
  id: number;
  name: string;
  age: number;
  photo_url: string;
  bio: string;
  city: string;
  college: string | null;
  interests: string;
}

const PROFILE_COLS = "u.id, u.name, u.age, u.photo_url, u.bio, u.city, u.college, u.interests";

function toProfile(r: UserRow): Profile {
  return {
    id: r.id,
    name: r.name,
    age: r.age,
    photoUrl: r.photo_url,
    bio: r.bio,
    city: r.city,
    college: r.college,
    interests: JSON.parse(r.interests) as string[],
  };
}

/** Fisher–Yates. The feed order must not depend on who liked the user (that would leak likes). */
function shuffle<T>(arr: T[], rand: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Profiles the user has not swiped on yet (excluding themselves), in random order. */
export function getFeed(db: DB, userId: number, rand: () => number = Math.random): Profile[] {
  const rows = db
    .prepare(
      `SELECT ${PROFILE_COLS} FROM users u
       WHERE u.id <> ?
         AND NOT EXISTS (SELECT 1 FROM swipes s WHERE s.swiper_id = ? AND s.target_id = u.id)
       ORDER BY u.id`
    )
    .all(userId, userId) as UserRow[];
  return shuffle(rows.map(toProfile), rand);
}

/**
 * Record a like or pass. Returns `matched: true` only when this like completes a mutual pair.
 * A pass, or a like that isn't returned, always gives the same `{ matched: false }`, so the
 * response never shows whether the other person liked you.
 */
export function recordSwipe(db: DB, userId: number, targetId: unknown, direction: unknown): SwipeResult {
  if (direction !== "like" && direction !== "pass") {
    throw new SwipeError("INVALID_DIRECTION", "direction must be 'like' or 'pass'");
  }
  if (typeof targetId !== "number" || !Number.isInteger(targetId) || targetId <= 0) {
    throw new SwipeError("INVALID_TARGET", "targetId must be a positive integer");
  }
  if (targetId === userId) throw new SwipeError("SELF_SWIPE", "cannot swipe on yourself");

  return db.transaction((): SwipeResult => {
    const exists = db.prepare("SELECT 1 FROM users WHERE id = ?").get(targetId);
    if (!exists) throw new SwipeError("NOT_FOUND", "profile not found");

    const inserted = db
      .prepare("INSERT OR IGNORE INTO swipes (swiper_id, target_id, direction) VALUES (?, ?, ?)")
      .run(userId, targetId, direction);
    if (inserted.changes === 0) throw new SwipeError("ALREADY_SWIPED", "already swiped on this profile");

    if (direction === "pass") return { matched: false };

    const likedBack = db
      .prepare("SELECT 1 FROM swipes WHERE swiper_id = ? AND target_id = ? AND direction = 'like'")
      .get(targetId, userId);
    if (!likedBack) return { matched: false };

    const [a, b] = userId < targetId ? [userId, targetId] : [targetId, userId];
    db.prepare("INSERT OR IGNORE INTO matches (user_a, user_b) VALUES (?, ?)").run(a, b);

    const match = getMatches(db, userId).find((m) => m.id === targetId)!;
    return { matched: true, match };
  })();
}

/** Mutual matches only, newest first. */
export function getMatches(db: DB, userId: number): Match[] {
  const rows = db
    .prepare(
      `SELECT ${PROFILE_COLS}, m.created_at AS matched_at
       FROM matches m
       JOIN users u ON u.id = CASE WHEN m.user_a = ? THEN m.user_b ELSE m.user_a END
       WHERE m.user_a = ? OR m.user_b = ?
       ORDER BY m.created_at DESC, u.id DESC`
    )
    .all(userId, userId, userId) as (UserRow & { matched_at: string })[];
  return rows.map((r) => ({ ...toProfile(r), matchedAt: r.matched_at }));
}
