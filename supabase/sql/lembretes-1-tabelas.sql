-- Lembretes do Ninho, parte 1: tabelas (rodar uma vez no SQL Editor)

-- Aparelhos que ativaram os lembretes
create table public.lembretes_inscricoes (
  endpoint text primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  p256dh text not null,
  auth text not null,
  criado_em timestamptz not null default now()
);
alter table public.lembretes_inscricoes enable row level security;
grant select, insert, update, delete on public.lembretes_inscricoes to authenticated;
create policy "cada um ve os seus aparelhos" on public.lembretes_inscricoes
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "cada um cadastra os seus aparelhos" on public.lembretes_inscricoes
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "cada um atualiza os seus aparelhos" on public.lembretes_inscricoes
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "cada um apaga os seus aparelhos" on public.lembretes_inscricoes
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Proximos lembretes de cada pessoa (o app recalcula sempre que algo muda)
create table public.lembretes_agenda (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  itens jsonb not null default '[]'::jsonb,
  atualizado_em timestamptz not null default now()
);
alter table public.lembretes_agenda enable row level security;
grant select, insert, update, delete on public.lembretes_agenda to authenticated;
create policy "cada um ve a sua agenda" on public.lembretes_agenda
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "cada um cria a sua agenda" on public.lembretes_agenda
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "cada um atualiza a sua agenda" on public.lembretes_agenda
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "cada um apaga a sua agenda" on public.lembretes_agenda
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Controle interno do despertador (ninguem de fora le)
create table public.lembretes_estado (id int primary key, ultimo timestamptz not null);
alter table public.lembretes_estado enable row level security;
insert into public.lembretes_estado values (1, now());
