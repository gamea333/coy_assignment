import { getDb } from "@/lib/db";
import { recordSwipe } from "@/lib/discover";
import { CURRENT_USER_ID } from "@/lib/constants";
import { errorResponse, json } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/swipe { targetId, direction }: returns { matched, match? }. */
export async function POST(req: Request) {
  let body: { targetId?: unknown; direction?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "INVALID_BODY", message: "Body must be JSON" }, 400);
  }
  if (!body || typeof body !== "object") {
    return json({ error: "INVALID_BODY", message: "Body must be a JSON object" }, 400);
  }
  try {
    return json(recordSwipe(getDb(), CURRENT_USER_ID, body.targetId, body.direction));
  } catch (err) {
    return errorResponse(err);
  }
}
