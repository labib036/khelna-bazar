import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  // 0. Block /dev routes in production
  if (pathname.startsWith("/dev")) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // 1. Guard /admin routes
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role check: Only ADMIN and STAFF can access admin operations
    if (user.role !== "ADMIN" && user.role !== "STAFF") {
      return NextResponse.redirect(new URL("/account", req.url));
    }

    // Settings page restricted exclusively to ADMIN
    if (pathname.startsWith("/admin/settings") && user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  // 2. Guard /account routes
  if (pathname.startsWith("/account")) {
    if (!user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/dev/:path*"],
};
