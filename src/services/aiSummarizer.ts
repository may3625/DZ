import { supabase } from '@/integrations/supabase/client';
import { localLLMClient } from '@/ai/localLLMClient';

export interface LegalSummary {
  title: string;
  bullets: string[];
  keywords: string[];
  tags: { sectors: string[]; wilayas: string[] };
}

export async function summarizeLegalText(text: string): Promise<LegalSummary> {
  return localLLMClient.summarize(text);
}

export async function persistSummary(legalTextId: string, summary: LegalSummary) {
  // 1) classifications: keywords + domains
  const { error: cErr } = await supabase.from('classifications').insert({
    legal_text_id: legalTextId,
    keywords: summary.keywords,
    domains: summary.tags.sectors,
  });
  if (cErr) console.error('persistSummary: insert classifications failed', cErr);

  // 2) legal_texts.metadata JSON
  const { error: lErr } = await supabase.from('legal_texts')
    .update({ metadata: summary as any })
    .eq('id', legalTextId);
  if (lErr) console.error('persistSummary: update legal_texts.metadata failed', lErr);
}

export async function processLegalText(legalTextId: string) {
  // Fetch latest version content
  const { data: version, error: vErr } = await supabase
    .from('legal_text_versions')
    .select('content_plain')
    .eq('legal_text_id', legalTextId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (vErr) {
    console.error('processLegalText: fetch version failed', vErr);
    return;
  }
  const text = version?.content_plain || '';
  if (!text) {
    console.warn('processLegalText: no content_plain found for', legalTextId);
    return;
  }

  const summary = await summarizeLegalText(text);
  await persistSummary(legalTextId, summary);
}

// Subscribe to realtime inserts on legal_texts to auto-summarize
export async function initSummarizationRealtime() {
  try {
    const channel = supabase
      .channel('ai_summarizer_rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'legal_texts' }, async (payload) => {
        const id = (payload.new as any)?.id as string;
        if (!id) return;
        console.log('🧠 [aiSummarizer] Nouveau texte détecté, lancement résumé:', id);
        try {
          await processLegalText(id);
        } catch (e) {
          console.error('aiSummarizer realtime error', e);
        }
      })
      .subscribe((status) => {
        console.log('🧠 [aiSummarizer] Realtime status:', status);
      });

    return channel;
  } catch (e) {
    console.error('initSummarizationRealtime error', e);
  }
}
