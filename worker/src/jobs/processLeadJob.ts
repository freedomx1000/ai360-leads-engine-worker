import { supabase } from "../db";

export async function processLeadJob(job: any) {
  const { id, lead_id, canonical_url } = job;

  if (lead_id) {
    const score = 10;
    const notes = `Processed from ${canonical_url || "unknown"}`;

    const { error } = await supabase
      .from("crm_leads")
      .update({
        score,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", lead_id);

    if (error) {
      throw new Error(`Failed to update lead: ${error.message}`);
    }
  }

  const { error } = await supabase
    .from("leads_jobs")
    .update({
      status: "done",
      locked_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update job: ${error.message}`);
  }
}
