# Ninho — próximos passos

Lista viva do que ficou combinado. Marque com `[x]` o que for concluído.

## 1. Pendências agora (rápidas, só você)
- [x] Fazer o merge do PR #3 (tela de login menor + mensagem de erro melhor)
- [x] Supabase → Authentication → URL Configuration: trocar o **Site URL** para
      `https://gabrielelimacst-ship-it.github.io/Ninho/` e adicionar o mesmo em **Redirect URLs**
- [x] Entrar no app com e-mail e senha (a conta já deve estar confirmada)
- [ ] Fazer o merge do PR #5 (eventos do Google e da Apple na Agenda)
- [ ] Conectar as agendas: Perfil → Conexões e dados → Google Agenda / Apple Calendário
- [ ] Testar: entrar com Google (mesmo Gmail) e ver se abre o mesmo ninho
- [ ] Testar a vibração no iPhone (precisa de iOS 18 ou mais novo)
- [ ] Testar a sincronização: anotar algo no celular e conferir no computador
- [ ] Decidir: qualquer pessoa pode criar conta **ou** só convidados
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
- [ ] (Opcional) Trazer de volta o "entrar sem senha" por link no e-mail

## 4. Sugestões para depois
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
- [ ] Decidir se apaga o artifact antigo "Ninho."
- [ ] Atualizar o artifact "Ninho (versão do site)" com as últimas mudanças

## Lembretes
- No iPhone, pelo ícone da Tela de Início, entre com **e-mail e senha**
  (links de e-mail abrem no Safari, que é separado do ícone).
- Para mudar o app: abra uma sessão do Claude Code no repositório Ninho e peça.
  Esta lista fica no repositório, então a próxima sessão também consegue lê-la.
