import type { Knex } from "knex";
import { randomUUID } from "node:crypto";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
};

export type CreateUserInput = {
  name: string;
  email: string;
  passwordHash: string;
};

export class UsersRepository {
  constructor(private readonly db: Knex) {}

  async findByEmail(email: string): Promise<UserRecord | undefined> {
    return this.db<UserRecord>("users").where({ email }).first();
  }

  async create(input: CreateUserInput): Promise<UserRecord> {
    const [user] = await this.db<UserRecord>("users")
      .insert({
        id: randomUUID(),
        name: input.name,
        email: input.email,
        password_hash: input.passwordHash
      })
      .returning("*");

    return user;
  }
}
