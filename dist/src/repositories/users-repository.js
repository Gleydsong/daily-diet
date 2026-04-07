"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersRepository = void 0;
const node_crypto_1 = require("node:crypto");
class UsersRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async findByEmail(email) {
        return this.db("users").where({ email }).first();
    }
    async create(input) {
        const [user] = await this.db("users")
            .insert({
            id: (0, node_crypto_1.randomUUID)(),
            name: input.name,
            email: input.email,
            password_hash: input.passwordHash
        })
            .returning("*");
        return user;
    }
}
exports.UsersRepository = UsersRepository;
