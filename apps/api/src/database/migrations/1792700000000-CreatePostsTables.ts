import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePostsTables1792700000000 implements MigrationInterface {
  name = 'CreatePostsTables1792700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // `array_to_string` não é marcada como IMMUTABLE pelo PostgreSQL, mas para
    // um text[] o resultado é determinístico. O wrapper permite usar a
    // expressão na coluna gerada e no índice GIN de busca.
    await queryRunner.query(`
      CREATE FUNCTION "immutable_array_to_string"(text[])
      RETURNS text
      LANGUAGE sql
      IMMUTABLE
      PARALLEL SAFE
      AS $$ SELECT array_to_string($1, ' ') $$
    `);

    await queryRunner.query(`
      CREATE TABLE "posts" (
        "id" uuid NOT NULL,
        "author_id" uuid NOT NULL,
        "title" varchar(120) NOT NULL,
        "content" text NOT NULL,
        "code" text,
        "thumbnail_url" varchar(500),
        "tags" text[] NOT NULL DEFAULT '{}',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "search_vector" tsvector GENERATED ALWAYS AS (
          setweight(
            to_tsvector(
              'portuguese',
              coalesce("title", '') || ' ' ||
              coalesce("content", '') || ' ' ||
              coalesce("code", '')
            ),
            'A'
          ) ||
          setweight(
            to_tsvector(
              'portuguese',
              coalesce("immutable_array_to_string"("tags"), '')
            ),
            'B'
          )
        ) STORED,
        CONSTRAINT "PK_posts_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_posts_author" FOREIGN KEY ("author_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "post_likes" (
        "post_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_post_likes" PRIMARY KEY ("post_id", "user_id"),
        CONSTRAINT "FK_post_likes_post" FOREIGN KEY ("post_id")
          REFERENCES "posts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_post_likes_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "post_comments" (
        "id" uuid NOT NULL,
        "post_id" uuid NOT NULL,
        "author_id" uuid NOT NULL,
        "parent_id" uuid,
        "content" varchar(2000) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_post_comments_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_post_comments_post" FOREIGN KEY ("post_id")
          REFERENCES "posts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_post_comments_author" FOREIGN KEY ("author_id")
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_post_comments_parent" FOREIGN KEY ("parent_id")
          REFERENCES "post_comments"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      'CREATE INDEX "IDX_posts_author" ON "posts" ("author_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_posts_created_at" ON "posts" ("created_at" DESC)',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_posts_tags" ON "posts" USING GIN ("tags")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_posts_search_vector" ON "posts" USING GIN ("search_vector")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_post_likes_user" ON "post_likes" ("user_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_post_comments_post" ON "post_comments" ("post_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_post_comments_author" ON "post_comments" ("author_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_post_comments_parent" ON "post_comments" ("parent_id")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "post_comments"');
    await queryRunner.query('DROP TABLE "post_likes"');
    await queryRunner.query('DROP TABLE "posts"');
    await queryRunner.query('DROP FUNCTION "immutable_array_to_string"(text[])');
  }
}
