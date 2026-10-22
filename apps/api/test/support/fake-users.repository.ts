import { User } from '../../src/users/entities/user.entity.js';

type UserWhere = Partial<Pick<User, 'id' | 'email'>>;

/**
 * Repositório em memória para os testes unitários. Imita apenas o subconjunto
 * de `Repository<User>` usado pelo UsersService.
 */
export class FakeUsersRepository {
  private readonly users = new Map<string, User>();

  async findOne(options: { where?: UserWhere }): Promise<User | null> {
    const where = options.where ?? {};

    for (const user of this.users.values()) {
      if (where.id !== undefined && user.id !== where.id) {
        continue;
      }

      if (where.email !== undefined && user.email !== where.email) {
        continue;
      }

      return user;
    }

    return null;
  }

  create(data: Partial<User>): User {
    return data as User;
  }

  async save(user: User): Promise<User> {
    if (!user.createdAt) {
      user.createdAt = new Date();
    }

    this.users.set(user.id, user);

    return user;
  }

  clear(): void {
    this.users.clear();
  }
}
