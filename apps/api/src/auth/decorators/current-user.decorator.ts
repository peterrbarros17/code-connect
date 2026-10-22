import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { User } from '../../users/entities/user.entity.js';

type RequestWithUser = { user?: User };

/**
 * Injeta o usuário autenticado (preenchido pelo JwtStrategy) no handler.
 */
export const CurrentUser = createParamDecorator(
  (field: keyof User | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    if (!field) {
      return request.user;
    }

    return request.user?.[field];
  },
);
