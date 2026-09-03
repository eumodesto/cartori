import { NextRequest } from "next/server";
import { postBusinessOnboarding } from "@/lib/org-onboarding";

export async function POST(req: NextRequest) {
  return postBusinessOnboarding(req);
}
