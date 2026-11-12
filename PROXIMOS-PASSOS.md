# Ninho — próximos passos

Lista viva do que ficou combinado. Marque com `[x]` o que for concluído.

## 1. Pendências agora (rápidas, só você)
- [x] Fazer o merge do PR #3 (tela de login menor + mensagem de erro melhor)
- [x] Supabase → Authentication → URL Configuration: trocar o **Site URL** para
      `https://gabrielelimacst-ship-it.github.io/Ninho/` e adicionar o mesmo em **Redirect URLs**
- [x] Entrar no app com e-mail e senha (a conta já deve estar confirmada)
- [x] Conectar as agendas
- [x] Testar: entrar com Google (mesmo Gmail) e ver se abre o mesmo ninho
- [ ] Testar a vibração no iPhone de novo (nova tentativa; precisa de iOS 18+ e "Tátil do Sistema" ligado)
- [x] Testar a sincronização
- [x] Testar as novidades do PR #7
- [x] Decidir: qualquer pessoa pode criar conta (decidido: aberto)
      (Authentication → Sign In / Providers → "Allow new users to sign up")

## 2. E-mails com cara de Ninho
- [x] Ligar e-mail próprio (SMTP) com o Gmail + "senha de app" do Google
  - remetente passa a ser "Ninho" em vez de "Supabase Auth"
  - acaba o limite de 2 e-mails por hora
  - libera a edição dos modelos de e-mail
- [x] Personalizar os e-mails em português: confirmação de conta, recuperar senha, convite (modelos em `emails/`)
- [ ] Testar: "Esqueci minha senha" deve chegar de "Ninho", em português

## 3. Login
- [x] Login com Google
- [x] Entrar sem senha com código por e-mail (autopreenche no celular)
- [ ] Colar o modelo `emails/codigo.html` em Magic Link e atualizar o Confirm signup

## 4. Relógio Xiaomi (Mi Fitness) — combinado para outro momento
- [x] **A. Dados do relógio no Ninho** (sono, passos, batimentos): código pronto
  - [ ] Seguir `docs/relogio-atalho.md`: Mi Fitness → Saúde, SQL, função `relogio`,
        chave no Ninho, atalho e automação diária
- [ ] **B. Lembretes do Ninho no relógio**: notificações do app (instalado na Tela
      de Início) com envio programado pelo Supabase; o relógio espelha as do iPhone
  - [ ] Começar por remédios, reposição hormonal e água

## 5. Sugestões para depois
- [ ] Ícone e nome próprios ao adicionar à Tela de Início do celular
- [ ] Endereço próprio (ex.: `meuninho.com.br`) — opcional, ~R$ 40/ano
- [x] Avisar quando o mesmo ninho for mudado em dois aparelhos ao mesmo tempo
- [ ] (Melhoria) Juntar automaticamente as duas versões em vez de escolher uma
- [x] Seção "Conexões e dados" (planilha, Apple Calendário, Google Agenda, Google)
- [x] Ver eventos do Google Agenda e do Apple Calendário na aba Agenda (só leitura)
- [x] Instalar o mensageiro `agenda` no Supabase (Edge Functions)
- [ ] (Depois) Mostrar compromissos de hoje também na aba Tarefas
- [ ] (Depois) Transformar um compromisso em tarefa
- [x] Artifact "Ninho (versão do site)" em modo prévia (sem login, dados só no navegador)
- [x] Link de prévia para mostrar o app sem login: `…/Ninho/?previa`
- [x] Botão "Enviar sugestão" no Perfil (vai para a tabela `sugestoes`)
- [x] Rodar `supabase/sql/sugestoes.sql` no SQL Editor
- [ ] Aviso por e-mail a cada sugestão: segredos do Gmail, função `aviso-sugestao` e webhook
- [x] Recompensas de exemplo com 150, 100 e 50
- [x] Manter o artifact antigo "Ninho."
- [x] Atualizar o artifact "Ninho (versão do site)"

## Lembretes
- No iPhone, pelo ícone da Tela de Início, entre com **e-mail e senha**
  (links de e-mail abrem no Safari, que é separado do ícone).
- Para mudar o app: abra uma sessão do Claude Code no repositório Ninho e peça.
  Esta lista fica no repositório, então a próxima sessão também consegue lê-la.
