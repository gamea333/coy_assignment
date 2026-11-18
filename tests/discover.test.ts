import { beforeEach, describe, expect, it } from "vitest";
import { openDb, type DB } from "@/lib/db";
import { getFeed, getMatches, recordSwipe, SwipeError } from "@/lib/discover";

const ME = 1;
const PUBLIC_KEYS = ["age", "bio", "city", "college", "id", "interests", "name", "photoUrl"];

let db: DB;

function addUser(id: number) {
  db.prepare(
    `INSERT INTO users (id, name, age, photo_url, bio, city, college, interests)
     VALUES (?, ?, 22, 'https://x/y.jpg', 'bio', 'Delhi', NULL, '["Music"]')`
  ).run(id, `User${id}`);
}
const like = (from: number, to: number) =>
  db.prepare("INSERT INTO swipes (swiper_id, target_id, direction) VALUES (?, ?, 'like')").run(from, to);
const matchRows = () => (db.prepare("SELECT COUNT(*) AS n FROM matches").get() as { n: number }).n;
const feedIds = () => getFeed(db, ME).map((p) => p.id).sort((a, b) => a - b);

function expectCode(fn: () => unknown, code: string) {
  try {
    fn();
  } catch (e) {
    expect(e).toBeInstanceOf(SwipeError);
    expect((e as SwipeError).code).toBe(code);
    return;
  }
  throw new Error(`expected SwipeError ${code}`);
}

beforeEach(() => {
  db = openDb(":memory:");
  [1, 2, 3, 4, 5].forEach(addUser);
});

describe("getFeed", () => {
  it("returns everyone except the user when nothing has been swiped", () => {
    expect(feedIds()).toEqual([2, 3, 4, 5]);
  });

  it("excludes profiles already liked or passed", () => {
    recordSwipe(db, ME, 2, "like");
    recordSwipe(db, ME, 3, "pass");
    expect(feedIds()).toEqual([4, 5]);
  });

  it("is not affected by other users' swipes on me", () => {
    like(2, ME);
    expect(feedIds()).toEqual([2, 3, 4, 5]);
  });

  it("returns an empty list when everyone has been swiped", () => {
    [2, 3, 4, 5].forEach((id) => recordSwipe(db, ME, id, "pass"));
    expect(getFeed(db, ME)).toEqual([]);
  });
});

describe("recordSwipe", () => {
  it("creates a match when the target already liked the user", () => {
    like(2, ME);
    const res = recordSwipe(db, ME, 2, "like");
    expect(res.matched).toBe(true);
    if (res.matched) expect(res.match.id).toBe(2);
    expect(matchRows()).toBe(1);
  });

  it("does not match a one-sided like", () => {
    expect(recordSwipe(db, ME, 2, "like")).toEqual({ matched: false });
    expect(matchRows()).toBe(0);
  });

  it("matches later, when the other person likes back", () => {
    recordSwipe(db, ME, 2, "like");
    const res = recordSwipe(db, 2, ME, "like");
    expect(res.matched).toBe(true);
    expect(getMatches(db, ME).map((m) => m.id)).toEqual([2]);
  });

  it("never matches on a pass, even if the target liked the user", () => {
    like(2, ME);
    expect(recordSwipe(db, ME, 2, "pass")).toEqual({ matched: false });
    expect(matchRows()).toBe(0);
  });

  it("rejects a duplicate swipe and never duplicates a match", () => {
    like(2, ME);
    recordSwipe(db, ME, 2, "like");
    expectCode(() => recordSwipe(db, ME, 2, "like"), "ALREADY_SWIPED");
    expectCode(() => recordSwipe(db, ME, 2, "pass"), "ALREADY_SWIPED");
    expect(matchRows()).toBe(1);
  });

  it("does not let a pass be changed into a like", () => {
    like(2, ME);
    recordSwipe(db, ME, 2, "pass");
    expectCode(() => recordSwipe(db, ME, 2, "like"), "ALREADY_SWIPED");
    expect(matchRows()).toBe(0);
  });

  it("validates input", () => {
    expectCode(() => recordSwipe(db, ME, ME, "like"), "SELF_SWIPE");
    expectCode(() => recordSwipe(db, ME, 999, "like"), "NOT_FOUND");
    expectCode(() => recordSwipe(db, ME, 2, "superlike"), "INVALID_DIRECTION");
    expectCode(() => recordSwipe(db, ME, "2", "like"), "INVALID_TARGET");
    expectCode(() => recordSwipe(db, ME, 2.5, "like"), "INVALID_TARGET");
    expect((db.prepare("SELECT COUNT(*) AS n FROM swipes").get() as { n: number }).n).toBe(0);
  });
});

describe("getMatches", () => {
  it("lists only mutual matches, newest first", () => {
    like(2, ME);
    like(3, ME);
    recordSwipe(db, ME, 2, "like");
    recordSwipe(db, ME, 3, "like");
    recordSwipe(db, ME, 4, "like"); // one-sided
    db.prepare("UPDATE matches SET created_at = '2020-01-01' WHERE user_b = 2").run();
    expect(getMatches(db, ME).map((m) => m.id)).toEqual([3, 2]);
  });
});

describe("privacy: never reveal who liked the user unless mutual", () => {
  it("feed profiles carry only public fields", () => {
    like(2, ME);
    for (const p of getFeed(db, ME)) expect(Object.keys(p).sort()).toEqual(PUBLIC_KEYS);
  });

  it("a profile that liked me looks identical in the feed to one that did not", () => {
    like(2, ME);
    const [p2, p3] = [2, 3].map((id) => getFeed(db, ME).find((p) => p.id === id)!);
    const strip = ({ id: _i, name: _n, ...rest }: typeof p2) => rest;
    expect(strip(p2)).toEqual(strip(p3));
  });

  it("feed order does not depend on incoming likes", () => {
    const fixedRand = () => 0.5;
    const before = getFeed(db, ME, fixedRand).map((p) => p.id);
    like(4, ME);
    like(5, ME);
    expect(getFeed(db, ME, fixedRand).map((p) => p.id)).toEqual(before);
  });

  it("a non-mutual like and a pass return the same response", () => {
    like(2, ME);
    expect(recordSwipe(db, ME, 2, "pass")).toEqual(recordSwipe(db, ME, 3, "like"));
  });

  it("incoming likes never show up in matches", () => {
    like(2, ME);
    like(3, ME);
    expect(getMatches(db, ME)).toEqual([]);
  });
});
