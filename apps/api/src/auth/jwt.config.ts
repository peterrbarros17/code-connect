import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import { toSeconds } from './duration.js';

/**
 * Token de injeção da configuração de JWT.
 */
export const JWT_CONFIG = Symbol('JWT_CONFIG');

export interface JwtConfig {
  secret: string;
  /** Tempo de vida do token, em segundos. */
  expiresIn: number;
}

export function createJwtConfig(configService: ConfigService): JwtConfig {
  return {
    secret: configService.getOrThrow<string>('JWT_SECRET'),
    expiresIn: toSeconds(configService.get<string>('JWT_EXPIRES_IN', '1h')),
  };
}

export function createJwtModuleOptions(
  configService: ConfigService,
): JwtModuleOptions {
  const { secret, expiresIn } = createJwtConfig(configService);

  return { secret, signOptions: { expiresIn } };
}
