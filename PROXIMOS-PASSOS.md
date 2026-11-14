# Ninho — próximos passos

Lista viva do que ficou combinado. Marque com `[x]` o que for concluído.
Última revisão: 12/11/2026.

## 1. Testes rápidos (só você)
- [x] Mandar uma sugestão pelo app e ver se o e-mail chega (funcionou em 12/11)
- [ ] Entrar com código por e-mail e ver se o código aparece sozinho em cima do teclado
- [ ] "Esqueci minha senha": o e-mail deve chegar de "Ninho", em português
- [ ] Vibração no iPhone (nova tentativa; precisa de iOS 18+ e Ajustes → Sons e Tátil → "Tátil do Sistema")
- [x] Remédios com frequência: cadastrar um de dias da semana e um com dois horários
- [x] Tom de pele dos emojis (Perfil → Interface)
- [x] Revisão do dia na Agenda: tocar num dia passado e marcar humor, água, remédios e tarefas
- [x] Diário: faixa dos 7 dias no topo para rever e corrigir humor, sensações, eventos e notas
- [x] Saúde: a mesma faixa dos 7 dias, para corrigir água, refeições, remédios, exercício e sintomas
- [x] Emojis de pessoas: escolher o gênero (Perfil → Interface)
- [x] Há quantos dias e libido (testado em 13/11)

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
- [ ] Resumo do dia para stories: retirado em 13/11; se voltar, decidir o humor (A emoji grande, B pílula, C itálico)
- [x] Agenda: tarefas separadas por período (MANHÃ ———)
- [x] Lista de desejos com link (Perfil → Lista de desejos)
- [x] Conectar desejos às recompensas (escolher um desejo ao criar a recompensa, ou "Outro")
- [ ] Área de leitura, filmes e games (o que quero ver/ler/jogar e o que já terminei)
- [x] Layout novo do e-mail de sugestão
- [ ] Atualizar o código da função `aviso-sugestao` no Supabase para a versão 4
- [ ] Sugestões chegarem no WhatsApp Business
      (caminhos: API oficial do WhatsApp Business, que exige conta Meta e modelo de mensagem
      aprovado; ou um serviço intermediário; decidir quando formos fazer)
- [ ] **Perfis integrados (2 pessoas)**: casais ou famílias verem tarefas conjuntas.
      É possível. Ideia a amadurecer: um "ninho compartilhado" com convite por e-mail,
      tarefas marcadas como "da casa/família" visíveis para os dois, e o resto
      (saúde, diário, humor) continua privado de cada pessoa. Exige mudar o banco:
      hoje cada conta tem um bloco só dela; as tarefas conjuntas precisariam de uma
      tabela própria com regra de acesso para os dois
- [x] Compromissos de hoje na aba Tarefas (opção em Perfil → Interface)
- [ ] Transformar um compromisso em tarefa (tocar no compromisso e criar uma tarefa a partir dele)
- [x] Juntar automaticamente as versões quando houver conflito entre aparelhos
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
