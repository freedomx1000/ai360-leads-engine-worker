import { supabase } from "../db";

function nowIso() {
  return new Date().toISOString();
}

function canonicalize(url: string) {
  try {
    const u = new URL(url.trim());
    u.hash = "";
    if (u.pathname.endsWith("/")) u.pathname = u.pathname.slice(0, -1);
    return u.toString();
  } catch {
    return url.trim();
  }
}

function scoreHeuristic(raw: string, sourceType: string) {
  const text = (raw ?? "").toLowerCase();

  let s = 10;
  if (sourceType === "linkedin") s += 25;
  if (sourceType === "marketplace") s += 20;
  if (sourceType === "forum") s += 12;
  if (sourceType === "blog") s += 8;

  if (text.includes("busco") || text.includes("looking for")) s += 15;
  if (text.includes("recomiendan") || text.includes("recommend")) s += 10;
  if (text.includes("precio") || text.includes("budget")) s += 8;
  if (text.includes("urgente") || text.includes("asap")) s += 10;

  return Math.max(0, Math.min(100, s));
}

function interestLevel(score: number) {
  if (score >= 70) return "hot";
  if (score >= 40) return "warm";
  return "cold";
}

export async function processLeadJob(job: any) {
  const {
    id: jobId,
    org_id,
    source_type,
    source_url,
    canonical_url,
    raw_text,
    vertical,
    lead_type,
    priority,
  } = job;

  const canon = canonical_url ?? canonicalize(source_url);

  if (!canonical_url && canon) {
    await supabase.from("leads_jobs").update({ canonical_url: canon, updated_at: nowIso() }).eq("id", jobId);
  }

  const score = scoreHeuristic(raw_text ?? "", source_type ?? "other");
  const level = interestLevel(score);

  const { data: existing } = await supabase
    .from("crm_leads")
    .select("id, score, last_activity_at")
    .eq("org_id", org_id)
    .eq("canonical_url", canon)
    .maybeSingle();

  if (existing?.id) {
    await supabase
      .from("crm_leads")
      .update({
        score: Math.max(existing.score ?? 0, score),
        interest_level: level,
        last_activity_at: nowIso(),
        source_type: source_type ?? "other",
        source: source_url,
        updated_at: nowIso(),
      })
      .eq("id", existing.id);

    await supabase.from("leads_jobs").update({ lead_id: existing.id, updated_at: nowIso() }).eq("id", jobId);
  } else {
    const { data: created, error: createErr } = await supabase
      .from("crm_leads")
      .insert({
        org_id,
        name: null,
        email: null,
        phone: null,
        company: null,
        stage: "new",
        score,
        source: source_url,
        canonical_url: canon,
        source_type: source_type ?? "other",
        notes: raw_text ? raw_text.slice(0, 1500) : null,
        last_activity_at: nowIso(),
        created_at: nowIso(),
        updated_at: nowIso(),
        lead_type: lead_type ?? "company",
        vertical: vertical ?? null,
        problem_summary: raw_text ? raw_text.slice(0, 280) : null,
        interest_level: level,
        intent_viewed: false,
        lead_path_human: null,
        contact_status: "new",
      })
      .select("id")
      .single();

    if (createErr) throw createErr;

    await supabase.from("leads_jobs").update({ lead_id: created.id, updated_at: nowIso() }).eq("id", jobId);
  }

  await supabase
    .from("leads_jobs")
    .update({
      status: "done",
      updated_at: nowIso(),
      last_error: null,
    })
    .eq("id", jobId);
}
