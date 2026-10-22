import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

/**
 * Registro do usuário na tabela `users`.
 * `passwordHash` é campo interno: nunca sai na resposta da API.
 */
@Entity('users')
export class User {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 60 })
  passwordHash: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
