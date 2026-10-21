import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.A11Y_PORT ?? 5177)
const baseURL = `http://127.0.0.1:${PORT}`

/**
 * Testes end-to-end do app web.
 *
 * Hoje o único bloco é o de acessibilidade (`e2e/a11y`). Qualquer spec novo
 * entra em `e2e/<dominio>/<nome>.a11y.spec.ts` (ou outra extensão, se deixar
 * de ser teste de acessibilidade) e é coletado pelo `testDir`.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  outputDir: 'test-results',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'a11y',
      testMatch: '**/*.a11y.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `pnpm exec vite dev --port ${PORT} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
})
