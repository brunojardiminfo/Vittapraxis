# Clube Vitapraxis

Ecossistema digital da Vitapraxis — centro de bem-estar multidisciplinar em
Blumenau/SC. Cinco frentes em um único projeto Next.js:

| Frente | Rota | Para quem |
| --- | --- | --- |
| Landing page | `/` | Visitantes — captação, renderizada no servidor para indexação |
| Clube Vitapraxis | `/app` | Pacientes — acompanhamento, agendamentos e benefícios |
| Painel do Profissional | `/pro` | Equipe clínica — agenda do dia e evolução clínica |
| Recepção | `/recepcao` | Fila de solicitações → vira agendamento |
| Visão Geral | `/admin` | Direção — receita, ocupação e desempenho da clínica |

## Publicando no Vercel

O banco é Postgres. SQLite não serve em produção aqui: o Vercel roda em
funções serverless com sistema de arquivos efêmero, então um arquivo `.db`
não sobrevive entre requisições nem entre deploys.

**1. Criar o projeto**

```bash
npx vercel login
```

```bash
npx vercel link
```

**2. Criar o banco** — no painel do Vercel, aba **Storage** → **Create
Database** → **Neon Postgres** → região **São Paulo (sa-east-1)** → conectar ao
projeto. A integração injeta `DATABASE_URL` e `DATABASE_URL_UNPOOLED`
automaticamente, sem ninguém copiar senha à mão.

**3. Publicar** — o build roda `prisma migrate deploy` e cria as tabelas.

```bash
npx vercel --prod
```

**4. Popular com os dados de demonstração** — puxa as credenciais do Vercel
para a sua máquina e roda o seed a partir dela:

```bash
npx vercel env pull .env
```

```bash
npm run db:seed
```

### Por que duas URLs de banco

`DATABASE_URL` passa pelo pooler: é o que as funções serverless usam, senão o
Postgres esgota conexões conforme o Vercel escala. `DATABASE_URL_UNPOOLED` é
conexão direta, necessária porque o pooler não suporta os comandos que o Prisma
usa para aplicar migrations.

## Rodando localmente

Depois da migração para Postgres, o desenvolvimento local também precisa de um
Postgres. O caminho mais simples é criar uma **branch** do banco no Neon e
apontar o `.env` para ela — assim você mexe à vontade sem tocar em produção.

```bash
npm install
```

Se o npm bloquear os install scripts (npm 11+), libere os necessários:

```bash
npm approve-scripts prisma @prisma/client @prisma/engines esbuild sharp
```

Copie `.env.example` para `.env` e preencha as duas URLs. Depois crie as
tabelas e popule com os dados reais da clínica:

```bash
npm run db:reset
```

Suba o servidor:

```bash
npm run dev
```

Abra <http://localhost:3000>.

### Contas de demonstração

| Papel | E-mail | Senha |
| --- | --- | --- |
| Paciente | `sofia@exemplo.com` | `vitapraxis` |
| Profissional | `evandro@vitapraxis.com.br` | `vitapraxis` |
| Recepção | `recepcao@vitapraxis.com.br` | `vitapraxis` |
| Direção | `admin@vitapraxis.com.br` | `vitapraxis` |

A tela de login traz os quatro perfis como atalho — um clique preenche o
acesso. Todos os 11 profissionais da equipe também têm login
(`nome@vitapraxis.com.br`) com a mesma senha.

## Stack

- **Next.js 15** (App Router, Server Components, Server Actions)
- **TypeScript** em modo estrito
- **Tailwind CSS v4** — tokens da marca em `src/app/globals.css`
- **Prisma + SQLite** — trocar para Postgres é só mudar `DATABASE_URL` e o
  `provider` em `prisma/schema.prisma`
- **bcryptjs** para hash de senha, sessão em cookie `httpOnly` persistida no banco

## Estrutura

```
prisma/
  schema.prisma        modelos do domínio
  seed.ts              equipe, serviços e preços reais do portfólio
scripts/
  token-teste.ts       cria sessão válida para testar rotas via curl
  conferir.ts          inspeção rápida do estado do banco
src/
  app/
    (site)/            landing pública
    entrar/            login
    app/               área do paciente (11 telas + solicitar agendamento)
    pro/               painel do profissional
    recepcao/          fila de solicitações
    admin/             visão geral da clínica
    actions/           server actions (auth, agendamentos, solicitações,
                       bem-estar, evolução)
  components/          UI compartilhada, ícones, navegação, gráfico
  lib/                 db, auth, formatação, guard de paciente
  middleware.ts        protege /app e /pro
```

## Decisões que valem saber

**Autenticação em duas camadas.** O `middleware.ts` roda no Edge, onde o Prisma
não funciona — então ele só verifica se o cookie existe. A validação real da
sessão e do papel acontece nos layouts de `/app` e `/pro`, que rodam em Node.
Por isso `SESSION_COOKIE` mora em `src/lib/session-cookie.ts`, isolado: importar
`auth.ts` no middleware arrastaria o Prisma para o bundle do Edge.

**Índice de Bem-Estar.** O paciente responde humor (1–5), sono (1–5) e dor
(0–10). O índice geral normaliza tudo para uma escala 0–10 e **inverte a dor**,
já que dor alta significa bem-estar baixo — a fórmula está em
`calcularIndice()`. A resposta é vinculada automaticamente ao próximo
agendamento sem índice, para o profissional encontrá-la no atendimento certo.

**Painel do profissional após salvar.** Registrar a evolução encerra o
atendimento, o que o tiraria de `EM_ATENDIMENTO` e faria o painel pular para o
estado vazio. Para o profissional não ficar sem confirmação, o painel mantém em
foco o último atendimento do dia e exibe a evolução recém-registrada.

**Preços.** Os valores em `seed.ts` vêm da tabela de investimento do portfólio.
Quando há plano, o catálogo mostra o valor da sessão dentro do plano e informa o
avulso — que é como a clínica comunica.

**Agendamento é solicitação, não auto-atendimento.** O paciente envia o serviço
e suas preferências de profissional, período e dias; a recepção define data e
hora e só então nasce o `Agendamento`. Por isso `Solicitacao` é um modelo
próprio e não um agendamento com data nula — o pedido existe antes de haver
horário. Ao agendar, o sistema recusa sobreposição na agenda do profissional.

**Campos de formulário são controlados.** O React 19 limpa inputs
não-controlados depois que uma server action roda. Numa recusa por conflito de
horário, a recepção perderia a data digitada; numa validação falha, o
profissional perderia a anotação clínica inteira. Todos os formulários mantêm
os valores em estado por causa disso.

**Comparação mês a mês no painel da direção.** Comparar o mês corrente contra o
mês anterior inteiro mostraria uma queda falsa todo dia 1º. O recorte anterior
vai até o mesmo dia do mês, e o rótulo diz qual janela está sendo comparada.

**Receita.** Sessão de paciente com pacote ativo do mesmo serviço entra pelo
preço do plano; as demais, pelo avulso. É o que a clínica de fato recebe.

**A direção entra na fila da recepção.** O painel admin linka para
`/recepcao`, então o papel `ADMIN` tem acesso — caso contrário o próprio link
quebraria. Os demais papéis continuam isolados entre si.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sem emitir arquivos |
| `npm run db:reset` | Recria o banco e roda o seed |
| `npm run db:seed` | Só o seed |
| `npm run db:migrate` | Cria uma migration nova a partir do schema |
| `npm run db:deploy` | Aplica as migrations pendentes |
| `npm run db:studio` | Prisma Studio |

## Antes de virar produção de verdade

Coisas que um ambiente de demonstração tolera e um cliente pagante não:

- **Valores monetários são `Float`.** Na escala atual o erro é invisível
  (some na formatação para dois decimais), mas dinheiro em ponto flutuante
  acumula imprecisão. Migrar para `Decimal` ou centavos em `Int` antes de
  emitir qualquer cobrança pela plataforma.
- **Backup do banco.** São dados de saúde. Plano gratuito de Postgres não
  garante backup nem point-in-time restore.
- **Rate limit no login.** Hoje não há limite de tentativas de senha.
- **Senhas de demonstração.** Todas as contas do seed usam a mesma senha.
  Trocar antes de qualquer uso real, e remover as contas de exemplo.
- **Plano Vercel.** O Hobby proíbe uso comercial; projeto de cliente exige Pro.

## Próximos passos sugeridos

- Grade de disponibilidade por profissional, para a recepção enxergar os
  horários livres em vez de digitar data e hora
- Notificações por e-mail/WhatsApp: confirmação da solicitação, lembrete na
  véspera e aviso quando a recepção responde
- Upload de fotos reais da equipe (hoje os avatares usam iniciais)
- Relatório exportável (CSV/PDF) a partir do painel da direção
- Migrar para Postgres e publicar

## Nota sobre os dados de demonstração

O seed gera datas relativas ao momento em que roda — agenda de hoje, histórico
dos últimos 55 dias e comparativo com o mês anterior. Se a demonstração ficar
parada alguns dias, rode `npm run db:reset` para as datas voltarem a fazer
sentido.
