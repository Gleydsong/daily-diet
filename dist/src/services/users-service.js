"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const app_error_1 = require("../errors/app-error");
const password_1 = require("../lib/password");
class UsersService {
    usersRepository;
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async create(input) {
        const existingUser = await this.usersRepository.findByEmail(input.email);
        if (existingUser) {
            throw new app_error_1.AppError("E-mail already in use.", 409);
        }
        const passwordHash = await (0, password_1.hashPassword)(input.password);
        return this.usersRepository.create({
            name: input.name,
            email: input.email,
            passwordHash,
        });
    }
    async authenticate(input) {
        const user = await this.usersRepository.findByEmail(input.email);
        if (!user) {
            throw new app_error_1.AppError("Invalid credentials.", 401);
        }
        const isPasswordValid = await (0, password_1.comparePassword)(input.password, user.password_hash);
        if (!isPasswordValid) {
            throw new app_error_1.AppError("Invalid credentials.", 401);
        }
        return user;
    }
}
exports.UsersService = UsersService;
