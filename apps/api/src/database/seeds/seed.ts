import { NestFactory } from '@nestjs/core';
import { hash } from 'bcrypt';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module.js';

type SeedUser = {
  id: string;
  name: string;
  email: string;
};

type SeedPost = {
  id: string;
  authorId: string;
  title: string;
  content: string;
  code: string | null;
  thumbnailUrl: string | null;
  tags: string[];
  createdAt: string;
};

const DEMO_PASSWORD = 'SenhaForte1';

const USERS: SeedUser[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Bia Nogueira',
    email: 'bia@codeconnect.dev',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Caio Martins',
    email: 'caio@codeconnect.dev',
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    name: 'Lara Ferreira',
    email: 'lara@codeconnect.dev',
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    name: 'Davi Lima',
    email: 'davi@codeconnect.dev',
  },
];

const [bia, caio, lara, davi] = USERS;

const POSTS: SeedPost[] = [
  {
    id: 'a0000000-0000-4000-8000-000000000001',
    authorId: bia.id,
    title: 'Como organizei meu primeiro projeto em React',
    content:
      'Separar componentes por responsabilidade mudou a forma como eu leio o projeto. Neste post mostro a estrutura de pastas que usei e o motivo de cada camada existir.',
    code: `src/
  components/atoms/
  components/molecules/
  components/organisms/
  pages/
  services/`,
    thumbnailUrl: '/posts/post-01.png',
    tags: ['react', 'front-end', 'organização'],
    createdAt: '2026-10-21T18:00:00.000Z',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000002',
    authorId: caio.id,
    title: 'CSS Grid na prática: um feed responsivo',
    content:
      'Grid não precisa ser complicado. Comparando o layout do Figma com o CSS final, dá para resolver a maior parte do feed com duas colunas no desktop e uma no mobile.',
    code: `.feed {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
}

@media (max-width: 1023px) {
  .feed { grid-template-columns: 1fr; }
}`,
    thumbnailUrl: '/posts/post-02.png',
    tags: ['css', 'front-end', 'responsividade'],
    createdAt: '2026-10-21T12:00:00.000Z',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000003',
    authorId: lara.id,
    title: 'TypeScript: quando o tipo vale o esforço',
    content:
      'Nem todo projeto precisa do TypeScript mais rigoroso do mundo. Mas alguns tipos ajudam a documentar contratos e evitam bugs que só apareceriam em produção.',
    code: `type Post = {
  id: string
  title: string
  tags: string[]
}

function formatTags(post: Post): string {
  return post.tags.map((tag) => \`#\${tag}\`).join(' ')
}`,
    thumbnailUrl: '/posts/post-03.png',
    tags: ['typescript', 'boas práticas'],
    createdAt: '2026-10-21T06:00:00.000Z',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000004',
    authorId: davi.id,
    title: 'Acessibilidade em formulários: o checklist que uso',
    content:
      'Rótulo visível, mensagem de erro ligada ao campo e foco previsível resolvem boa parte dos problemas. O restante é testar com teclado e leitor de tela.',
    code: `<label for="email">E-mail</label>
<input
  id="email"
  type="email"
  aria-describedby="email-erro"
/>
<p id="email-erro" role="alert">Informe um e-mail válido.</p>`,
    thumbnailUrl: '/posts/post-04.png',
    tags: ['acessibilidade', 'html', 'front-end'],
    createdAt: '2026-10-20T20:00:00.000Z',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000005',
    authorId: bia.id,
    title: 'Testes de acessibilidade com Playwright e axe',
    content:
      'Um teste automatizado não substitui a revisão manual, mas encontra regressões óbvias em segundos. Este é o fluxo que deixei no projeto para rodar em cada rota.',
    code: `const results = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa'])
  .analyze()

expect(results.violations).toEqual([])`,
    thumbnailUrl: '/posts/post-05.png',
    tags: ['testes', 'acessibilidade', 'playwright'],
    createdAt: '2026-10-20T14:00:00.000Z',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000006',
    authorId: caio.id,
    title: 'Do Figma ao componente: meu processo',
    content:
      'Antes de escrever JSX, eu listo os estados e as variações do componente. Isso evita criar uma API de props que não conversa com o resto da interface.',
    code: `// Primeiro os estados, depois o JSX.
type ButtonProps = {
  variant: 'primary' | 'outline'
  disabled?: boolean
}`,
    thumbnailUrl: '/posts/post-06.png',
    tags: ['figma', 'design system', 'front-end'],
    createdAt: '2026-10-20T08:00:00.000Z',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000007',
    authorId: lara.id,
    title: 'O que aprendi criando uma API com NestJS',
    content:
      'Módulos pequenos, DTOs validando a entrada e guards cuidando da autorização deixam o controller simples. A parte mais difícil foi decidir onde ficava cada regra.',
    code: `@Post()
@UseGuards(JwtAuthGuard)
create(@Body() dto: CreatePostDto, @CurrentUser() user: User) {
  return this.postsService.create(dto, user)
}`,
    thumbnailUrl: '/posts/post-07.png',
    tags: ['nestjs', 'backend', 'api'],
    createdAt: '2026-10-19T22:00:00.000Z',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000008',
    authorId: davi.id,
    title: 'PostgreSQL além do SELECT',
    content:
      'Índices, colunas geradas e full-text search fazem diferença quando o feed começa a crescer. O segredo é medir antes de adicionar complexidade.',
    code: `CREATE INDEX posts_search_idx
ON posts
USING GIN (search_vector);`,
    thumbnailUrl: '/posts/post-08.png',
    tags: ['postgresql', 'banco de dados', 'backend'],
    createdAt: '2026-10-19T16:00:00.000Z',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000009',
    authorId: bia.id,
    title: 'Git no dia a dia: pequenos hábitos que ajudam',
    content:
      'Commits pequenos e mensagens que explicam o porquê tornam o histórico útil. Também passei a revisar o diff antes de cada push.',
    code: `git add -p
git commit -m "extrai filtro de tags do feed"
git log --oneline --graph --decorate`,
    thumbnailUrl: '/posts/post-09.png',
    tags: ['git', 'produtividade'],
    createdAt: '2026-10-19T10:00:00.000Z',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000010',
    authorId: caio.id,
    title: 'Next.js ou Vite? Depende do projeto',
    content:
      'Para um app interno com muita interação, Vite entrega um ciclo curto e simples. Quando SEO e renderização no servidor pesam, Next.js pode ser o caminho.',
    code: `// A pergunta certa não é "qual é melhor?",
// e sim "qual problema este projeto precisa resolver?"`,
    thumbnailUrl: '/posts/post-10.png',
    tags: ['next.js', 'vite', 'front-end'],
    createdAt: '2026-10-18T20:00:00.000Z',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000011',
    authorId: lara.id,
    title: 'Desenhando um sistema de tags acessível',
    content:
      'Tags precisam funcionar com teclado, ter contraste suficiente e não depender só de cor para indicar seleção. Um pequeno checklist salva bastante tempo.',
    code: `<button type="button" aria-pressed={selected}>
  {tag}
</button>`,
    thumbnailUrl: null,
    tags: ['acessibilidade', 'design system', 'ux'],
    createdAt: '2026-10-18T14:00:00.000Z',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000012',
    authorId: davi.id,
    title: 'Meu setup de estudos em 2026',
    content:
      'Menos abas abertas e mais prática deliberada. Conto como organizo os estudos, o que mantenho no papel e como revejo o que aprendi no fim da semana.',
    code: null,
    thumbnailUrl: '/posts/post-12.png',
    tags: ['carreira', 'produtividade'],
    createdAt: '2026-10-18T08:00:00.000Z',
  },
];

const COMMENTS: Array<{
  id: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  content: string;
  createdAt: string;
}> = [
  {
    id: 'b0000000-0000-4000-8000-000000000001',
    postId: POSTS[0].id,
    authorId: caio.id,
    parentId: null,
    content:
      'Gostei de ver a organização por camadas. Você mantém os testes ao lado do componente?',
    createdAt: '2026-10-21T19:00:00.000Z',
  },
  {
    id: 'b0000000-0000-4000-8000-000000000002',
    postId: POSTS[0].id,
    authorId: bia.id,
    parentId: 'b0000000-0000-4000-8000-000000000001',
    content:
      'Sim! O teste fica na mesma pasta do componente. Assim fica mais fácil achar quando algo quebra.',
    createdAt: '2026-10-21T19:20:00.000Z',
  },
  {
    id: 'b0000000-0000-4000-8000-000000000003',
    postId: POSTS[0].id,
    authorId: lara.id,
    parentId: null,
    content: 'Esse exemplo de estrutura caiu como uma luva no meu projeto atual.',
    createdAt: '2026-10-21T20:00:00.000Z',
  },
  {
    id: 'b0000000-0000-4000-8000-000000000004',
    postId: POSTS[1].id,
    authorId: davi.id,
    parentId: null,
    content:
      'O detalhe do minmax(0, 1fr) evita bastante problema quando o conteúdo é maior que a coluna.',
    createdAt: '2026-10-21T13:00:00.000Z',
  },
  {
    id: 'b0000000-0000-4000-8000-000000000005',
    postId: POSTS[3].id,
    authorId: bia.id,
    parentId: null,
    content:
      'O role="alert" é essencial para quem usa leitor de tela. Vale lembrar de ligar o aria-describedby também.',
    createdAt: '2026-10-20T21:00:00.000Z',
  },
  {
    id: 'b0000000-0000-4000-8000-000000000006',
    postId: POSTS[5].id,
    authorId: lara.id,
    parentId: null,
    content: 'Listar as variações antes do código mudou meu jeito de montar componentes.',
    createdAt: '2026-10-20T09:00:00.000Z',
  },
  {
    id: 'b0000000-0000-4000-8000-000000000007',
    postId: POSTS[7].id,
    authorId: caio.id,
    parentId: null,
    content: 'Você chegou a comparar o full-text com um índice trigram?',
    createdAt: '2026-10-19T17:30:00.000Z',
  },
];

const LIKES: Array<[string, string]> = [
  [POSTS[0].id, caio.id],
  [POSTS[0].id, lara.id],
  [POSTS[0].id, davi.id],
  [POSTS[1].id, bia.id],
  [POSTS[1].id, lara.id],
  [POSTS[2].id, bia.id],
  [POSTS[2].id, caio.id],
  [POSTS[3].id, bia.id],
  [POSTS[3].id, caio.id],
  [POSTS[3].id, lara.id],
  [POSTS[4].id, caio.id],
  [POSTS[5].id, bia.id],
  [POSTS[5].id, davi.id],
  [POSTS[6].id, bia.id],
  [POSTS[6].id, caio.id],
  [POSTS[6].id, davi.id],
  [POSTS[7].id, bia.id],
  [POSTS[8].id, lara.id],
  [POSTS[9].id, bia.id],
  [POSTS[9].id, lara.id],
  [POSTS[10].id, caio.id],
];

async function seed(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const dataSource = app.get(DataSource);
    const passwordHash = await hash(DEMO_PASSWORD, 10);
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const user of USERS) {
        await queryRunner.query(
          `
            INSERT INTO "users" ("id", "name", "email", "password_hash")
            VALUES ($1, $2, $3, $4)
            ON CONFLICT ("id") DO UPDATE SET
              "name" = EXCLUDED."name",
              "email" = EXCLUDED."email",
              "password_hash" = EXCLUDED."password_hash"
          `,
          [user.id, user.name, user.email, passwordHash],
        );
      }

      for (const post of POSTS) {
        await queryRunner.query(
          `
            INSERT INTO "posts" (
              "id", "author_id", "title", "content", "code",
              "thumbnail_url", "tags", "created_at", "updated_at"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
            ON CONFLICT ("id") DO UPDATE SET
              "author_id" = EXCLUDED."author_id",
              "title" = EXCLUDED."title",
              "content" = EXCLUDED."content",
              "code" = EXCLUDED."code",
              "thumbnail_url" = EXCLUDED."thumbnail_url",
              "tags" = EXCLUDED."tags",
              "created_at" = EXCLUDED."created_at",
              "updated_at" = EXCLUDED."updated_at"
          `,
          [
            post.id,
            post.authorId,
            post.title,
            post.content,
            post.code,
            post.thumbnailUrl,
            post.tags,
            post.createdAt,
          ],
        );
      }

      for (const comment of COMMENTS) {
        await queryRunner.query(
          `
            INSERT INTO "post_comments" (
              "id", "post_id", "author_id", "parent_id", "content", "created_at"
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT ("id") DO UPDATE SET
              "content" = EXCLUDED."content",
              "parent_id" = EXCLUDED."parent_id"
          `,
          [
            comment.id,
            comment.postId,
            comment.authorId,
            comment.parentId,
            comment.content,
            comment.createdAt,
          ],
        );
      }

      for (const [postId, userId] of LIKES) {
        await queryRunner.query(
          `
            INSERT INTO "post_likes" ("post_id", "user_id")
            VALUES ($1, $2)
            ON CONFLICT ("post_id", "user_id") DO NOTHING
          `,
          [postId, userId],
        );
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    console.log(
      `Seed concluído: ${USERS.length} usuários, ${POSTS.length} posts, ${COMMENTS.length} comentários.`,
    );
    console.log(
      `Login de demonstração: ${USERS[0].email} / ${DEMO_PASSWORD}`,
    );
  } finally {
    await app.close();
  }
}

try {
  await seed();
} catch (error) {
  console.error('Falha ao executar o seed:', error);
  process.exitCode = 1;
}
