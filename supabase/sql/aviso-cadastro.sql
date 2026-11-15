-- Aviso de cadastro: e-mail para a dona do app a cada conta nova.
-- Rodar uma vez no SQL Editor, DEPOIS de instalar a funcao "aviso-cadastro".

-- 1) Lista de quem ja foi avisado (so a funcao, com a chave de servidor, mexe aqui)
create table if not exists public.cadastros_avisados (
  user_id uuid primary key,
  avisado_em timestamptz not null default now()
);
alter table public.cadastros_avisados enable row level security;
grant select, insert on public.cadastros_avisados to service_role;

-- 2) A cada conta nova, chama a funcao (ela confere sozinha quem e novo)
create extension if not exists pg_net;
create or replace function public.avisar_cadastro() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform net.http_post(
    url := 'https://nsjissvwnhaoyaqinzqp.supabase.co/functions/v1/aviso-cadastro',
    body := '{}'::jsonb,
    headers := '{"Content-Type":"application/json"}'::jsonb
  );
  return new;
end $$;

drop trigger if exists ninho_aviso_cadastro on auth.users;
create trigger ninho_aviso_cadastro after insert on auth.users
  for each row execute function public.avisar_cadastro();

-- 3) Primeira vez: manda agora UM e-mail com todos os cadastros que ja existem
select net.http_post(
  url := 'https://nsjissvwnhaoyaqinzqp.supabase.co/functions/v1/aviso-cadastro',
  body := '{}'::jsonb,
  headers := '{"Content-Type":"application/json"}'::jsonb
);
