import type { UserRole } from "@/types";

/**
 * Returns the canonical landing route for a given role.
 * Used by route guards to bounce unauthorised users back to their own dashboard.
 */
export function dashboardForRole(role?: UserRole | string | null): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "business":
      return "/business/dashboard";
    case "graduate":
      return "/graduate/dashboard";
    case "student":
      return "/student/dashboard";
    default:
      return "/student/dashboard";
  }
}

export function onboardingRouteForRole(role?: UserRole | string | null): string {
  switch (role) {
    case "business":
      return "/onboarding/business";
    case "graduate":
      return "/onboarding/graduate";
    case "student":
    default:
      return "/onboarding/student";
  }
}
