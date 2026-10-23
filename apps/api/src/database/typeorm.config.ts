import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CreateUsersTable1792694289433 } from './migrations/1792694289433-CreateUsersTable.js';
import { CreatePostsTables1792700000000 } from './migrations/1792700000000-CreatePostsTables.js';

/**
 * Conexão com o PostgreSQL. O schema é versionado por migrations, que rodam
 * no boot da aplicação (`migrationsRun`). Nunca use `synchronize` fora de
 * experimentos locais.
 */
export function createTypeOrmOptions(
  configService: ConfigService,
): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: configService.getOrThrow<string>('DATABASE_HOST'),
    port: configService.getOrThrow<number>('DATABASE_PORT'),
    username: configService.getOrThrow<string>('DATABASE_USER'),
    password: configService.getOrThrow<string>('DATABASE_PASSWORD'),
    database: configService.getOrThrow<string>('DATABASE_NAME'),
    autoLoadEntities: true,
    synchronize: false,
    migrations: [
      CreateUsersTable1792694289433,
      CreatePostsTables1792700000000,
    ],
    migrationsRun: true,
    logging: ['error'],
  };
}
