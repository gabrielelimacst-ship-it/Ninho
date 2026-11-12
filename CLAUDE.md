# Ninho

## Visão geral do código

O Ninho é um organizador pessoal em português (tarefas, saúde, agenda, diário, estatísticas), pensado para TDAH e menopausa. O app inteiro está em um único `index.html` estático, sem build. Os dados são sincronizados com o Supabase (tabela `ninhos`, uma linha por usuária, protegida por RLS) e o site é publicado no GitHub Pages a cada push em `main`.

**Stack:** HTML/CSS/JS puro, `supabase.js` vendorizado, Supabase (Auth, Postgres, Edge Function Deno `agenda`) e GitHub Pages.
**Estrutura:** `index.html` (app), `supabase/functions/agenda/` (leitor de calendários iCal), `emails/` (modelos de e-mail do Auth), `PROXIMOS-PASSOS.md` (checklist vivo).

Para a arquitetura detalhada, veja [docs/CODEBASE_MAP.md](docs/CODEBASE_MAP.md). Para atualizar o mapa, use a skill `/cartographer`.

## Cuidados ao editar

- A linha ~650 do `index.html` tem ~294 KB de SVG de avatares. Nunca imprima a linha nem a reescreva inteira.
- O CSS é feito de camadas de sobrescrita: edite o último bloco que define a propriedade.
- As funções precisam continuar globais, porque os `onclick` são inline.
- Não coloque segredos no repositório: o Pages publica a raiz inteira.
