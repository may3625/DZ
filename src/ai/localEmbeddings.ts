// import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js for browser usage
// env.allowLocalModels = false; // always fetch from CDN cache
// env.useBrowserCache = true;

export type EmbeddingBackend = 'ollama' | 'transformers' | 'bow';

export interface EmbeddingResult {
  vector: number[];
  model: string;
  backend: EmbeddingBackend;
}

// Simple BoW-hash embedding as last-resort fallback
function bowEmbedding(text: string, dim = 256): number[] {
  const vec = new Float32Array(dim);
  const tokens = (text || '').toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  for (const t of tokens) {
    let hash = 2166136261;
    for (let i = 0; i < t.length; i++) hash = (hash ^ t.charCodeAt(i)) * 16777619;
    const idx = Math.abs(hash) % dim;
    vec[idx] += 1;
  }
  // L2 normalize
  let norm = 0;
  for (let i = 0; i < dim; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < dim; i++) vec[i] /= norm;
  return Array.from(vec);
}

async function tryOllamaEmbedding(text: string, modelCandidates = ['nomic-embed-text', 'bge-m3']): Promise<EmbeddingResult | null> {
  try {
    const base = 'http://localhost:11434';
    const ping = await fetch(base + '/api/tags').then(r => r.ok ? r.json() : null).catch(() => null);
    if (!ping) return null;

    for (const m of modelCandidates) {
      try {
        const res = await fetch(base + '/api/embeddings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: m, prompt: text })
        });
        if (!res.ok) continue;
        const data = await res.json();
        if (data?.embedding && Array.isArray(data.embedding)) {
          return { vector: data.embedding as number[], model: m, backend: 'ollama' };
        }
      } catch { continue; }
    }
    return null;
  } catch {
    return null;
  }
}

async function tryTransformersEmbedding(text: string): Promise<EmbeddingResult | null> {
  try {
    // Temporarily disabled - @huggingface/transformers causing Vite issues
    return null;
  } catch {
    return null;
  }
}

export async function getLocalEmbedding(text: string): Promise<EmbeddingResult> {
  // 1) Ollama (if available)
  const viaOllama = await tryOllamaEmbedding(text);
  if (viaOllama) return viaOllama;

  // 2) Transformers.js (WebGPU if available)
  const viaTf = await tryTransformersEmbedding(text);
  if (viaTf) return viaTf;

  // 3) Fallback BoW
  return { vector: bowEmbedding(text), model: 'bow-256', backend: 'bow' };
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < n; i++) {
    const ai = a[i] || 0;
    const bi = b[i] || 0;
    dot += ai * bi;
    na += ai * ai;
    nb += bi * bi;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb) || 1;
  return dot / denom;
}
