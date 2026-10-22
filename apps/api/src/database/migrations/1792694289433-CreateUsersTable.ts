import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1792694289433 implements MigrationInterface {
  name = 'CreateUsersTable1792694289433';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL,
        "name" varchar(100) NOT NULL,
        "email" varchar(255) NOT NULL,
        "password_hash" varchar(60) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "users"');
  }
}
