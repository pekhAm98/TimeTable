import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = new Set(["/login", "/register"]);

function isStaticAsset(pathname: string): boolean {
  return /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$/.test(pathname);
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Static resources / API routes don't need proxy authentication.
  // IMPORTANT: Do NOT bypass PUBLIC_PATHS here.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    isStaticAsset(pathname)
  ) {
    return NextResponse.next();
  }

  const isPublicPath = PUBLIC_PATHS.has(pathname);

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

    console.log("🔐 Proxy session status:", sessionResponse.status);

    if (sessionResponse.ok) {
      const sessionPayload = (await sessionResponse.json()) as
        | {
            session?: unknown;
            user?: unknown;
          }
        | null;

      console.log("🔐 Proxy session:", sessionPayload);

      const authenticated =
        !!sessionPayload?.session &&
        !!sessionPayload?.user;

      // Authenticated user trying to access /login or /register
      if (authenticated && isPublicPath) {
        console.log(
          `🔄 Authenticated user on ${pathname} → redirecting to /`
        );

        return NextResponse.redirect(
          new URL("/", request.url)
        );
      }

      // Authenticated user accessing a protected route
      if (authenticated) {
        return NextResponse.next();
      }

      // Unauthenticated user accessing a public route
      if (isPublicPath) {
        return NextResponse.next();
      }
    }
  } catch (error) {
    console.error("❌ Proxy auth check failed:", error);

    // If the session check itself fails, don't accidentally
    // expose protected routes.
  }

  // Unauthenticated user trying to access a protected route
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