-- =============================================================
--  KESÄBINGO – tietokannan rakenne
--  Liitä tämä Supabasen SQL Editoriin ja paina "Run".
-- =============================================================

-- Tehtävät (yhteinen ruudukko kaikille)
create table if not exists tasks (
  position int primary key,
  text text not null
);

-- Pelaajat
create table if not exists players (
  name text primary key,
  created_at timestamptz default now()
);

-- Suoritukset
create table if not exists completions (
  id uuid primary key default gen_random_uuid(),
  player_name text not null references players(name) on delete cascade,
  task_position int not null references tasks(position) on delete cascade,
  image_url text,
  caption text,
  created_at timestamptz default now(),
  unique (player_name, task_position)
);

-- ---- Käyttöoikeudet (kaverisivu: kaikki saavat lukea ja kirjoittaa) ----
alter table tasks       enable row level security;
alter table players     enable row level security;
alter table completions enable row level security;

drop policy if exists "tasks_all"       on tasks;
drop policy if exists "players_all"     on players;
drop policy if exists "completions_all" on completions;

create policy "tasks_all"       on tasks       for all using (true) with check (true);
create policy "players_all"     on players     for all using (true) with check (true);
create policy "completions_all" on completions for all using (true) with check (true);

-- ---- Storage: salli kuvien lataus ja luku "bingo"-bucketiin ----
drop policy if exists "bingo_read"   on storage.objects;
drop policy if exists "bingo_write"  on storage.objects;
drop policy if exists "bingo_delete" on storage.objects;

create policy "bingo_read"   on storage.objects for select using (bucket_id = 'bingo');
create policy "bingo_write"  on storage.objects for insert with check (bucket_id = 'bingo');
create policy "bingo_delete" on storage.objects for delete using (bucket_id = 'bingo');

-- ---- Tehtävät (voit muokata myös sivulla "Muokkaa tehtäviä") ----
insert into tasks (position, text) values
  (0,  'Treffit'),
  (1,  'Sidequest'),
  (2,  'Uus paikka'),
  (3,  'Uus laji'),
  (4,  'Karaoke (Hard Rock Hallelujah)'),
  (5,  'Hazardi juoma'),
  (6,  'Kysy joltain rändömilt haluutsä pussaa muo (sen pitää suostuu)'),
  (7,  'Rändöm jatkot'),
  (8,  'Shotgun'),
  (9,  'Saat jonku ostaa juoman sulle'),
  (10, 'Pyydä ja saa DJ soittamaan joku lasten laulu'),
  (11, 'Pölli baarista jotain'),
  (12, 'Rändöm ottaa sut reppuselkää'),
  (13, 'Yritä saada joku vaihtaa vaatteet sunkaa'),
  (14, 'Keksitty fanikuva')
on conflict (position) do nothing;
