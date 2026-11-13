-- Art Compare: one table in its own schema.
-- Run this in the Supabase SQL editor, then add "art_compare" to
-- Project Settings -> API -> Exposed schemas.
--
-- There are no accounts: anyone holding the project's anon key can read and
-- write rows in this one table. That is fine for a throwaway app; do not
-- store anything sensitive here.

create schema if not exists art_compare;

create table if not exists art_compare.participants (
  id uuid primary key,
  room_code text not null,
  name text not null,
  ratings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists participants_room_code_idx
  on art_compare.participants (room_code);

grant usage on schema art_compare to anon, authenticated;
grant select, insert, update on art_compare.participants to anon, authenticated;

alter table art_compare.participants enable row level security;

create policy "anyone can read" on art_compare.participants
  for select to anon, authenticated using (true);
create policy "anyone can join" on art_compare.participants
  for insert to anon, authenticated with check (true);
create policy "anyone can update" on art_compare.participants
  for update to anon, authenticated using (true) with check (true);
