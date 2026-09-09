import { NextResponse } from "next/server";
import { deleteSession, isUnauthorizedError, MissingSessionError, refreshSession } from "@/features/auth/server";

export async function GET(request: Request): Promise<Response> {
  if (request.headers.get("sec-fetch-site") === "cross-site") return new Response("Forbidden", { status: 403 });
  const url = new URL(request.url);
  const returnTo = url.searchParams.get("returnTo");
  const destination = returnTo === "/users" ? "/users" : "/";
  try {
    await refreshSession();
    return NextResponse.redirect(new URL(destination, url.origin));
  } catch (error) {
    if (error instanceof MissingSessionError || isUnauthorizedError(error)) {
      await deleteSession();
      return NextResponse.redirect(new URL("/login", url.origin));
    }
    return new Response("The backend is unavailable. Reload this page to retry.", {
      status: 503, headers: { "Cache-Control": "private, no-store" },
    });
  }
}
