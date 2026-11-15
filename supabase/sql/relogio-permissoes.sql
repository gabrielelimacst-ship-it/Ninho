-- Relogio: deixa a funcao "relogio" (que usa a chave de servidor) ler a chave e gravar os dados.
-- Rodar uma vez no SQL Editor, se o atalho mostrar "Sem acesso ao banco".
grant select on public.relogio_chaves to service_role;
grant select, insert, update on public.relogio to service_role;
