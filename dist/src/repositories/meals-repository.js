"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MealsRepository = void 0;
const node_crypto_1 = require("node:crypto");
class MealsRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(input) {
        const [meal] = await this.db("meals")
            .insert({
            id: (0, node_crypto_1.randomUUID)(),
            user_id: input.userId,
            name: input.name,
            description: input.description,
            occurred_at: input.occurredAt,
            is_on_diet: input.isOnDiet
        })
            .returning("*");
        return meal;
    }
    async findByIdAndUser(id, userId) {
        return this.db("meals").where({ id, user_id: userId }).first();
    }
    async listByUser(userId) {
        return this.db("meals")
            .where({ user_id: userId })
            .orderBy("occurred_at", "desc");
    }
    async listByUserAsc(userId) {
        return this.db("meals")
            .where({ user_id: userId })
            .orderBy("occurred_at", "asc");
    }
    async update(input) {
        const updatedRows = await this.db("meals")
            .where({ id: input.id, user_id: input.userId })
            .update({
            name: input.name,
            description: input.description,
            occurred_at: input.occurredAt,
            is_on_diet: input.isOnDiet,
            updated_at: this.db.fn.now()
        });
        return updatedRows > 0;
    }
    async delete(id, userId) {
        const deletedRows = await this.db("meals").where({ id, user_id: userId }).del();
        return deletedRows > 0;
    }
}
exports.MealsRepository = MealsRepository;
