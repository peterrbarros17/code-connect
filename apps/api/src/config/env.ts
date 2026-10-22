export interface AppEnv {
  PORT: number;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  DATABASE_HOST: string;
  DATABASE_PORT: number;
  DATABASE_USER: string;
  DATABASE_PASSWORD: string;
  DATABASE_NAME: string;
}

/**
 * Segredo usado só em desenvolvimento, quando `JWT_SECRET` não está definido.
 */
export const DEV_JWT_SECRET =
  'code-connect-chave-de-desenvolvimento-nao-use-em-producao';

const DEV_DATABASE = {
  host: 'localhost',
  port: 5432,
  user: 'code_connect',
  password: 'code_connect',
  name: 'code_connect',
};

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asPort(value: unknown, fallback: number): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const port = Number(value);

  return Number.isFinite(port) ? port : fallback;
}

function readDatabaseEnv(
  config: Record<string, unknown>,
  isProduction: boolean,
): Pick<
  AppEnv,
  | 'DATABASE_HOST'
  | 'DATABASE_PORT'
  | 'DATABASE_USER'
  | 'DATABASE_PASSWORD'
  | 'DATABASE_NAME'
> {
  const host =
    asString(config['DATABASE_HOST']).trim() ||
    (isProduction ? '' : DEV_DATABASE.host);
  const user =
    asString(config['DATABASE_USER']).trim() ||
    (isProduction ? '' : DEV_DATABASE.user);
  const password =
    asString(config['DATABASE_PASSWORD']) ||
    (isProduction ? '' : DEV_DATABASE.password);
  const name =
    asString(config['DATABASE_NAME']).trim() ||
    (isProduction ? '' : DEV_DATABASE.name);

  if (isProduction && (!host || !user || !password || !name)) {
    throw new Error(
      'DATABASE_HOST, DATABASE_USER, DATABASE_PASSWORD e DATABASE_NAME são obrigatórios quando NODE_ENV=production.',
    );
  }

  return {
    DATABASE_HOST: host,
    DATABASE_PORT: asPort(config['DATABASE_PORT'], DEV_DATABASE.port),
    DATABASE_USER: user,
    DATABASE_PASSWORD: password,
    DATABASE_NAME: name,
  };
}

/**
 * Valida as variáveis de ambiente no boot. Em produção o `JWT_SECRET` e as
 * variáveis de conexão com o banco são obrigatórios.
 */
export function validateEnv(config: Record<string, unknown>): AppEnv {
  const isProduction = config['NODE_ENV'] === 'production';
  const secret = asString(config['JWT_SECRET']).trim();
  const database = readDatabaseEnv(config, isProduction);

  if (!secret) {
    if (isProduction) {
      throw new Error('JWT_SECRET é obrigatório quando NODE_ENV=production.');
    }

    return {
      PORT: asPort(config['PORT'], 3000),
      JWT_SECRET: DEV_JWT_SECRET,
      JWT_EXPIRES_IN: asString(config['JWT_EXPIRES_IN']) || '1h',
      ...database,
    };
  }

  if (isProduction && secret.length < 32) {
    throw new Error(
      'JWT_SECRET precisa ter ao menos 32 caracteres quando NODE_ENV=production.',
    );
  }

  return {
    PORT: asPort(config['PORT'], 3000),
    JWT_SECRET: secret,
    JWT_EXPIRES_IN: asString(config['JWT_EXPIRES_IN']) || '1h',
    ...database,
  };
}
