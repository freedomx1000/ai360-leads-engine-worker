import { supabase } from "../db";

function nowIso() {
  return new Date().toISOString();
}

// Validar UUID v4
function isValidUuid(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Scoring por tipo de evento
const EVENT_SCORES: Record<string, number> = {
  post_create: 8,
  pricing_view: 5,
  demo_request: 15,
  thread_view: 3,
  return_visit: 6,
  bounce: -2,
};

export async function processLeadJob(job: any) {
  const jobId = job.id;
  
  console.log(`[leads-worker] process_lead start job_id=${jobId}`);

  // A. Extraer lead_id
  const leadId = job.payload?.lead_id;
  if (!leadId || typeof leadId !== 'string') {
    throw new Error('Missing/invalid lead_id');
  }
  if (!isValidUuid(leadId)) {
    throw new Error('Missing/invalid lead_id');
  }

  console.log(`[leads-worker] process_lead lead_id=${leadId}`);

  // B. Leer lead
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('id, org_id')
    .eq('id', leadId)
    .single();

  if (leadError || !lead) {
    throw new Error('Lead not found');
  }

  // C. Leer eventos (últimos 14 días)
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('event_type, created_at')
    .eq('org_id', lead.org_id)
    .eq('lead_id', leadId)
    .gte('created_at', fourteenDaysAgo.toISOString())
    .limit(500);

  if (eventsError) {
    throw new Error(`Failed to load events: ${eventsError.message}`);
  }

  // D. Calcular score
  let score = 0;
  let reason = '';
  const eventCounts: Record<string, number> = {};

  if (!events || events.length === 0) {
    score = 0;
    reason = 'no_recent_events';
  } else {
    // Contar eventos y calcular score
    for (const event of events) {
      const eventType = event.event_type;
      const points = EVENT_SCORES[eventType] || 0;
      score += points;
      eventCounts[eventType] = (eventCounts[eventType] || 0) + 1;
    }

    // Cap del score (0 a 120)
    score = Math.max(0, Math.min(120, score));

    // Encontrar evento top (más frecuente)
    let topEvent = 'unknown';
    let topCount = 0;
    for (const [eventType, count] of Object.entries(eventCounts)) {
      if (count > topCount) {
        topEvent = eventType;
        topCount = count;
      }
    }

    reason = `score=${score} events=${events.length} top=${topEvent}`;
  }

  console.log(`[leads-worker] process_lead score=${score} events=${events?.length || 0}`);

  // E. Upsert lead_scores
  const { error: upsertError } = await supabase
    .from('lead_scores')
    .upsert({
      lead_id: leadId,
      org_id: lead.org_id,
      score: score,
      reason: reason,
      updated_at: nowIso(),
    }, {
      onConflict: 'lead_id',
    });

  if (upsertError) {
    throw new Error(`Failed to upsert lead_scores: ${upsertError.message}`);
  }

  console.log(`[leads-worker] process_lead done job_id=${jobId}`);
}
