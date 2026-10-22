import { INestApplication } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * Deixa o banco de teste limpo entre os cenários. O e2e roda com
 * `DATABASE_NAME=code_connect_test` e sem paralelismo entre arquivos.
 */
export async function clearUsersTable(app: INestApplication): Promise<void> {
  const dataSource = app.get<DataSource>(getDataSourceToken());

  await dataSource.query('TRUNCATE TABLE "users"');
}
