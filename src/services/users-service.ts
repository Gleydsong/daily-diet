import { AppError } from "../errors/app-error";
import { comparePassword, hashPassword } from "../lib/password";
import {
  type UserRecord,
  UsersRepository,
} from "../repositories/users-repository";

type CreateUserInput = {
  name: string;
  email: string;
  password: string;
};

type AuthenticateInput = {
  email: string;
  password: string;
};

export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(input: CreateUserInput): Promise<UserRecord> {
    const existingUser = await this.usersRepository.findByEmail(input.email);
    if (existingUser) {
      throw new AppError("E-mail already in use.", 409);
    }

    const passwordHash = await hashPassword(input.password);

    return this.usersRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });
  }

  async authenticate(input: AuthenticateInput): Promise<UserRecord> {
    const user = await this.usersRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError("Invalid credentials.", 401);
    }

    const isPasswordValid = await comparePassword(
      input.password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new AppError("Invalid credentials.", 401);
    }

    return user;
  }
}
