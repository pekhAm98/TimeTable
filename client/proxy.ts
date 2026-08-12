import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = new Set(["/login", "/register"]);

function isStaticAsset(pathname: string): boolean {
  return /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$/.test(pathname);
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Public routes / static resources
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    isStaticAsset(pathname) ||
    PUBLIC_PATHS.has(pathname)
  ) {
    return NextResponse.next();
  }

  const apiBase =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  try {
    const sessionResponse = await fetch(
      `${apiBase}/api/auth/get-session`,
      {
        headers: {
          cookie: request.headers.get("cookie") ?? "",
          origin: request.nextUrl.origin,
        },
        cache: "no-store",
      }
    );

    console.log(
      "🔐 Proxy session status:",
      sessionResponse.status
    );

    if (sessionResponse.ok) {
      const sessionPayload = (await sessionResponse.json()) as
        | {
            session?: unknown;
            user?: unknown;
          }
        | null;

      console.log(
        "🔐 Proxy session:",
        sessionPayload
      );

      // No session → continue to redirect below
      if (sessionPayload?.session && sessionPayload?.user) {
        return NextResponse.next();
      }
    }
  } catch (error) {
    console.error("❌ Proxy auth check failed:", error);
  }

  const loginUrl = new URL("/login", request.url);

  loginUrl.searchParams.set(
    "next",
    `${pathname}${search}`
  );

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/:path*"],
};