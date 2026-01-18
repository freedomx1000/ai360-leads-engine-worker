import { supabase } from "../supabase";

export async function processLeadJob(job: any) {
  const { id, lead_id, source_url, canonical_url } = job;

  // 1. Enriquecimiento mínimo (ahora)
  const score = 10;
  const notes = `Processed from ${canonical_url}`;

  // 2. Actualiza lead
  if (lead_id) {
    await supabase
      .from("crm_leads")
      .update({
        score,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", lead_id);
  }

  // 3. Marca job como done
  await supabase
    .from("leads_jobs")
    .update({
      status: "done",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
}
