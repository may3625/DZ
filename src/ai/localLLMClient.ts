/* Local LLM client (configurable): stub | transformers | ollama
   Configuration (no envs in Lovable):
   - localStorage keys:
     - llm_provider = 'ollama' | 'transformers' | 'stub' (default: 'stub')
     - ollama_base_url = 'http://localhost:11434' (default)
*/

export type ChatRole = 'system' | 'user' | 'assistant';
export interface ChatMessage { role: ChatRole; content: string }

function getProvider(): 'ollama' | 'transformers' | 'stub' {
  const p = (localStorage.getItem('llm_provider') || 'stub').toLowerCase();
  if (p === 'ollama' || p === 'transformers') return p as any;
  return 'stub';
}

function getOllamaBaseUrl(): string {
  return localStorage.getItem('ollama_base_url') || 'http://localhost:11434';
}

function log(scope: string, msg: string, extra?: any) {
  // Uniform, clear logs
  console.log(`🧠 [localLLM:${scope}] ${msg}`, extra || '');
}

async function tryOllamaChat(messages: ChatMessage[]): Promise<string> {
  const base = getOllamaBaseUrl().replace(/\/$/, '');
  try {
    const res = await fetch(`${base}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.1',
        messages,
        stream: false,
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const answer: string = data?.message?.content || data?.choices?.[0]?.message?.content || '';
    return answer || 'Réponse générée.';
  } catch (e) {
    log('ollama', 'Echec appel Ollama, bascule stub', e);
    return stubChat(messages);
  }
}

function stubChat(messages: ChatMessage[]): string {
  const last = messages.filter(m => m.role === 'user').pop();
  const content = last?.content || '';
  // Minimal helpful echo with Algerian law context
  return `Contexte: droit algérien. Voici une réponse synthétique à votre demande: "${content.slice(0, 140)}"...`;
}

function detectLanguage(text: string): 'fr' | 'ar' {
  return /[\u0600-\u06FF]/.test(text) ? 'ar' : 'fr';
}

function naiveSummarize(text: string) {
  const clean = text.replace(/\s+/g, ' ').trim();
  const title = (clean.split(/[\n.]/)[0] || '').slice(0, 80) || 'Résumé automatique';
  const sentences = clean.split(/(?<=[.!؟?])/).map(s => s.trim()).filter(Boolean);
  const bullets = sentences.slice(0, 5).map(s => s.length > 200 ? s.slice(0, 200) + '…' : s);

  // very naive keywords
  const words = clean.toLowerCase().match(/[a-zàâäèéêëîïôöùûüçء-ي]{3,}/gi) || [];
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
  const keywords = Array.from(freq.entries())
    .filter(([w]) => !['les','des','dans','pour','avec','une','sur','du','est','qui','par','كما','على','من','في','إلى','عن'].includes(w))
    .sort((a,b) => b[1]-a[1])
    .slice(0, 10)
    .map(([w]) => w);

  // rough sector / wilaya tags heuristics
  const sectorMap: Record<string,string> = {
    travail: 'travail', emploi: 'travail', santé: 'sante', banque: 'banque', finance: 'finance',
    éducation: 'education', transport: 'transport', énergie: 'energie', industrie: 'industrie'
  };
  const sectors = Object.keys(sectorMap).filter(k => clean.toLowerCase().includes(k)).map(k => sectorMap[k]);
  const wilayaRegex = /\b(0?[1-9]|[1-4][0-9]|5[0-8])\b/; // 01..58
  const wilayas = (clean.match(wilayaRegex) || []).slice(0, 3);

  return { title, bullets, keywords, tags: { sectors: Array.from(new Set(sectors)), wilayas: Array.from(new Set(wilayas)) } };
}

function naiveClassify(text: string) {
  const s = naiveSummarize(text);
  return { keywords: s.keywords, domains: s.tags.sectors };
}

export const localLLMClient = {
  detectLanguage,
  async chat(messages: ChatMessage[]): Promise<string> {
    const provider = getProvider();
    log('chat', `provider=${provider}`);

    if (provider === 'ollama') return tryOllamaChat(messages);
    if (provider === 'transformers') return stubChat(messages); // placeholder local heuristic
    return stubChat(messages);
  },
  async summarize(text: string) {
    const provider = getProvider();
    log('summarize', `provider=${provider}`);

    if (provider === 'ollama') {
      // Ask Ollama to summarize via chat prompt
      const prompt: ChatMessage[] = [
        { role: 'system', content: 'Tu es un assistant qui résume des textes juridiques algériens en 5 points concis, avec mots-clés.' },
        { role: 'user', content: `Résume le texte suivant en français: ${text.slice(0, 4000)}` }
      ];
      const answer = await tryOllamaChat(prompt);
      // If response is freeform, still return naive structure
      return naiveSummarize(answer.length > 50 ? answer : text);
    }
    // transformers & stub => local heuristic
    return naiveSummarize(text);
  },
  async classify(text: string) {
    const provider = getProvider();
    log('classify', `provider=${provider}`);
    // all providers -> local heuristic for now (no external calls)
    return naiveClassify(text);
  }
};
