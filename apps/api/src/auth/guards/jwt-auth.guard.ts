import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard de autenticação: exige um access token JWT válido.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
