const DURATION_PATTERN = /^(\d+)([smhd])?$/;

const SECONDS_BY_UNIT: Record<string, number> = {
  s: 1,
  m: 60,
  h: 3600,
  d: 86400,
};

/**
 * Converte uma duração (`1h`, `30m`, `45s`, `7d`) ou um número de segundos
 * em segundos. O valor sai de `JWT_EXPIRES_IN`.
 */
export function toSeconds(value: string): number {
  const match = DURATION_PATTERN.exec(value.trim());

  if (!match) {
    throw new Error(
      `Duração inválida: "${value}". Use o formato 30m, 1h, 7d ou um número de segundos.`,
    );
  }

  const amount = Number(match[1]);
  const unit = match[2];

  return unit ? amount * SECONDS_BY_UNIT[unit] : amount;
}
