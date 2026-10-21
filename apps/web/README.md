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

Levantados pela própria suíte (ver `pnpm web:test:a11y:report`):

- **1.4.3** — o placeholder dos campos (`Input` com `placeholder:text-field-text/70`) fica em 3.10:1
  sobre o campo cinza `#888888`. O mínimo é 4.5:1 para texto normal.
