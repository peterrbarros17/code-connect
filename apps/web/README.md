# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/plugin-react-swc/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Integração com a API

O app fala com o backend NestJS por HTTP usando `axios` (`apps/api`, Swagger em `/docs`).

```bash
cp apps/web/.env.example apps/web/.env.local   # VITE_API_URL, padrão http://localhost:3000
pnpm db:up
pnpm api:dev
pnpm web:dev
```

| Arquivo | Papel |
| --- | --- |
| `src/services/api.ts` | instância do axios, `baseURL`, timeout, header `Authorization: Bearer` e normalização dos erros do Nest |
| `src/services/auth.ts` | chamadas `POST /users`, `POST /auth/login` e `GET /auth/me` |
| `src/services/auth-storage.ts` | access token, usuário e expiração em `localStorage` |
| `src/contexts/AuthProvider.tsx` | estado da sessão, login, cadastro automático com login e logout |
| `src/services/posts.ts` | feed, tags, detalhe, criação, curtidas, comentários e upload de miniatura |
| `src/components/templates/MainLayout` | layout compartilhado pelo feed, detalhe e publicação (sidebar + nav mobile) |

Rotas:

| Rota | Acesso | Conteúdo |
| --- | --- | --- |
| `/` | público | feed com busca, filtros por tag e ordenação (`Recentes`/`Populares`) |
| `/posts/:id` | público | detalhe, código, curtidas e comentários encadeados |
| `/publicar` | sessão | criação de post, upload opcional de miniatura, tags e bloco de código |
| `/login` · `/cadastro` | público | autenticação; redirecionam para `/` (ou para `location.state.from`) |

Quem não está logado pode ler o feed e o detalhe, mas curtir/comentar leva ao login e o formulário
de comentário vira um convite para entrar. Para testar o fluxo autenticado, rode `pnpm api:seed` e
use `bia@codeconnect.dev` / `SenhaForte1`.

## Testes de acessibilidade (WCAG 2.x nível AA)

Runner: Playwright + `axe-core`. Os testes ficam em `e2e/a11y` e rodam num Chromium real, com o Vite
subindo sozinho (`playwright.config.ts`).

```bash
pnpm web:test:a11y          # reprova quando há violação
pnpm web:test:a11y:report   # só registra os achados, não reprova
pnpm web:test:a11y:ui       # abre a interface do Playwright
```

O relatório HTML fica em `apps/web/playwright-report` (abra com `pnpm exec playwright show-report`).

### O que é verificado

| Arquivo | Critério | Verificação |
| --- | --- | --- |
| `paginas.a11y.spec.ts` | WCAG 2.0/2.1/2.2 A e AA | axe-core em cada rota, em desktop, tablet e mobile; título, `lang`, um único `h1` e landmark `main` |
| `estados.a11y.spec.ts` | WCAG 2.0/2.1/2.2 A e AA | axe-core com o formulário preenchido, em erro de validação e com foco em cada campo e no botão |
| `contraste.a11y.spec.ts` | 1.4.3 | contraste do texto e do `::placeholder` dos campos (o axe-core não cobre placeholder nem `oklab()`) |
| `teclado.a11y.spec.ts` | 2.1.1, 2.4.3, 2.4.7, 1.4.11, 2.4.11 | alcance de todos os controles pelo Tab, indicador de foco visível com 3:1 e foco não encoberto |

O axe-core é limitado a `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` e `wcag22aa` (70 regras).
As regras `best-practice` ficam de fora de propósito: elas não são requisito do WCAG.

### Cobertura e limitação do axe

O axe-core cobre cerca de 60% dos critérios do WCAG. O que não dá para automatizar e continua
precisando de revisão manual:

- 1.4.1 uso de cor e 1.4.11 contraste de componentes sem texto (o contraste do foco é medido aqui)
- 2.4.6 rótulos descritivos e 3.3.2 instruções
- 2.5.3 rótulo do nome do usuário
- textos alternativos que dependem do contexto (o axe só confere se o `alt` existe)
- ordem de leitura e anúncio por leitor de tela de verdade

### Adicionando uma rota nova

Inclua a rota em `ROTAS` (`paginas.a11y.spec.ts`) e em `estados.a11y.spec.ts`, para que a página nova
seja varrida nos três tamanhos de tela e nos estados interativos.

### Problemas conhecidos

Nenhum no momento.

## SEO e descoberta por agentes de IA

Arquivos estáticos de `public/`, servidos na raiz do site e copiados para `dist/` no build:

| Arquivo | Endereço | Para quê |
| --- | --- | --- |
| `public/robots.txt` | `/robots.txt` | regras de rastreamento. Sem ele o servidor devolve o `index.html` e o Lighthouse reprova em `robots.txt is not valid` |
| `public/llms.txt` | `/llms.txt` | resumo do site em Markdown para LLMs (H1 + links), audit `llms-txt` |
| `public/.well-known/ai-catalog.json` | `/.well-known/ai-catalog.json` | manifesto ARD/`ai-catalog` (`specVersion` 1.0) |
| `public/.well-known/ard.json` | `/.well-known/ard.json` | o mesmo manifesto no caminho atual da spec ARD |

O `index.html` declara os dois manifests com `<link rel="ard">` e `<link rel="ai-catalog">` e
traz o `<meta name="description">` usado pelo audit de meta description.

> Os dois manifests têm o mesmo conteúdo de propósito: o Lighthouse 13.x só procura
> `ai-catalog.json`, enquanto as versões mais recentes também aceitam `ard.json`. Ao alterar
> um, replique no outro.

### Rodando o Lighthouse

```bash
pnpm dlx lighthouse http://localhost:5173/login --view
```

O painel do DevTools roda em modo *snapshot*, que não coleta trace: a categoria Performance
aparece como 0 mesmo com tudo certo. Meça Performance no modo *navigation* (CLI, como acima)
e sempre contra o build de produção (`pnpm web:build` + `pnpm web:preview`), porque o dev
server entrega o React sem minificar e infla o payload.
