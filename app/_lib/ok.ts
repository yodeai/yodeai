/** Convenience functions for API responses.
 * Usage:
 *  return ok({ message: "Hello, world!" });
 *  return error("Something went wrong.", 500);
 */
import { NextResponse } from "next/server";

/**
 * Return a 200 response with the given data.
 * @param data The data to return in the response.
 * @returns A NextResponse with a JSON body containing the data.
 */
export function ok(data?: unknown) {
  return NextResponse.json({ ok: true, data });
}

/**
 * Return a 400 response with the given error message.
 * @param message The error message to return in the response.
 * @param status The HTTP status code to return in the response. (default: 400)
 * @returns A NextResponse with a JSON body containing the error message.
 */
export function notOk(message: string, status = 500) {
  return NextResponse.json({ ok: false, error: message }, { status });
}