import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto.js';
import { User } from './entities/user.entity.js';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const email = this.normalizeEmail(dto.email);

    if (await this.findByEmail(email)) {
      throw new ConflictException('Já existe um usuário com este e-mail.');
    }

    const user = this.users.create({
      id: randomUUID(),
      name: dto.name.trim(),
      email,
      passwordHash: await hash(dto.password, SALT_ROUNDS),
    });

    try {
      return await this.users.save(user);
    } catch (error) {
      // A checagem acima cobre o caso comum; a constraint única cobre a
      // corrida entre duas requisições simultâneas com o mesmo e-mail.
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Já existe um usuário com este e-mail.');
      }

      throw error;
    }
  }

  findByEmail(email: string): Promise<User | null> {
    const normalized = this.normalizeEmail(email);

    return this.users.findOne({ where: { email: normalized } });
  }

  findById(id: string): Promise<User | null> {
    return this.users.findOne({ where: { id } });
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private isUniqueViolation(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    const driverError = error.driverError as { code?: string } | undefined;

    return driverError?.code === '23505';
  }
}
