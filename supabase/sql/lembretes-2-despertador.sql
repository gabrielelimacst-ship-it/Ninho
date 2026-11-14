-- Lembretes do Ninho, parte 2: despertador a cada 5 minutos (rodar uma vez no SQL Editor)
-- Troque SEGREDO_AQUI pelo mesmo valor do segredo LEMBRETES_SEGREDO da funcao "lembretes".
create extension if not exists pg_cron;
create extension if not exists pg_net;

create or replace function public.enviar_lembretes()
returns void language plpgsql security definer set search_path = public as $$
declare ult timestamptz; agora timestamptz := now(); envios jsonb;
begin
  select ultimo into ult from public.lembretes_estado where id = 1;
  update public.lembretes_estado set ultimo = agora where id = 1;
  select coalesce(jsonb_agg(jsonb_build_object(
           'endpoint', s.endpoint, 'p256dh', s.p256dh, 'auth', s.auth,
           'titulo', 'Ninho', 'corpo', i->>'txt', 'tag', i->>'tag')), '[]'::jsonb)
    into envios
    from public.lembretes_agenda a
    cross join lateral jsonb_array_elements(a.itens) i
    join public.lembretes_inscricoes s on s.user_id = a.user_id
   where (i->>'at')::timestamptz > ult and (i->>'at')::timestamptz <= agora;
  if jsonb_array_length(envios) > 0 then
    perform net.http_post(
      url := 'https://nsjissvwnhaoyaqinzqp.supabase.co/functions/v1/lembretes',
      body := jsonb_build_object('segredo', 'SEGREDO_AQUI', 'envios', envios),
      headers := '{"Content-Type":"application/json"}'::jsonb);
  end if;
end $$;
revoke all on function public.enviar_lembretes() from public, anon, authenticated;

select cron.schedule('ninho-lembretes', '*/5 * * * *', 'select public.enviar_lembretes()');
