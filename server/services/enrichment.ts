import { Lead } from "@shared/schema";

export async function enrichLead(lead: Lead): Promise<Record<string, any>> {
  // Simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 500));

  const enrichedData: Record<string, any> = {
    enrichedAt: new Date().toISOString(),
    source: "MockEnrichmentAPI",
  };

  // Mock enrichment based on company
  if (lead.company) {
    enrichedData.domain = `www.${lead.company.toLowerCase().replace(/\s+/g, "")}.com`;
    enrichedData.industry = "Technology";
    enrichedData.employees = "100-500";
    enrichedData.location = "San Francisco, CA";
  }

  // Mock enrichment based on email
  if (lead.email) {
    enrichedData.isValidEmail = true;
    enrichedData.smtpCheck = "passed";
  }

  return enrichedData;
}
