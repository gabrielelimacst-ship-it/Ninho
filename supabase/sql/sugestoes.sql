-- Caixa de sugestões do Ninho (rodar uma vez no SQL Editor do Supabase)
create table public.sugestoes (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  email text,
  tipo text,
  texto text not null,
  versao text,
  criado_em timestamptz not null default now()
);
alter table public.sugestoes enable row level security;
grant insert on public.sugestoes to authenticated;
create policy "cada um envia as suas" on public.sugestoes
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
-- Só quem tem acesso ao painel do Supabase consegue ler (Table Editor > sugestoes).
