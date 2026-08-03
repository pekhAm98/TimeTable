"use client";

import { authClient } from "../../src/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isPublicRoute = pathname === "/login" || pathname === "/register";

  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session && !isPublicRoute) {
      router.push("/login");
    }
  }, [session, isPending, isPublicRoute, router]);


  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (isPublicRoute) {
    return children;
  }


  if (!session) {
    return null;
  }


  return children;
}