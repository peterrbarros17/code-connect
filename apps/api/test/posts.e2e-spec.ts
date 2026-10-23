import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { clearUsersTable } from './support/clear-users.js';

describe('Posts (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;
  let authorId: string;

  const author = {
    name: 'Maria Souza',
    email: 'maria.souza@email.com',
    password: 'SenhaForte1',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
    await clearUsersTable(app);

    const created = await request(app.getHttpServer())
      .post('/users')
      .send(author)
      .expect(201);

    authorId = created.body.id;

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: author.email, password: author.password })
      .expect(200);

    token = login.body.access_token;
  });

  afterEach(async () => {
    await app.close();
  });

  async function createPost(overrides: Record<string, unknown> = {}) {
    const response = await request(app.getHttpServer())
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Como organizar componentes React',
        content:
          'Um guia prático para separar responsabilidades e manter o projeto legível.',
        tags: ['React', 'Front-end', 'React'],
        ...overrides,
      })
      .expect(201);

    return response.body;
  }

  it('GET /posts é público e devolve contadores e likedByMe', async () => {
    await createPost();

    const response = await request(app.getHttpServer())
      .get('/posts')
      .expect(200);

    expect(response.body.total).toBe(1);
    expect(response.body.items[0]).toMatchObject({
      title: 'Como organizar componentes React',
      author: { id: authorId, name: author.name },
      tags: ['react', 'front-end'],
      likesCount: 0,
      commentsCount: 0,
      likedByMe: false,
    });
  });

  it('GET /posts busca por full-text e filtra por tags no backend', async () => {
    await createPost();
    await createPost({
      title: 'Introdução a PostgreSQL',
      content: 'Índices e consultas para quem está começando no banco.',
      tags: ['postgresql', 'backend'],
    });

    const search = await request(app.getHttpServer())
      .get('/posts')
      .query({ search: 'componentes' })
      .expect(200);
    expect(search.body.items).toHaveLength(1);
    expect(search.body.items[0].title).toContain('componentes');

    const filtered = await request(app.getHttpServer())
      .get('/posts')
      .query({ tags: 'react,front-end' })
      .expect(200);
    expect(filtered.body.items).toHaveLength(1);
    expect(filtered.body.items[0].tags).toEqual(['react', 'front-end']);

    const noMatch = await request(app.getHttpServer())
      .get('/posts')
      .query({ tags: 'react,backend' })
      .expect(200);
    expect(noMatch.body.items).toHaveLength(0);
  });

  it('GET /posts ordena por popularidade no backend', async () => {
    const first = await createPost()
    const second = await createPost({
      title: 'Post com mais curtidas',
      content: 'Este post recebe uma curtida e deve aparecer primeiro.',
      tags: ['react'],
    })

    await request(app.getHttpServer())
      .post(`/posts/${second.id}/likes`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)

    const response = await request(app.getHttpServer())
      .get('/posts')
      .query({ sort: 'popular' })
      .expect(200)

    expect(response.body.items[0].id).toBe(second.id)
    expect(response.body.items[1].id).toBe(first.id)
  })

  it('GET /posts/tags devolve as tags com contagem', async () => {
    await createPost();

    const response = await request(app.getHttpServer())
      .get('/posts/tags')
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        { tag: 'react', count: 1 },
        { tag: 'front-end', count: 1 },
      ]),
    );
  });

  it('POST /posts exige autenticação e normaliza as tags', async () => {
    await request(app.getHttpServer())
      .post('/posts')
      .send({ title: 'Sem login', content: 'Conteúdo válido para o post.' })
      .expect(401);

    const post = await createPost();

    expect(post.tags).toEqual(['react', 'front-end']);
    expect(post.thumbnailUrl).toBeNull();
    expect(post.comments).toEqual([]);
  });

  it('curtir e descurtir alteram o contador e o estado da sessão', async () => {
    const post = await createPost();

    const liked = await request(app.getHttpServer())
      .post(`/posts/${post.id}/likes`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(liked.body).toEqual({ liked: true, likesCount: 1 });

    const detail = await request(app.getHttpServer())
      .get(`/posts/${post.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(detail.body.likedByMe).toBe(true);
    expect(detail.body.likesCount).toBe(1);

    const unliked = await request(app.getHttpServer())
      .delete(`/posts/${post.id}/likes`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(unliked.body).toEqual({ liked: false, likesCount: 0 });
  });

  it('comenta e responde em um post autenticado', async () => {
    const post = await createPost();

    const comment = await request(app.getHttpServer())
      .post(`/posts/${post.id}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Gostei muito do post!' })
      .expect(201);

    expect(comment.body).toMatchObject({
      postId: post.id,
      parentId: null,
      content: 'Gostei muito do post!',
      author: { id: authorId, name: author.name },
    });

    const reply = await request(app.getHttpServer())
      .post(`/posts/${post.id}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: 'Obrigada pelo comentário!',
        parentId: comment.body.id,
      })
      .expect(201);

    expect(reply.body.parentId).toBe(comment.body.id);

    const detail = await request(app.getHttpServer())
      .get(`/posts/${post.id}`)
      .expect(200);

    expect(detail.body.commentsCount).toBe(2);
    expect(detail.body.comments).toHaveLength(2);
  });

  it('rejeita resposta em uma resposta e comentário sem login', async () => {
    const post = await createPost();

    await request(app.getHttpServer())
      .post(`/posts/${post.id}/comments`)
      .send({ content: 'Sem login' })
      .expect(401);

    const parent = await request(app.getHttpServer())
      .post(`/posts/${post.id}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Comentário principal' })
      .expect(201);

    const firstReply = await request(app.getHttpServer())
      .post(`/posts/${post.id}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: 'Primeira resposta',
        parentId: parent.body.id,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/posts/${post.id}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: 'Resposta aninhada',
        parentId: firstReply.body.id,
      })
      .expect(400);
  });

  it('faz upload de miniatura autenticado', async () => {
    const response = await request(app.getHttpServer())
      .post('/posts/thumbnail')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', Buffer.from('imagem de teste'), {
        filename: 'miniatura.png',
        contentType: 'image/png',
      })
      .expect(201);

    expect(response.body.url).toMatch(/^\/uploads\/posts\/.+\.png$/);

    await request(app.getHttpServer())
      .post('/posts/thumbnail')
      .attach('image', Buffer.from('sem login'), {
        filename: 'miniatura.png',
        contentType: 'image/png',
      })
      .expect(401);
  });
});
