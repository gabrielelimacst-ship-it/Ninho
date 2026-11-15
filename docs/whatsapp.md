# Sugestões do Ninho no WhatsApp (API oficial da Meta)

Caminho: **app (sugestão) → função `aviso-sugestao` → API do WhatsApp (Meta) → seu WhatsApp**.
O e-mail continua chegando como antes. O WhatsApp é um extra: se ele falhar, o e-mail chega mesmo assim.

Faça uma parte de cada vez, pelo computador. Se alguma tela estiver diferente, mande um print.

---

## Parte 1 · Criar o app na Meta (10 min)
1. Entre em **developers.facebook.com** com a sua conta do Facebook e toque em **Meus apps → Criar app**.
2. Tipo de uso: **Outro** → tipo de app: **Empresa (Business)**. Nome: `Ninho`.
3. Se pedir um **portfólio empresarial (Business Manager)**, crie um com o nome do Ninho.
4. Na tela do app, em **Adicionar produtos**, escolha **WhatsApp → Configurar**.

## Parte 2 · Número que envia e número que recebe (5 min)
1. Em **WhatsApp → Configuração da API** (API Setup), a Meta já dá um **número de teste** grátis para enviar.
   Ele serve para o nosso caso, porque o aviso vai só para você.
2. Em **Para (To)**, toque em **Gerenciar lista de números** e adicione **o seu número** de WhatsApp.
   Vai chegar um código no seu WhatsApp para confirmar.
3. Nessa mesma tela, copie e guarde:
   - **Identificação do número de telefone** (Phone number ID): uma sequência de números.

> Se um dia quiser que a mensagem saia de um número seu (e não do número de teste), dá para adicionar
> um número próprio nessa tela. Esse número não pode estar em uso no app do WhatsApp ao mesmo tempo.

## Parte 3 · Modelo de mensagem (5 min + aprovação)
A Meta só deixa empresas começarem conversa com um **modelo aprovado**. Ele é como um envelope padrão:
a sugestão entra nos espaços `{{1}}`, `{{2}}` e `{{3}}`.

1. Abra **business.facebook.com → WhatsApp Manager → Modelos de mensagem → Criar modelo**.
2. Categoria: **Utilidade**. Nome: **`nova_sugestao`** (assim, com sublinhado). Idioma: **Português (BR)**.
3. Corpo da mensagem (copie igual):

   ```
   💡 Nova sugestão no Ninho ({{1}}): {{2}} — enviada por {{3}}. Ela também chegou no seu e-mail.
   ```

4. A Meta não aceita modelo que termina com um espaço `{{ }}`, por isso a frase final.
5. Ele pede exemplos para cada espaço: `Ideia`, `Poder mudar a cor do app`, `alguem@email.com`.
6. Envie para aprovação. Costuma levar de minutos a algumas horas.

## Parte 4 · Chave permanente (10 min)
A chave que aparece na tela de teste vale só 24 horas. Para uma que não vence:
1. **business.facebook.com → Configurações → Usuários do sistema → Adicionar**. Nome: `ninho`, função **Administrador**.
2. **Atribuir ativos** → **Apps** → `Ninho` → controle total.
3. **Gerar token** → app `Ninho` → validade **Nunca** → marque `whatsapp_business_messaging` e `whatsapp_business_management`.
4. Copie o token. **Ele é uma senha: não mande em conversa nem coloque no GitHub.**

## Parte 5 · Supabase (3 min)
1. **Edge Functions → Secrets** (Segredos) → adicione:

   | Nome | Valor |
   |---|---|
   | `WA_TOKEN` | o token da parte 4 |
   | `WA_PHONE_ID` | o Phone number ID da parte 2 |
   | `WA_PARA` | seu número com 55 e DDD, só dígitos (ex.: `5511999999999`) |

2. **Edge Functions → aviso-sugestao** → substitua o código pelo arquivo `supabase/functions/aviso-sugestao/index.ts`
   (versão 5) → **Deploy**. Confira se **Verify JWT** continua desligado.

## Parte 6 · Testar
Mande uma sugestão pelo Ninho. Devem chegar o e-mail **e** a mensagem no WhatsApp.

### Se algo der errado
- Abrir `https://<seu-projeto>.supabase.co/functions/v1/aviso-sugestao` no navegador mostra
  `{"versao":5,"gmail":true,"whatsapp":true}` quando os três segredos estão lá.
- **Erro 131030 / número não permitido**: o seu número não está na lista da parte 2.
- **Erro 132001 / modelo não existe**: o modelo ainda não foi aprovado, ou o nome está diferente de `nova_sugestao`.
- **Erro 190 / token**: a chave venceu ou está errada; gere de novo (parte 4).

### Custo
Mensagens de modelo de **utilidade** custam alguns centavos cada (a Meta cobra em dólar, no cartão do portfólio).
Para receber sugestões, o volume é pequeno.
