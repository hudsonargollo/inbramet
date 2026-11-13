import { NextResponse, type NextRequest } from "next/server";

function publicOrigin(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return request.nextUrl.origin;
  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  return `${proto}://${host}`;
}

// Single online store mode: redirect any legacy branch switch request to /shop.
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/shop", publicOrigin(request)));
}
