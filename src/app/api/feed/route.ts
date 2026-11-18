import { getDb } from "@/lib/db";
import { getFeed } from "@/lib/discover";
import { CURRENT_USER_ID } from "@/lib/constants";
import { errorResponse, json } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/feed: profiles the user has not swiped on yet. */
export function GET() {
  try {
    return json({ profiles: getFeed(getDb(), CURRENT_USER_ID) });
  } catch (err) {
    return errorResponse(err);
  }
}
