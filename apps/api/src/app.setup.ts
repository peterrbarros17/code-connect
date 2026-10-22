import { INestApplication, ValidationPipe } from '@nestjs/common';

/**
 * Configuração compartilhada entre `main.ts` e os testes e2e, para que a
 * validação de payload seja idêntica nos dois lugares.
 */
export function configureApp(app: INestApplication): INestApplication {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: (process.env['WEB_ORIGIN'] ?? 'http://localhost:5173').split(','),
  });

  return app;
}
