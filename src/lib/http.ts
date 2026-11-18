import { NextResponse } from "next/server";
import { SwipeError, type SwipeErrorCode } from "./discover";

const STATUS: Record<SwipeErrorCode, number> = {
  INVALID_DIRECTION: 400,
  INVALID_TARGET: 400,
  SELF_SWIPE: 400,
  NOT_FOUND: 404,
  ALREADY_SWIPED: 409,
};

/** Never cache: feed and matches change after every swipe. */
export function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export function errorResponse(err: unknown) {
  if (err instanceof SwipeError) return json({ error: err.code, message: err.message }, STATUS[err.code]);
  console.error(err);
  return json({ error: "INTERNAL", message: "Something went wrong" }, 500);
}
