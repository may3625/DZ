-- Example server-side semantic search using pgvector cosine distance
-- Assumes you already computed :query_embedding as a float4[] or vector
-- Replace `:query_embedding` by a bound parameter from your client

-- Using cosine distance (lower is better)
select lt.id,
       lt.title,
       1 - (e.embedding <=> :query_embedding) as similarity,
       lt.category,
       lt.updated_at,
       lt.created_at
from public.embeddings e
join public.legal_texts lt on lt.id = e.legal_text_id
-- Optional filters
-- where lt.category = 'some-category'
order by e.embedding <=> :query_embedding
limit 50;