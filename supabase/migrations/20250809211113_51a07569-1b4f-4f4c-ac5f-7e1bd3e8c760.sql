-- Enable required extensions
create extension if not exists pgcrypto;
create extension if not exists vector;

-- Create enum for source type
do $$ begin
  if not exists (select 1 from pg_type where typname = 'source_type') then
    create type public.source_type as enum ('JO','MINISTRY','WILAYA','OTHER');
  end if;
end $$;

-- sources table
create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type public.source_type not null,
  url text,
  schedule_cron text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- legal_texts table
create table if not exists public.legal_texts (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.sources(id) on delete set null,
  title text,
  date date,
  wilaya_code text,
  sector text,
  language text,
  url text,
  hash text unique,
  status text,
  created_at timestamptz not null default now()
);

-- legal_text_versions table
create table if not exists public.legal_text_versions (
  id uuid primary key default gen_random_uuid(),
  legal_text_id uuid not null references public.legal_texts(id) on delete cascade,
  version_no int not null,
  content_md text,
  content_plain text,
  file_path text,
  created_at timestamptz not null default now(),
  unique (legal_text_id, version_no)
);

-- classifications table
create table if not exists public.classifications (
  id uuid primary key default gen_random_uuid(),
  legal_text_id uuid not null references public.legal_texts(id) on delete cascade,
  domains text[] not null default '{}',
  keywords text[] not null default '{}',
  contradiction_group_id uuid
);

-- embeddings table (pgvector)
create table if not exists public.embeddings (
  id uuid primary key default gen_random_uuid(),
  legal_text_id uuid not null references public.legal_texts(id) on delete cascade,
  embedding vector(1536),
  model text,
  created_at timestamptz not null default now(),
  unique (legal_text_id, model)
);

-- jobs table
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  source_id uuid references public.sources(id) on delete set null,
  status text not null default 'pending',
  started_at timestamptz,
  finished_at timestamptz,
  log text,
  created_at timestamptz not null default now()
);

-- annotations table
create table if not exists public.annotations (
  id uuid primary key default gen_random_uuid(),
  legal_text_id uuid not null references public.legal_texts(id) on delete cascade,
  user_id uuid not null,
  range jsonb,
  note text,
  visibility text default 'private',
  created_at timestamptz not null default now()
);

-- user_preferences table
create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  sectors text[] not null default '{}',
  wilayas text[] not null default '{}',
  keywords text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- sectors referential
create table if not exists public.sectors (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  name text not null
);

-- wilayas referential
create table if not exists public.wilayas (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  name text not null
);
