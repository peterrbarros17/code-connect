import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    // Os arquivos compartilham o mesmo banco de teste e rodam migrations no
    // boot. Executar em série evita corrida entre eles.
    fileParallelism: false,
    env: {
      DATABASE_NAME: 'code_connect_test',
    },
  },
});
