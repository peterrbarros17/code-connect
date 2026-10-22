import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { clearUsersTable } from './support/clear-users.js';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
    await clearUsersTable(app);

    await request(app.getHttpServer()).post('/users').send({
      name: 'Maria Souza',
      email: 'maria.souza@email.com',
      password: 'SenhaForte1',
    });

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'maria.souza@email.com', password: 'SenhaForte1' })
      .expect(200);

    token = login.body.access_token;
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /auth/login devolve o access token e os dados do usuário', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'maria.souza@email.com', password: 'SenhaForte1' })
      .expect(200);

    expect(response.body.token_type).toBe('Bearer');
    expect(response.body.expires_in).toBe(3600);
    expect(response.body.access_token).toEqual(expect.any(String));
    expect(response.body.user).toEqual({
      id: expect.any(String),
      name: 'Maria Souza',
      email: 'maria.souza@email.com',
      createdAt: expect.any(String),
    });
    expect(response.body.user).not.toHaveProperty('passwordHash');
  });

  it('POST /auth/login responde 401 com credenciais inválidas', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'maria.souza@email.com', password: 'SenhaErrada1' })
      .expect(401);

    expect(response.body.message).toBe('Credenciais inválidas.');
  });

  it('POST /auth/login responde 401 com e-mail inexistente', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'ninguem@email.com', password: 'SenhaForte1' })
      .expect(401);
  });

  it('POST /auth/login responde 400 com payload inválido', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nao-e-email', password: '' })
      .expect(400);
  });

  it('GET /auth/me devolve os dados do usuário logado', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual({
      id: expect.any(String),
      name: 'Maria Souza',
      email: 'maria.souza@email.com',
      createdAt: expect.any(String),
    });
    expect(response.body).not.toHaveProperty('passwordHash');
  });

  it('GET /auth/me responde 401 sem token', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('GET /auth/me responde 401 com token inválido', async () => {
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer token.invalido')
      .expect(401);
  });
});
