import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
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

  // Add more role checks as needed...
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
