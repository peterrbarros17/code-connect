import { UnauthorizedException } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FakeUsersRepository } from '../../test/support/fake-users.repository.js';
import { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';
import { JWT_CONFIG } from './jwt.config.js';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'segredo-de-teste' })],
      providers: [
        AuthService,
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: new FakeUsersRepository(),
        },
        {
          provide: JWT_CONFIG,
          useValue: { secret: 'segredo-de-teste', expiresIn: 3600 },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  async function createUser(password = 'SenhaForte1') {
    return usersService.create({
      name: 'Maria Souza',
      email: 'maria.souza@email.com',
      password,
    });
  }

  it('devolve o token e os dados do usuário no login válido', async () => {
    const user = await createUser();

    const result = await service.login({
      email: 'maria.souza@email.com',
      password: 'SenhaForte1',
    });

    expect(result.token_type).toBe('Bearer');
    expect(result.expires_in).toBe(3600);
    expect(result.access_token.split('.')).toHaveLength(3);
    expect(result.user.id).toBe(user.id);
    expect(result.user.email).toBe('maria.souza@email.com');
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it('lança UnauthorizedException com senha errada', async () => {
    await createUser();

    await expect(
      service.login({
        email: 'maria.souza@email.com',
        password: 'SenhaErrada1',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('lança UnauthorizedException com e-mail inexistente', async () => {
    await expect(
      service.login({ email: 'ninguem@email.com', password: 'SenhaForte1' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
