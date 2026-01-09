import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/privacy",
  "/terms",
  "/contact",
  "/api/webhooks(.*)",
  "/unauthorized",
  "/setup-pending",
  "/verify(.*)", // Public ID card verification
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
const isAlumniRoute = createRouteMatcher(["/alumni(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Redirect authenticated users from home page to their dashboard
  if (req.nextUrl.pathname === "/" && userId) {
    return Response.redirect(new URL("/redirect", req.url));
  }

  // Allow public routes
  if (isPublicRoute(req)) {
    return;
  }

  // Protect all other routes - require authentication
  await auth.protect();

  // If no userId after protection, something is wrong
  if (!userId) {
    return Response.redirect(new URL("/sign-in", req.url));
  }

  // Get user from Clerk to read publicMetadata (role is stored there)
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const userRole = (user.publicMetadata as { role?: string })?.role;

  // If no role is set in Clerk metadata, redirect to setup-pending
  // Users cannot self-assign roles - they must wait for admin to assign
  if (!userRole) {
    return Response.redirect(new URL("/setup-pending", req.url));
  }

  // Role-based route protection
  if (isPlatformOwnerRoute(req) && userRole !== "platform_owner") {
    return Response.redirect(new URL("/unauthorized", req.url));
  }

  if (isPrincipalRoute(req) && !["platform_owner", "principal"].includes(userRole)) {
    return Response.redirect(new URL("/unauthorized", req.url));
  }

  if (isHodRoute(req) && !["platform_owner", "principal", "hod"].includes(userRole)) {
    return Response.redirect(new URL("/unauthorized", req.url));
  }

  if (isAdminStaffRoute(req) && !["platform_owner", "principal", "admin_staff"].includes(userRole)) {
    return Response.redirect(new URL("/unauthorized", req.url));
  }

  if (isTeacherRoute(req) && !["platform_owner", "principal", "hod", "teacher"].includes(userRole)) {
    return Response.redirect(new URL("/unauthorized", req.url));
  }

  if (isLabAssistantRoute(req) && !["platform_owner", "principal", "hod", "lab_assistant"].includes(userRole)) {
    return Response.redirect(new URL("/unauthorized", req.url));
  }

  if (isStudentRoute(req) && !["platform_owner", "principal", "hod", "teacher", "student"].includes(userRole)) {
    return Response.redirect(new URL("/unauthorized", req.url));
  }

  if (isParentRoute(req) && !["platform_owner", "principal", "parent"].includes(userRole)) {
    return Response.redirect(new URL("/unauthorized", req.url));
  }

  if (isAlumniRoute(req) && !["platform_owner", "principal", "alumni"].includes(userRole)) {
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
