import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';

/**
 * Configuração compartilhada entre `main.ts` e os testes e2e, para que a
 * validação de payload seja idêntica nos dois lugares.
 */
export function configureApp(app: INestApplication): INestApplication {
  const expressApp = app as NestExpressApplication;

  expressApp.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

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
