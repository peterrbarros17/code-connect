import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { clearUsersTable } from './support/clear-users.js';

describe('Users (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
    await clearUsersTable(app);
  });

  afterEach(async () => {
    await app.close();
  });

  const novoUsuario = {
    name: 'Maria Souza',
    email: 'maria.souza@email.com',
    password: 'SenhaForte1',
  };

  it('POST /users cadastra o usuário e devolve a representação', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send(novoUsuario)
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(String),
      name: 'Maria Souza',
      email: 'maria.souza@email.com',
      createdAt: expect.any(String),
    });
    expect(response.body).not.toHaveProperty('password');
    expect(response.body).not.toHaveProperty('passwordHash');
  });

  it('POST /users responde 400 com payload inválido', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'M', email: 'email-invalido', password: '123' })
      .expect(400);

    expect(response.body.message).toEqual(
      expect.arrayContaining([
        expect.stringContaining('name'),
        expect.stringContaining('email'),
        expect.stringContaining('password'),
      ]),
    );
  });

  it('POST /users responde 400 com campo desconhecido', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({ ...novoUsuario, role: 'admin' })
      .expect(400);
  });

  it('POST /users responde 409 quando o e-mail já existe', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send(novoUsuario)
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/users')
      .send({ ...novoUsuario, name: 'Outra Maria' })
      .expect(409);

    expect(response.body.message).toContain('e-mail');
  });
});
