import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;
  const isPrivileged = user?.role === "STAFF" || user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const isCustomer = user?.role === "CUSTOMER";

  // 0. Block /dev routes in production
  if (pathname.startsWith("/dev")) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // 1. Compatibility Redirect: /account/* -> /dashboard/* (or /admin/dashboard for privileged)
  if (pathname === "/account" || pathname === "/account/") {
    if (isPrivileged) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url), 308);
    }
    return NextResponse.redirect(new URL("/dashboard", req.url), 308);
  }
  if (pathname.startsWith("/account/")) {
    if (isPrivileged) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url), 308);
    }
    const subpath = pathname.replace(/^\/account\//, "");
    return NextResponse.redirect(new URL(`/dashboard/${subpath}`, req.url), 308);
  }

  // 2. Compatibility Redirect: /dashboard/user -> /dashboard
  if (pathname === "/dashboard/user" || pathname === "/dashboard/user/") {
    if (isPrivileged) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url), 308);
    }
    return NextResponse.redirect(new URL("/dashboard", req.url), 308);
  }

  // 3. Admin Canonical Redirect: /admin -> /admin/dashboard
  if (pathname === "/admin" || pathname === "/admin/") {
    if (!user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", "/admin/dashboard");
      return NextResponse.redirect(loginUrl);
    }
    if (isCustomer) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/admin/dashboard", req.url), 308);
  }

  // 4. Guard /admin/* routes
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role check: Customers can NEVER access admin operations
    if (!isPrivileged) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Staff restrictions: STAFF can only access /admin/dashboard and /admin/orders
    if (user.role === "STAFF") {
      const isStaffAllowed =
        pathname === "/admin/dashboard" ||
        pathname.startsWith("/admin/orders");
      if (!isStaffAllowed) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
    }

    // Admin restrictions: ADMIN cannot access Super-Admin staff management or audit logs
    if (user.role === "ADMIN") {
      if (pathname.startsWith("/admin/staff") || pathname.startsWith("/admin/audit-logs")) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
    }
  }

  // 5. Guard /dashboard/* customer routes
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If staff/admin lands on customer dashboard, route to their own admin console
    if (isPrivileged) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
  }

  // 6. Anti-Admin Ordering Guard: Prevent Staff/Admin from customer checkout & cart
  if (pathname === "/checkout" || pathname.startsWith("/checkout/")) {
    if (isPrivileged) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
  }

  if (pathname === "/cart" || pathname.startsWith("/cart/")) {
    if (isPrivileged) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
  }

  // 7. Auth Pages: If user is already logged in, redirect them to their respective dashboard
  if (pathname === "/login" || pathname === "/register") {
    if (isPrivileged) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    if (isCustomer) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export default proxy;

export const config = {
  matcher: [
    "/admin/:path*",
    "/admin",
    "/dashboard/:path*",
    "/dashboard",
    "/account/:path*",
    "/account",
    "/checkout/:path*",
    "/checkout",
    "/cart/:path*",
    "/cart",
    "/login",
    "/register",
    "/deals/:path*",
    "/deals",
    "/new-arrivals/:path*",
    "/new-arrivals",
    "/gift-finder/:path*",
    "/gift-finder",
    "/",
    "/dev/:path*",
  ],
};
