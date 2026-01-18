import { Lead } from "@shared/schema";

export async function calculateScore(lead: Lead): Promise<number> {
  let score = 0;

  // Basic validation scoring
  if (lead.email) score += 10;
  if (lead.name) score += 5;
  if (lead.company) score += 10;
  if (lead.jobTitle) score += 5;

  // Job title keywords
  const title = lead.jobTitle?.toLowerCase() || "";
  if (title.includes("manager")) score += 15;
  if (title.includes("director")) score += 20;
  if (title.includes("vp") || title.includes("vice president")) score += 25;
  if (title.includes("ceo") || title.includes("founder")) score += 30;
  if (title.includes("engineer") || title.includes("developer")) score += 10;

  // Email domain check (dummy)
  if (lead.email.endsWith("@gmail.com") || lead.email.endsWith("@yahoo.com")) {
    score -= 5; // Personal email penalty
  } else {
    score += 10; // Business email bonus
  }

  return Math.max(0, Math.min(100, score));
}
