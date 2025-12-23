import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ★ API は完全にスキップ（最重要）
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const password = process.env.BASIC_AUTH_PASSWORD;
  if (!password) return NextResponse.next();

  const auth = req.headers.get("authorization");

  if (!auth) {
    return new NextResponse("Auth required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Protected"',
      },
    });
  }

  const [, encoded] = auth.split(" ");
  const decoded = Buffer.from(encoded, "base64").toString();
  const [, pass] = decoded.split(":");

  if (pass !== password) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
