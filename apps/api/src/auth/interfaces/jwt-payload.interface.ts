/**
 * Payload assinado no access token.
 */
export interface JwtPayload {
  /** Id do usuário. */
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}
