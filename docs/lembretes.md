# Lembretes do Ninho: passo a passo

## Você (dev), uma vez só — uns 15 minutos, pelo computador
1. **SQL Editor → New query**: cole `supabase/sql/lembretes-1-tabelas.sql` → **Run**.
2. **Edge Functions → Secrets → Add new secret**: crie `VAPID_PRIVADA` e `LEMBRETES_SEGREDO`
   com os valores do arquivo de segredos que o Claude te entregou (nunca no GitHub).
3. **Edge Functions → Deploy a new function → Via Editor**
   - nome: **`lembretes`** (sem acento)
   - cole `supabase/functions/lembretes/index.ts` → confira a 1ª linha (`... - versao 1`) → **Deploy**
   - **desligue o Verify JWT**
4. **SQL Editor → New query**: cole o arquivo **`lembretes-2-despertador-PRONTO.sql`** que o Claude te
   entregou (é o `supabase/sql/lembretes-2-despertador.sql` com o segredo já preenchido) → **Run**.
   Se reclamar de `pg_cron`/`pg_net`: **Database → Extensions**, ative as duas e rode de novo.

## Quem usa o app
1. Ter o Ninho **na Tela de Início** (Safari → Compartilhar → Adicionar à Tela de Início).
2. Abrir o Ninho **pelo ícone** → **Perfil → 🔔 Lembretes → Ativar lembretes** → **Permitir**.
3. Escolher o que quer receber: remédios, reposição (se tiver) e água.
4. **Mandar um teste** para conferir.

Os avisos seguem os horários e a frequência de cada remédio. O app prepara os avisos das próximas
2 semanas toda vez que é aberto ou alterado; se ficar mais de 2 semanas sem abrir, os avisos param
até a próxima abertura. Podem chegar com até 5 minutos de diferença.
