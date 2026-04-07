import type { Knex } from "knex";
import { randomUUID } from "node:crypto";

export type MealRecord = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  occurred_at: Date;
  is_on_diet: boolean;
  created_at: Date;
  updated_at: Date;
};

export type CreateMealInput = {
  userId: string;
  name: string;
  description: string | null;
  occurredAt: Date;
  isOnDiet: boolean;
};

export type UpdateMealInput = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  occurredAt: Date;
  isOnDiet: boolean;
};

export class MealsRepository {
  constructor(private readonly db: Knex) {}

  async create(input: CreateMealInput): Promise<MealRecord> {
    const [meal] = await this.db<MealRecord>("meals")
      .insert({
        id: randomUUID(),
        user_id: input.userId,
        name: input.name,
        description: input.description,
        occurred_at: input.occurredAt,
        is_on_diet: input.isOnDiet
      })
      .returning("*");

    return meal;
  }

  async findByIdAndUser(id: string, userId: string): Promise<MealRecord | undefined> {
    return this.db<MealRecord>("meals").where({ id, user_id: userId }).first();
  }

  async listByUser(userId: string): Promise<MealRecord[]> {
    return this.db<MealRecord>("meals")
      .where({ user_id: userId })
      .orderBy("occurred_at", "desc");
  }

  async listByUserAsc(userId: string): Promise<MealRecord[]> {
    return this.db<MealRecord>("meals")
      .where({ user_id: userId })
      .orderBy("occurred_at", "asc");
  }

  async update(input: UpdateMealInput): Promise<boolean> {
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

  async delete(id: string, userId: string): Promise<boolean> {
    const deletedRows = await this.db("meals").where({ id, user_id: userId }).del();
    return deletedRows > 0;
  }
}
