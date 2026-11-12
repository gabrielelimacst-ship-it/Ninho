-- Dados do relogio (Mi Fitness -> app Saude -> Atalhos -> Ninho). Rodar uma vez no SQL Editor.

-- 1) Um registro por pessoa por dia
create table public.relogio (
  user_id uuid not null references auth.users(id) on delete cascade,
  dia date not null,
  passos integer,
  sono_min integer,
  bpm_medio integer,
  bpm_repouso integer,
  atualizado_em timestamptz not null default now(),
  primary key (user_id, dia)
);
alter table public.relogio enable row level security;
grant select, delete on public.relogio to authenticated;
create policy "cada um le o seu relogio" on public.relogio
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "cada um apaga o seu relogio" on public.relogio
  for delete to authenticated using ((select auth.uid()) = user_id);

-- 2) Chave pessoal do atalho (guardamos so a impressao digital da chave)
create table public.relogio_chaves (
  chave_hash text primary key,
  user_id uuid not null unique default auth.uid() references auth.users(id) on delete cascade,
  criado_em timestamptz not null default now()
);
alter table public.relogio_chaves enable row level security;
grant select, insert, delete on public.relogio_chaves to authenticated;
create policy "cada um ve a sua chave" on public.relogio_chaves
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "cada um cria a sua chave" on public.relogio_chaves
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "cada um apaga a sua chave" on public.relogio_chaves
  for delete to authenticated using ((select auth.uid()) = user_id);
