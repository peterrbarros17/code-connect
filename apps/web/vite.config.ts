import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { configDefaults, defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    // Os specs de acessibilidade rodam no Playwright (ver playwright.config.ts).
    exclude: [...configDefaults.exclude, 'e2e/**/*.a11y.spec.ts'],
  },
})
