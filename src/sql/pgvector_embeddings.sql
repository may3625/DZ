-- Enable pgvector extension
create extension if not exists vector;

-- Embeddings table for legal_texts
create table if not exists public.embeddings (
  legal_text_id uuid primary key references public.legal_texts(id) on delete cascade,
  embedding vector(768) not null,
  model text not null default 'nomic-embed-text',
  created_at timestamptz not null default now()
);

-- Choose one index type (uncomment the preferred one). Requires ANALYZE after bulk insert.
-- IVFFLAT index (requires setting list size with ivfflat.probes at query time)
create index if not exists embeddings_embedding_ivfflat on public.embeddings using ivfflat (embedding vector_cosine_ops);

-- HNSW index (Postgres 16 + pgvector >=0.5.0)
-- create index if not exists embeddings_embedding_hnsw on public.embeddings using hnsw (embedding vector_cosine_ops);

-- Helpful composite index for FK lookups
create index if not exists embeddings_legal_text_id_idx on public.embeddings (legal_text_id);
