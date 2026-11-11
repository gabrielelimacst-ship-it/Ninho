# Ninho.

App pessoal de organização (tarefas, humor, hábitos, calendário), criado no Claude.

## Como está hospedado

O app é um único arquivo, `index.html`, publicado pelo **GitHub Pages**.
A cada alteração enviada para a branch `main`, o workflow
`.github/workflows/pages.yml` publica a nova versão automaticamente.

Endereço: `https://<seu-usuario>.github.io/ninho/`

## Onde ficam os dados

Os dados ficam no **Supabase** (projeto `nsjissvwnhaoyaqinzqp`), na tabela `ninhos`:
uma linha por pessoa, protegida por RLS — cada conta só lê e grava o próprio ninho.

- O app também guarda uma cópia no aparelho, então funciona sem internet e envia
  as mudanças quando a conexão volta.
- Se o mesmo ninho for alterado em dois aparelhos ao mesmo tempo, vale a última alteração enviada.
- Ao sair da conta, a cópia do aparelho é apagada.

## Login

- Na tela: e-mail + senha e "Esqueci minha senha".
- Link mágico por e-mail: pronto no código, mas sem botão na tela por enquanto.
- Google: o botão aparece sozinho quando o provedor Google está ligado no Supabase
  (o app consulta `/auth/v1/settings` ao abrir).

`supabase.js` é a biblioteca oficial `@supabase/supabase-js` (build UMD), guardada no
repositório para o app não depender de CDN.

A chave `sb_publishable_...` no código é pública por natureza; a segurança vem das
regras RLS da tabela.

## Prévia no Claude (artifact)

O artifact "Ninho (versão do site)" é uma cópia do `index.html` com
`window.NINHO_PREVIEW=1`: abre sem login e guarda os dados só naquele navegador,
porque artifacts não podem se conectar ao Supabase. Downloads (planilha, .ics) não
funcionam ali. O original continua sendo este repositório.
