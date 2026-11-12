# Ninho — próximos passos

Lista viva do que ficou combinado. Marque com `[x]` o que for concluído.
Última revisão: 12/11/2026.

## 1. Testes rápidos (só você)
- [ ] Mandar uma sugestão pelo app (Perfil → Enviar sugestão) e ver se o e-mail chega
      (a função `aviso-sugestao` e o gatilho no banco já estão no ar)
- [ ] Entrar com código por e-mail e ver se o código aparece sozinho em cima do teclado
- [ ] "Esqueci minha senha": o e-mail deve chegar de "Ninho", em português
- [ ] Vibração no iPhone (nova tentativa; precisa de iOS 18+ e Ajustes → Sons e Tátil → "Tátil do Sistema")
- [ ] Remédios com frequência: cadastrar um de dias da semana e um com dois horários
- [ ] Tom de pele dos emojis (Perfil → Interface)
- [ ] Revisão do dia na Agenda: tocar num dia passado e marcar humor, água, remédios e tarefas

## 2. Relógio Xiaomi — combinado para depois
- [x] Código pronto: função `relogio`, tabelas, chave pessoal, cartão no Diário,
      insights nas Estatísticas e aba na planilha
- [ ] **A. Dados do relógio** — seguir `docs/relogio-atalho.md`:
  - [ ] Parte 1: Mi Fitness → app Saúde
  - [ ] Parte 2: rodar `supabase/sql/relogio.sql` e instalar a função `relogio`
        (nome sem acento, conferir a 1ª linha do código, Verify JWT desligado)
  - [ ] Parte 3: gerar a chave no Ninho (Perfil → Conexões e dados → Relógio)
  - [ ] Parte 4: montar o atalho no app Atalhos
  - [ ] Parte 5: automação diária às 21h30
- [ ] **B. Lembretes do Ninho no relógio**: notificações do app instalado na Tela de Início
      (remédios — já respeitando frequência e horários —, reposição e água),
      com envio programado pelo Supabase; o relógio espelha as do iPhone
  - [ ] Junto: ícone e nome próprios na Tela de Início

## 3. Melhorias para depois
- [ ] Compromissos de hoje também na aba Tarefas
- [ ] Transformar um compromisso em tarefa
- [ ] Juntar automaticamente as duas versões quando houver conflito entre aparelhos
- [ ] (Opcional) Endereço próprio, tipo `meuninho.com.br` (~R$ 40/ano)

## Já feito ✓
- Site no GitHub Pages, contas reais com dados na nuvem (Supabase)
- Login: e-mail e senha, Google, código por e-mail; e-mails em português pelo Gmail
- Agenda: eventos do Google e da Apple; revisão do dia (itens clicáveis no dia escolhido)
- Tarefas: categorias Pet e Estudo, troca de categoria pelo emoji, cronômetro
- Recompensas com sugestão pela média (mínimo 50)
- Saúde: remédios com frequência e vários horários, exames de sangue amplos,
  menopausa só para a conta da dona
- Planilha completa (.xlsx com várias abas), link de prévia (`…/Ninho/?previa`)
- Sugestões: botão no Perfil, tabela `sugestoes` e aviso por e-mail
- Interface: frases de incentivo, selo beta, rolagem que termina antes do menu,
  tom de pele dos emojis
- Artifact "Ninho (versão do site)" atualizado; o antigo "Ninho." foi mantido

## Lembretes
- No iPhone, pelo ícone da Tela de Início, prefira **e-mail e senha** ou **código**
  (links de e-mail abrem no Safari, que é separado do ícone).
- Funções no Supabase: nome **sem acento** e conferir a primeira linha do código antes do Deploy.
- Para mudar o app: abra uma sessão do Claude Code no repositório Ninho e peça.
  Esta lista fica no repositório, então a próxima sessão também consegue lê-la.
