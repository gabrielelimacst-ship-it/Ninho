# Relógio no Ninho: passo a passo

Caminho dos dados: **relógio → Mi Fitness → app Saúde → atalho (app Atalhos) → Ninho**.
Faça uma parte de cada vez. Se alguma tela estiver diferente, mande um print.

---

## Parte 1 · Mi Fitness → app Saúde (2 min)
1. Abra o **Mi Fitness** → aba **Perfil** (ou **Eu**).
2. Procure **Apple Saúde** / **Saúde** (às vezes em *Configurações* ou *Contas de terceiros*).
3. Conecte e, na tela do iPhone, toque em **Ativar Todas** e depois **Permitir**.
4. Para conferir: abra o app **Saúde** → **Navegar** → **Atividade → Passos**. Os passos do relógio devem estar lá.

## Parte 2 · Supabase (5 min, pelo computador)
1. **SQL Editor** → cole o arquivo `supabase/sql/relogio.sql` → **Run**.
2. **Edge Functions → Deploy a new function → Via Editor**
   - nome: **`relogio`**
   - cole o arquivo `supabase/functions/relogio/index.ts` (botão *Copy raw file*)
   - **Deploy function**
   - nos detalhes da função, **desligue "Verify JWT"** e salve
     (o atalho não faz login; quem prova a identidade é a sua chave pessoal).

## Parte 3 · Chave no Ninho (1 min)
No Ninho: **Perfil → Conexões e dados → Relógio (Mi Fitness) → Gerar minha chave**.
Deixe essa tela aberta: você vai copiar a **chave** e o **endereço** na parte 4.

## Parte 4 · O atalho (10 min, no iPhone)
Abra o app **Atalhos** → **+** (novo atalho). Dê o nome **Ninho · relógio**.
Adicione as ações abaixo, nesta ordem (use a busca "Pesquisar ações").

**Passos**
1. **Encontrar Amostras de Saúde** → toque em *Tipo* e escolha **Passos**.
   Adicione o filtro **Data de Início · é hoje**.
2. **Calcular Estatísticas** → **Soma** de *Amostras de Saúde*.
3. **Definir Variável** → nome `Passos`.

**Sono**
4. **Encontrar Amostras de Saúde** → Tipo **Análise do Sono**.
   Filtros: **Data de Início · está nos últimos 1 dias** e **Valor · não é Em Cama**
   (se houver, acrescente **Valor · não é Acordado**).
5. **Obter Detalhes das Amostras de Saúde** → **Duração**.
6. **Calcular Estatísticas** → **Soma**.
7. **Definir Variável** → nome `Sono`.

**Batimentos**
8. **Encontrar Amostras de Saúde** → Tipo **Frequência Cardíaca**, filtro **Data de Início · é hoje**.
9. **Calcular Estatísticas** → **Média**.
10. **Definir Variável** → nome `BPM`.
11. **Encontrar Amostras de Saúde** → Tipo **Frequência Cardíaca em Repouso**, filtro **Data de Início · é hoje**.
12. **Calcular Estatísticas** → **Média**.
13. **Definir Variável** → nome `Repouso`.

**Enviar ao Ninho**
14. **Obter Conteúdo da URL**
    - URL: cole o **endereço** que o Ninho mostrou
    - toque em *Mostrar Mais* → **Método: POST**
    - **Corpo da Solicitação: JSON** e adicione 5 campos do tipo **Texto**:

      | Chave | Valor |
      |---|---|
      | `chave` | cole a **chave** do Ninho |
      | `passos` | variável **Passos** |
      | `sono` | variável **Sono** |
      | `bpm` | variável **BPM** |
      | `repouso` | variável **Repouso** |
15. **Obter Valor do Dicionário** → *Valor* para a chave `msg`.
16. **Mostrar Notificação** → com o *Valor do Dicionário*.

Toque em **▶︎** para testar. Na primeira vez o iPhone pede acesso ao Saúde: **Permitir**.
Deve aparecer: *"Ninho atualizado: 6h40 de sono, 7832 passos, 62 bpm em repouso"*.

## Parte 5 · Rodar sozinho todo dia (1 min)
Atalhos → aba **Automação** → **+** → **Hora do Dia**
- **21:30**, **Diariamente**
- **Executar Imediatamente** (desligue "Notificar ao Executar", se quiser)
- ação: **Executar Atalho → Ninho · relógio**

Pode rodar o atalho na mão quando quiser: o Ninho atualiza o dia de hoje.

---

### Se algo der errado
- **"Chave não reconhecida"**: gere uma nova chave no Ninho e cole de novo no atalho.
- **Sono aparece 0 ou estranho**: o Mi Fitness pode gravar o sono de outro jeito. Mande um print
  da tela *Saúde → Sono* que a gente ajusta o filtro.
- **Batimento em repouso vazio**: tudo bem, o Ninho usa a média do dia.
