# Code Connect

Rede social para pessoas que programam: publique descobertas, snippets de código e ideias,
curta e comente posts da comunidade.

O projeto é um monorepo pnpm com duas aplicações:

- **`apps/web`** — front-end em React 19, Vite 8, Tailwind CSS 4 e TypeScript.
- **`apps/api`** — API REST em NestJS 12, TypeORM e PostgreSQL, com autenticação JWT e Swagger.

A interface é em português (pt-BR) e cobre autenticação, feed com busca e filtros, leitura de
post, curtidas, comentários e criação de publicações com upload de miniatura.

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Stack](#stack)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Pré-requisitos](#pré-requisitos)
- [Como rodar](#como-rodar)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Scripts](#scripts)
- [Banco de dados](#banco-de-dados)
- [API](#api)
- [Testes](#testes)
- [Acessibilidade](#acessibilidade)
- [SEO e descoberta por agentes de IA](#seo-e-descoberta-por-agentes-de-ia)
- [Build de produção](#build-de-produção)
- [Convenções do projeto](#convenções-do-projeto)

---

## Funcionalidades

- **Autenticação** — cadastro com nome, e-mail e senha; login com JWT; sessão persistida no
  navegador com expiração; rotas protegidas para ações que exigem conta.
- **Feed** — listagem paginada com busca full-text, filtro por tags e ordenação por
  `Recentes` ou `Populares`.
- **Post** — página de detalhe com código, contagem de curtidas, comentários e respostas de
  primeiro nível.
- **Publicação** — criação de post com título, conteúdo, tags, bloco de código e miniatura
  opcional.
- **Curtidas e comentários** — disponíveis para quem está logado; visitantes são convidados a
  entrar.
- **Acessibilidade** — suíte automatizada WCAG 2.0/2.1/2.2 A e AA com axe-core e Playwright.
- **SEO** — `robots.txt`, `llms.txt` e manifesto ARD para descoberta por agentes de IA.

## Stack

| Camada | Tecnologias |
| --- | --- |
| Front-end | React 19, React Router 8, Vite 8, Tailwind CSS 4, Axios, TypeScript 6 |
| Testes do front | Vitest, React Testing Library, Playwright + axe-core |
| Back-end | NestJS 12 (ESM), TypeORM, Passport JWT, bcrypt, class-validator |
| Banco | PostgreSQL 17 (Docker) |
| Testes da API | Vitest (unitários e e2e com Supertest) |
| Ferramentas | pnpm 12, oxlint, Prettier, Swagger |

## Estrutura do repositório

```text
code-connect/
├── apps/
│   ├── api/                      # API NestJS
│   │   ├── src/
│   │   │   ├── auth/             # login, JWT, guards, estratégias
│   │   │   ├── users/            # cadastro e dados do usuário
│   │   │   ├── posts/            # feed, curtidas, comentários, upload
│   │   │   ├── database/         # configuração, migrations e seed
│   │   │   ├── config/           # leitura e validação de env
│   │   │   ├── app.module.ts
│   │   │   ├── app.setup.ts      # CORS, validação e arquivos estáticos
│   │   │   └── main.ts           # bootstrap + Swagger
│   │   ├── test/                 # testes e2e
│   │   └── uploads/posts/        # miniaturas enviadas
│   └── web/                      # front-end React
│       ├── src/
│       │   ├── components/       # Atomic Design: atoms, molecules, organisms, templates
│       │   ├── pages/            # Feed, Login, Cadastro, Post, Publicar
│       │   ├── services/         # axios, autenticação, posts, storage
│       │   ├── contexts/         # sessão do usuário
│       │   ├── hooks/
│       │   ├── types/
│       │   └── index.css         # Tailwind + tokens do tema
│       ├── public/               # estáticos, ícones, imagens, SEO
│       └── e2e/a11y/             # testes de acessibilidade (Playwright)
├── docker/postgres/init/         # criação do banco de testes
├── compose.yaml                  # PostgreSQL
├── pnpm-workspace.yaml
└── package.json                  # scripts da raiz
```

## Pré-requisitos

- **Node.js 22+**
- **pnpm 12** — a versão está fixada em `packageManager`. Se precisar, instale com
  `corepack enable` ou `npm install -g pnpm@12`.
- **Docker** com Docker Compose — usado para o PostgreSQL.

## Como rodar

```bash
# 1. instale as dependências na raiz
pnpm install

# 2. suba o PostgreSQL
pnpm db:up

# 3. configure as variáveis de ambiente
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 4. em terminais separados
pnpm api:dev    # API em http://localhost:3000 (Swagger em /docs)
pnpm web:dev    # front-end em http://localhost:5173
```

Opcionalmente, popule o banco com usuários e posts de demonstração:

```bash
pnpm api:seed
```

### Login de demonstração

```text
bia@codeconnect.dev / SenhaForte1
```

O seed também cria `caio@codeconnect.dev`, `lara@codeconnect.dev` e
`davi@codeconnect.dev`, todos com a mesma senha.

## Variáveis de ambiente

### API — `apps/api/.env`

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `PORT` | `3000` | Porta da API |
| `JWT_SECRET` | chave de desenvolvimento | Segredo do JWT. Obrigatório em produção (mín. 32 caracteres) |
| `JWT_EXPIRES_IN` | `1h` | Validade do access token (`30m`, `1h`, `7d` ou segundos) |
| `WEB_ORIGIN` | `http://localhost:5173` | Origem permitida no CORS (várias separadas por vírgula) |
| `DATABASE_HOST` | `localhost` | Host do PostgreSQL |
| `DATABASE_PORT` | `5432` | Porta do PostgreSQL |
| `DATABASE_USER` | `code_connect` | Usuário do banco |
| `DATABASE_PASSWORD` | `code_connect` | Senha do banco |
| `DATABASE_NAME` | `code_connect` | Nome do banco |

Em produção, as variáveis `DATABASE_*` são obrigatórias, sem os defaults de desenvolvimento.

### Front-end — `apps/web/.env.local`

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:3000` | URL base da API consumida pelo axios |

## Scripts

Todos os comandos são executados na **raiz** do monorepo.

| Script | O que faz |
| --- | --- |
| `pnpm web:dev` | Front-end em modo desenvolvimento (Vite) |
| `pnpm web:build` | Type-check + build de produção do front-end |
| `pnpm web:preview` | Serve o build de produção em `http://localhost:4173` |
| `pnpm web:lint` | Lint do front-end (oxlint) |
| `pnpm web:test` | Testes de componente (Vitest) |
| `pnpm web:test:a11y` | Testes de acessibilidade (Playwright + axe-core) |
| `pnpm web:test:a11y:report` | Roda a acessibilidade apenas registrando os achados |
| `pnpm api:dev` | API em modo watch |
| `pnpm api:build` | Compila a API |
| `pnpm api:start:prod` | Executa o build da API |
| `pnpm api:lint` | Lint type-aware da API (oxlint) |
| `pnpm api:format` | Formata `src/` e `test/` com Prettier |
| `pnpm api:test` | Testes unitários da API |
| `pnpm api:test:watch` | Testes unitários em watch |
| `pnpm api:test:cov` | Testes unitários com cobertura |
| `pnpm api:test:e2e` | Testes de integração (requer Postgres) |
| `pnpm api:seed` | Popula o banco com dados de demonstração |
| `pnpm db:up` | Sobe o PostgreSQL via Docker Compose |
| `pnpm db:down` | Para o PostgreSQL sem apagar os dados |
| `pnpm db:reset` | Para o PostgreSQL e apaga o volume |

## Banco de dados

- O `compose.yaml` sobe o PostgreSQL 17 na porta `5432`, com o volume nomeado
  `postgres_data` — os dados sobrevivem a reinícios.
- O schema é versionado por **migrations** em `apps/api/src/database/migrations/`, executadas
  automaticamente no boot (`migrationsRun: true`). `synchronize` fica desligado.
- Entidades: `User`, `Post`, `PostLike` e `Comment`, mapeadas para `users`, `posts`,
  `post_likes` e `post_comments`.
- `posts.search_vector` é uma coluna gerada (`tsvector`, português) com índice GIN para a
  busca full-text. Tags também têm índice GIN.
- O e-mail é normalizado para minúsculas e protegido por constraint única; duplicatas
  respondem `409 Conflict`.
- O banco `code_connect_test` é criado por `docker/postgres/init/01-create-test-db.sql` na
  primeira inicialização do volume e é usado pelos testes e2e.

## API

Documentação interativa em **`http://localhost:3000/docs`** (JSON bruto em `/docs-json`).

| Método | Rota | Auth | Descrição |
| --- | --- | --- | --- |
| `POST` | `/users` | não | Cria usuário |
| `POST` | `/auth/login` | não | Autentica e devolve access token + usuário |
| `GET` | `/auth/me` | sim | Dados do usuário logado |
| `GET` | `/posts` | não | Lista paginada de posts |
| `GET` | `/posts/tags` | não | Tags com contagem |
| `GET` | `/posts/:id` | não | Detalhe do post com comentários |
| `POST` | `/posts` | sim | Cria post |
| `POST` | `/posts/thumbnail` | sim | Envia miniatura e devolve `{ url }` |
| `POST` | `/posts/:id/likes` | sim | Curte o post |
| `DELETE` | `/posts/:id/likes` | sim | Remove a curtida |
| `POST` | `/posts/:id/comments` | sim | Comenta ou responde a um comentário |

`GET /posts` aceita `search`, `tags` (separadas por vírgula ou repetidas),
`sort=recent|popular`, `page` e `limit` (máximo 50).

As miniaturas enviadas ficam em `apps/api/uploads/posts/` e são servidas em
`/uploads/posts/...`; o front-end prefixa a URL relativa com `VITE_API_URL`.

Exemplo rápido:

```bash
# cadastro
curl -X POST http://localhost:3000/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Maria Souza","email":"maria.souza@email.com","password":"SenhaForte1"}'

# login
curl -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"maria.souza@email.com","password":"SenhaForte1"}'

# usuário logado
curl http://localhost:3000/auth/me -H 'Authorization: Bearer <access_token>'
```

> A senha nunca é devolvida pela API; o banco guarda apenas o hash bcrypt.

## Testes

```bash
# front-end: componentes
pnpm web:test

# front-end: acessibilidade (WCAG A/AA) — sobe o Vite automaticamente
pnpm web:test:a11y

# API: unitários (sem banco)
pnpm api:test

# API: e2e (requer pnpm db:up)
pnpm api:test:e2e
```

- **Front-end:** cada componente em `src/components` e cada página em `src/pages` tem um teste
  ao lado (`*.test.tsx`), cobrindo o uso essencial com Testing Library e `user-event`.
- **API unitária:** usa um repositório fake em memória.
- **API e2e:** sobe o `AppModule` completo contra o banco `code_connect_test` e cobre
  autenticação, listagem pública, busca, filtro por tag, criação, curtidas, comentários e
  upload.

## Acessibilidade

A interface é validada contra **WCAG 2.0/2.1/2.2 níveis A e AA** com Playwright e axe-core,
em Chromium real, nos tamanhos desktop, tablet e mobile.

| Arquivo (`apps/web/e2e/a11y`) | Verificação |
| --- | --- |
| `paginas.a11y.spec.ts` | axe-core em cada rota e checagens de título, `lang`, `h1` único e landmark `main` |
| `estados.a11y.spec.ts` | axe-core com formulário preenchido, em erro e com foco nos campos |
| `contraste.a11y.spec.ts` | contraste de texto e `::placeholder` (WCAG 1.4.3) |
| `teclado.a11y.spec.ts` | navegação por Tab, foco visível com 3:1 e foco não encoberto |

Relatório HTML em `apps/web/playwright-report`:

```bash
pnpm exec playwright show-report
```

> O axe-core cobre cerca de 60% dos critérios do WCAG. Itens como uso de cor, rótulos
> descritivos e texto alternativo dependente de contexto ainda exigem revisão manual.

## SEO e descoberta por agentes de IA

Arquivos estáticos em `apps/web/public/`, servidos na raiz e copiados para `dist/` no build:

| Arquivo | Rota | Função |
| --- | --- | --- |
| `robots.txt` | `/robots.txt` | Regras de rastreamento |
| `llms.txt` | `/llms.txt` | Resumo do site em Markdown para LLMs |
| `.well-known/ai-catalog.json` | `/.well-known/ai-catalog.json` | Manifesto ARD (`specVersion` 1.0) |
| `.well-known/ard.json` | `/.well-known/ard.json` | O mesmo manifesto no caminho atual da spec |

Ao alterar um manifesto, replique no outro — o Lighthouse 13.x procura `ai-catalog.json`,
enquanto versões mais recentes também aceitam `ard.json`.

Para medir o Lighthouse, use sempre o build de produção:

```bash
pnpm web:build && pnpm web:preview
pnpm dlx lighthouse http://localhost:4173 --view
```

## Build de produção

```bash
# front-end
pnpm web:build        # gera apps/web/dist
pnpm web:preview      # confere o build em http://localhost:4173

# API
pnpm api:build        # gera apps/api/dist
pnpm api:start:prod   # executa node dist/main
```

O front-end é uma SPA: o servidor de produção precisa redirecionar rotas desconhecidas para
`index.html`. A API serve as miniaturas por `/uploads/` e expõe o Swagger em `/docs`.

## Convenções do projeto

- **Gerenciador:** pnpm 12. Não use npm/yarn nem gere `package-lock.json`.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) —
  `tipo(escopo): descrição`, com escopo `web`, `api` ou `repo`.
- **Atomic Design no front:** `atoms` → `molecules` → `organisms` → `templates` → `pages`.
  Um nível importa apenas níveis abaixo. Um componente por arquivo, em PascalCase, com teste
  na mesma pasta.
- **Tailwind:** estilos no JSX com utilitários; cores e tokens ficam no `@theme` de
  `src/index.css`. Hex fora do tema não é usado no JSX.
- **Imagens:** todo `<img>` tem `alt` e `width`/`height` explícitos (tamanho intrínseco).
- **TypeScript:** `web` usa aspas simples e sem ponto e vírgula; `api` usa aspas simples e
  ponto e vírgula, com imports relativos terminando em `.js` (ESM).
- **Lint:** oxlint nos dois apps. `react/rules-of-hooks` e
  `typescript/no-floating-promises` são erros.
- **Testes:** Vitest nos dois apps. Toda tela/componente novo entra também na suíte de
  acessibilidade (`ROTAS` em `paginas.a11y.spec.ts` e `estados.a11y.spec.ts`).
