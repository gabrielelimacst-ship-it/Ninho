# Modelos de e-mail do Ninho

Para colar no Supabase → Authentication → Emails → Templates
(só fica editável depois de ligar o SMTP próprio).

| Modelo no Supabase | Assunto | Arquivo |
|---|---|---|
| Confirm signup | Confirme seu e-mail no Ninho | `confirmar-conta.html` |
| Reset password | Crie uma nova senha no Ninho | `recuperar-senha.html` |
| Invite user | Seu convite para o Ninho | `convite.html` |
| Magic Link | Seu código para entrar no Ninho | `codigo.html` |

Os arquivos usam só caracteres simples (acentos como `&aacute;`) para não
se perderem na cópia.

`{{ .Token }}` é o código de entrar sem senha. Ele aparece no e-mail para o iPhone/Android
conseguir sugerir o código em cima do teclado.
