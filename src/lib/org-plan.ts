import { OrganizationPlan } from "@prisma/client";

/**
 * Organization.plan:
 *   STANDARD — empresa B2B (sem programa Partner)
 *   PARTNER  — condição comercial adicional (TBD activation)
 *
 * Business onboarding never grants PARTNER. It also does not downgrade
 * an Organization that is already PARTNER.
 */
export function planAfterBusinessOnboarding(
  existingPlan: OrganizationPlan | null | undefined
): OrganizationPlan {
  if (existingPlan === "PARTNER") return "PARTNER";
  return "STANDARD";
}
