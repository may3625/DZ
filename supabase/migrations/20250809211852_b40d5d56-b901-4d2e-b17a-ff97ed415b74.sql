-- Enable RLS on all tables and add baseline policies

-- sources
alter table public.sources enable row level security;
create policy "Sources are readable by anyone" on public.sources for select using (true);
create policy "Sources insert allowed" on public.sources for insert with check (true);
create policy "Sources update allowed" on public.sources for update using (true);
create policy "Sources delete allowed" on public.sources for delete using (true);

-- legal_texts
alter table public.legal_texts enable row level security;
create policy "Legal texts readable by anyone" on public.legal_texts for select using (true);
create policy "Legal texts insert allowed" on public.legal_texts for insert with check (true);
create policy "Legal texts update allowed" on public.legal_texts for update using (true);
create policy "Legal texts delete allowed" on public.legal_texts for delete using (true);

-- legal_text_versions
alter table public.legal_text_versions enable row level security;
create policy "Versions readable by anyone" on public.legal_text_versions for select using (true);
create policy "Versions insert allowed" on public.legal_text_versions for insert with check (true);
create policy "Versions update allowed" on public.legal_text_versions for update using (true);
create policy "Versions delete allowed" on public.legal_text_versions for delete using (true);

-- classifications
alter table public.classifications enable row level security;
create policy "Classifications readable by anyone" on public.classifications for select using (true);
create policy "Classifications insert allowed" on public.classifications for insert with check (true);
create policy "Classifications update allowed" on public.classifications for update using (true);
create policy "Classifications delete allowed" on public.classifications for delete using (true);

-- embeddings
alter table public.embeddings enable row level security;
create policy "Embeddings readable by anyone" on public.embeddings for select using (true);
create policy "Embeddings insert allowed" on public.embeddings for insert with check (true);
create policy "Embeddings update allowed" on public.embeddings for update using (true);
create policy "Embeddings delete allowed" on public.embeddings for delete using (true);

-- jobs
alter table public.jobs enable row level security;
create policy "Jobs readable by anyone" on public.jobs for select using (true);
create policy "Jobs insert allowed" on public.jobs for insert with check (true);
create policy "Jobs update allowed" on public.jobs for update using (true);
create policy "Jobs delete allowed" on public.jobs for delete using (true);

-- annotations (user-scoped)
alter table public.annotations enable row level security;
create policy "Annotations readable by owner" on public.annotations for select using (auth.uid() = user_id);
create policy "Annotations insert by owner" on public.annotations for insert with check (auth.uid() = user_id);
create policy "Annotations update by owner" on public.annotations for update using (auth.uid() = user_id);
create policy "Annotations delete by owner" on public.annotations for delete using (auth.uid() = user_id);

-- user_preferences (user-scoped)
alter table public.user_preferences enable row level security;
create policy "Preferences readable by owner" on public.user_preferences for select using (auth.uid() = user_id);
create policy "Preferences insert by owner" on public.user_preferences for insert with check (auth.uid() = user_id);
create policy "Preferences update by owner" on public.user_preferences for update using (auth.uid() = user_id);
create policy "Preferences delete by owner" on public.user_preferences for delete using (auth.uid() = user_id);

-- sectors referential
alter table public.sectors enable row level security;
create policy "Sectors readable by anyone" on public.sectors for select using (true);
create policy "Sectors insert allowed" on public.sectors for insert with check (true);
create policy "Sectors update allowed" on public.sectors for update using (true);
create policy "Sectors delete allowed" on public.sectors for delete using (true);

-- wilayas referential
alter table public.wilayas enable row level security;
create policy "Wilayas readable by anyone" on public.wilayas for select using (true);
create policy "Wilayas insert allowed" on public.wilayas for insert with check (true);
create policy "Wilayas update allowed" on public.wilayas for update using (true);
create policy "Wilayas delete allowed" on public.wilayas for delete using (true);
