import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';
import { FakeUsersRepository } from '../../test/support/fake-users.repository.js';
import { User } from './entities/user.entity.js';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  let service: UsersService;
  let repository: FakeUsersRepository;

  beforeEach(async () => {
    repository = new FakeUsersRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('cria o usuário com a senha hasheada', async () => {
    const user = await service.create({
      name: 'Maria Souza',
      email: 'maria.souza@email.com',
      password: 'SenhaForte1',
    });

    expect(user.id).toEqual(expect.any(String));
    expect(user.name).toBe('Maria Souza');
    expect(user.email).toBe('maria.souza@email.com');
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.passwordHash).not.toBe('SenhaForte1');
    expect(user.passwordHash).toMatch(/^\$2[aby]\$/);
  });

  it('normaliza o e-mail e apara o nome', async () => {
    const user = await service.create({
      name: '  Maria Souza  ',
      email: '  MARIA.SOUZA@Email.com ',
      password: 'SenhaForte1',
    });

    expect(user.email).toBe('maria.souza@email.com');
    expect(user.name).toBe('Maria Souza');
  });

  it('lança ConflictException quando o e-mail já existe', async () => {
    await service.create({
      name: 'Maria Souza',
      email: 'maria.souza@email.com',
      password: 'SenhaForte1',
    });

    await expect(
      service.create({
        name: 'Outra Maria',
        email: 'MARIA.SOUZA@email.com',
        password: 'SenhaForte1',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('converte violação de unicidade do banco em ConflictException', async () => {
    vi.spyOn(repository, 'save').mockRejectedValueOnce(
      new QueryFailedError('INSERT INTO users', [], { code: '23505' }),
    );

    await expect(
      service.create({
        name: 'Maria Souza',
        email: 'maria.souza@email.com',
        password: 'SenhaForte1',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('encontra o usuário por e-mail e por id', async () => {
    const created = await service.create({
      name: 'Maria Souza',
      email: 'maria.souza@email.com',
      password: 'SenhaForte1',
    });

    await expect(
      service.findByEmail('maria.souza@email.com'),
    ).resolves.toMatchObject({ id: created.id });
    await expect(service.findByEmail('MAIL@email.com')).resolves.toBeNull();
    await expect(service.findById(created.id)).resolves.toMatchObject({
      email: 'maria.souza@email.com',
    });
    await expect(service.findById('id-inexistente')).resolves.toBeNull();
  });
});
