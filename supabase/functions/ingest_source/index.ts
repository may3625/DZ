// Supabase Edge Function: ingest_source
// Public function to ingest a source and store discovered legal texts and versions
// CORS enabled, minimal HTML/PDF scraping and duplicate detection via content hash

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fallback to known project values if env vars are not set (anon key only; RLS policies must allow anon writes)
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? 'https://bsopguyucqkmjrkxaztc.supabase.co';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzb3BndXl1Y3FrbWpya3hhenRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3Njc5NDcsImV4cCI6MjA3MDM0Mzk0N30.FcuTjayYMTcH7q1lvoTo1SVqwNe_s8slmJMfrcBAehI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function toHex(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function createJob(source_id: string) {
  const { data, error } = await supabase
    .from('jobs')
    .insert({ type: 'ingest_source', source_id, status: 'running', started_at: new Date().toISOString() })
    .select('*')
    .maybeSingle();
  if (error) throw new Error(`Failed to create job: ${error.message}`);
  return data;
}

async function updateJob(job_id: string, patch: Record<string, unknown>) {
  const { error } = await supabase
    .from('jobs')
    .update(patch)
    .eq('id', job_id);
  if (error) console.error('Failed to update job:', error.message);
}

async function fetchPdfLinks(pageUrl: string): Promise<string[]> {
  const res = await fetch(pageUrl, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Failed to fetch source URL: ${res.status} ${res.statusText}`);
  const html = await res.text();
  const base = new URL(pageUrl);

  const links = new Set<string>();
  const regex = /href=["']([^"']+\.(?:pdf|PDF))["']/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    try {
      const absolute = new URL(match[1], base).toString();
      links.add(absolute);
    } catch (_) {
      // ignore bad URLs
    }
  }
  return Array.from(links);
}

async function upsertLegalTextFromPdf(pdfUrl: string) {
  const res = await fetch(pdfUrl, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Failed to fetch PDF: ${res.status} ${res.statusText}`);
  const arrayBuf = await res.arrayBuffer();
  const hashBuf = await crypto.subtle.digest('SHA-256', arrayBuf);
  const hashHex = toHex(hashBuf);

  // duplicate detection by hash
  const { data: existing, error: existErr } = await supabase
    .from('legal_texts')
    .select('id')
    .eq('hash', hashHex)
    .maybeSingle();
  if (existErr) throw new Error(`Failed to check duplicate: ${existErr.message}`);
  if (existing) {
    return { duplicated: true, legal_text_id: existing.id };
  }

  const title = (() => {
    try {
      const u = new URL(pdfUrl);
      const parts = u.pathname.split('/')
        .filter(Boolean);
      return decodeURIComponent(parts[parts.length - 1] ?? 'Document');
    } catch {
      return 'Document';
    }
  })();

  const { data: inserted, error: insertErr } = await supabase
    .from('legal_texts')
    .insert({ title, url: pdfUrl, hash: hashHex, status: 'new', created_at: new Date().toISOString() })
    .select('id')
    .maybeSingle();
  if (insertErr) throw new Error(`Failed to insert legal_text: ${insertErr.message}`);

  const { error: versionErr } = await supabase
    .from('legal_text_versions')
    .insert({ legal_text_id: inserted!.id, version_no: 1, content_md: '', content_plain: '', file_path: '' });
  if (versionErr) throw new Error(`Failed to insert legal_text_version: ${versionErr.message}`);

  return { duplicated: false, legal_text_id: inserted!.id };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const { source_id } = await req.json();
    if (!source_id) {
      return new Response(JSON.stringify({ error: 'source_id is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const job = await createJob(source_id);

    const { data: source, error: srcErr } = await supabase
      .from('sources')
      .select('*')
      .eq('id', source_id)
      .maybeSingle();
    if (srcErr) throw new Error(`Failed to load source: ${srcErr.message}`);
    if (!source) {
      await updateJob(job.id, { status: 'failed', finished_at: new Date().toISOString(), log: 'Source not found' });
      return new Response(JSON.stringify({ error: 'Source not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Fetch page and extract PDFs (limit to first 10 for safety)
    const links = await fetchPdfLinks(source.url || '');
    const limited = links.slice(0, 10);

    let inserted = 0;
    let duplicated = 0;
    for (const link of limited) {
      try {
        const res = await upsertLegalTextFromPdf(link);
        if (res.duplicated) duplicated++;
        else inserted++;
      } catch (e) {
        console.warn('Failed to process link', link, e);
      }
    }

    const log = JSON.stringify({ total: links.length, processed: limited.length, inserted, duplicated });
    await updateJob(job.id, { status: 'completed', finished_at: new Date().toISOString(), log });

    return new Response(JSON.stringify({ success: true, inserted, duplicated, total: links.length }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('ingest_source error', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unexpected error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});