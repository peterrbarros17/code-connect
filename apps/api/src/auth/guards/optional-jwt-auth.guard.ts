import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

type RequestWithHeaders = {
  headers: { authorization?: string };
};

/**
 * Leitura pública que ainda reconhece a sessão quando ela existe.
 *
 * Sem header Authorization a requisição segue anônima. Com header inválido,
 * devolve 401 normalmente para não mascarar um token expirado.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithHeaders>();

    if (!request.headers.authorization) {
      return true;
    }

    return (await super.canActivate(context)) as boolean;
  }
}
