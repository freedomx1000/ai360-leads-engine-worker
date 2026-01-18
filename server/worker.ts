import { storage } from "./storage";
import { calculateScore } from "./services/scoring";
import { enrichLead } from "./services/enrichment";

export async function processLeadJob(leadId: number) {
  console.log(`Starting processing for lead ${leadId}...`);
  
  try {
    // 1. Fetch Lead
    const lead = await storage.getLead(leadId);
    if (!lead) {
      throw new Error(`Lead ${leadId} not found`);
    }

    // Update status to processing
    await storage.updateLead(leadId, { status: "processing" });

    // 2. Enrich Data
    console.log(`Enriching lead ${leadId}...`);
    const enrichedData = await enrichLead(lead);
    
    // 3. Score Lead (using enriched data if we wanted, but for now just base fields)
    console.log(`Scoring lead ${leadId}...`);
    // We update the lead object in memory to pass to scorer if it needed enriched data
    const leadWithEnrichment = { ...lead, enrichedData };
    const score = await calculateScore(leadWithEnrichment);

    // 4. Update Lead
    await storage.updateLead(leadId, {
      status: "completed",
      score,
      enrichedData,
      processedAt: new Date(),
    });

    console.log(`Lead ${leadId} processed successfully. Score: ${score}`);
    return { success: true, score };

  } catch (error) {
    console.error(`Error processing lead ${leadId}:`, error);
    await storage.updateLead(leadId, { status: "failed" });
    return { success: false, error };
  }
}
