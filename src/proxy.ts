import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  // 0. Block /dev routes in production
  if (pathname.startsWith("/dev")) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // 1. Compatibility Redirect: /account/* -> /dashboard/*
  if (pathname === "/account" || pathname === "/account/") {
    return NextResponse.redirect(new URL("/dashboard", req.url), 307);
  }
  if (pathname.startsWith("/account/")) {
    const subpath = pathname.replace(/^\/account\//, "");
    return NextResponse.redirect(new URL(`/dashboard/${subpath}`, req.url), 307);
  }

  // 2. Compatibility Redirect: /dashboard/user -> /dashboard
  if (pathname === "/dashboard/user" || pathname === "/dashboard/user/") {
    return NextResponse.redirect(new URL("/dashboard", req.url), 307);
  }

  // 3. Admin Canonical Redirect: /admin -> /admin/dashboard
  if (pathname === "/admin" || pathname === "/admin/") {
    if (!user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", "/admin/dashboard");
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.redirect(new URL("/admin/dashboard", req.url), 307);
  }

  // 4. Guard /admin/* routes
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role check: Only STAFF, ADMIN, and SUPER_ADMIN can access admin operations
    if (user.role !== "STAFF" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Settings page restricted exclusively to ADMIN and SUPER_ADMIN
    if (pathname.startsWith("/admin/settings") && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    // Staff accounts and audit logs restricted exclusively to SUPER_ADMIN
    if (
      (pathname.startsWith("/admin/staff") || pathname.startsWith("/admin/audit-logs")) &&
      user.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
  }

  // 5. Guard /dashboard/* customer routes
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If staff/admin lands on customer dashboard, route to admin console
    if (user.role === "STAFF" || user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export default proxy;

export const config = {
  matcher: ["/admin/:path*", "/admin", "/dashboard/:path*", "/account/:path*", "/account", "/dev/:path*"],
};
