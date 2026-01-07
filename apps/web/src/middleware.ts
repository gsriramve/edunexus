import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/privacy",
  "/terms",
  "/contact",
  "/api/webhooks(.*)",
]);

// Define routes by role
const isPlatformOwnerRoute = createRouteMatcher(["/platform(.*)"]);
const isPrincipalRoute = createRouteMatcher(["/principal(.*)"]);
const isHodRoute = createRouteMatcher(["/hod(.*)"]);
const isAdminStaffRoute = createRouteMatcher(["/admin(.*)"]);
const isTeacherRoute = createRouteMatcher(["/teacher(.*)"]);
const isLabAssistantRoute = createRouteMatcher(["/lab-assistant(.*)"]);
const isStudentRoute = createRouteMatcher(["/student(.*)"]);
const isParentRoute = createRouteMatcher(["/parent(.*)"]);

// Type for session claims with metadata
interface SessionClaimsWithMetadata {
  metadata?: {
    role?: string;
    tenantId?: string;
    departmentId?: string;
  };
}

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes
  if (isPublicRoute(req)) {
    return;
  }

  // Protect all other routes - require authentication
  const { userId, sessionClaims } = await auth.protect();

  // Get user role from session claims (set via Clerk metadata)
  const claims = sessionClaims as SessionClaimsWithMetadata | undefined;
  const userRole = claims?.metadata?.role;

  // Role-based route protection
  if (isPlatformOwnerRoute(req) && userRole !== "platform_owner") {
    return Response.redirect(new URL("/unauthorized", req.url));
  }

  if (isPrincipalRoute(req) && !["platform_owner", "principal"].includes(userRole || "")) {
    return Response.redirect(new URL("/unauthorized", req.url));
  }

  if (isHodRoute(req) && !["platform_owner", "principal", "hod"].includes(userRole || "")) {
    return Response.redirect(new URL("/unauthorized", req.url));
  }

  if (isAdminStaffRoute(req) && !["platform_owner", "principal", "admin_staff"].includes(userRole || "")) {
    return Response.redirect(new URL("/unauthorized", req.url));
  }

  if (isTeacherRoute(req) && !["platform_owner", "principal", "hod", "teacher"].includes(userRole || "")) {
    return Response.redirect(new URL("/unauthorized", req.url));
  }

  if (isLabAssistantRoute(req) && !["platform_owner", "principal", "hod", "lab_assistant"].includes(userRole || "")) {
    return Response.redirect(new URL("/unauthorized", req.url));
  }

  if (isStudentRoute(req) && !["platform_owner", "principal", "hod", "teacher", "student"].includes(userRole || "")) {
    return Response.redirect(new URL("/unauthorized", req.url));
  }

  if (isParentRoute(req) && !["platform_owner", "principal", "parent"].includes(userRole || "")) {
    return Response.redirect(new URL("/unauthorized", req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
