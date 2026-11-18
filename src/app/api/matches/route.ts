import { getDb } from "@/lib/db";
import { getMatches } from "@/lib/discover";
import { CURRENT_USER_ID } from "@/lib/constants";
import { errorResponse, json } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/matches: mutual matches only, newest first. */
export function GET() {
  try {
    return json({ matches: getMatches(getDb(), CURRENT_USER_ID) });
  } catch (err) {
    return errorResponse(err);
  }
}
