# Ninho — próximos passos

Lista viva do que ficou combinado. Marque com `[x]` o que for concluído.

## 1. Pendências agora (rápidas, só você)
- [ ] Fazer o merge do PR #3 (tela de login menor + mensagem de erro melhor)
- [ ] Supabase → Authentication → URL Configuration: trocar o **Site URL** para
      `https://gabrielelimacst-ship-it.github.io/Ninho/` e adicionar o mesmo em **Redirect URLs**
- [ ] Entrar no app com e-mail e senha (a conta já deve estar confirmada)
- [ ] Testar a sincronização: anotar algo no celular e conferir no computador
- [ ] Decidir: qualquer pessoa pode criar conta **ou** só convidados
      (Authentication → Sign In / Providers → "Allow new users to sign up")

## 2. E-mails com cara de Ninho
- [ ] Ligar e-mail próprio (SMTP) com o Gmail + "senha de app" do Google
  - remetente passa a ser "Ninho" em vez de "Supabase Auth"
  - acaba o limite de 2 e-mails por hora
  - libera a edição dos modelos de e-mail
- [ ] Personalizar os e-mails em português: confirmação de conta, recuperar senha, convite

## 3. Login
- [ ] Login com Google (configurar no Google Cloud + Supabase, depois ligar o botão no app)
- [ ] (Opcional) Trazer de volta o "entrar sem senha" por link no e-mail

## 4. Sugestões para depois
- [ ] Ícone e nome próprios ao adicionar à Tela de Início do celular
- [ ] Endereço próprio (ex.: `meuninho.com.br`) — opcional, ~R$ 40/ano
- [ ] Avisar quando o mesmo ninho for mudado em dois aparelhos ao mesmo tempo
      (hoje vale a última alteração enviada)
- [ ] Revisar a tela "Conectar calendário", que ainda fala que precisa de servidor
- [ ] Decidir o papel do artifact "Ninho." no Claude: hoje o original é o GitHub,
      e o artifact está desatualizado

## Lembretes
- No iPhone, pelo ícone da Tela de Início, entre com **e-mail e senha**
  (links de e-mail abrem no Safari, que é separado do ícone).
- Para mudar o app: abra uma sessão do Claude Code no repositório Ninho e peça.
  Esta lista fica no repositório, então a próxima sessão também consegue lê-la.
