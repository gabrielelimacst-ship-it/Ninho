# Ninho.

App pessoal de organização (tarefas, humor, hábitos, calendário), criado no Claude.

## Como está hospedado

O app é um único arquivo, `index.html`, publicado pelo **GitHub Pages**.
A cada alteração enviada para a branch `main`, o workflow
`.github/workflows/pages.yml` publica a nova versão automaticamente.

Endereço: `https://<seu-usuario>.github.io/ninho/`

## Onde ficam os dados

Tudo fica salvo **no navegador** de quem usa (localStorage). Isso significa:

- cada celular/computador tem o seu próprio ninho — não sincroniza entre aparelhos;
- limpar os dados do navegador apaga o ninho;
- o login é local, serve para separar perfis no mesmo aparelho, não é uma senha protegida em servidor.
