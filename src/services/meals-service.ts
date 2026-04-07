import { AppError } from "../errors/app-error";
import { type MealRecord, MealsRepository } from "../repositories/meals-repository";

type CreateMealInput = {
  userId: string;
  name: string;
  description: string | null;
  occurredAt: Date;
  isOnDiet: boolean;
};

type UpdateMealInput = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  occurredAt: Date;
  isOnDiet: boolean;
};

type DeleteMealInput = {
  id: string;
  userId: string;
};

type Metrics = {
  totalMeals: number;
  totalOnDiet: number;
  totalOffDiet: number;
  bestOnDietStreak: number;
};

export class MealsService {
  constructor(private readonly mealsRepository: MealsRepository) {}

  async create(input: CreateMealInput): Promise<MealRecord> {
    return this.mealsRepository.create(input);
  }

  async getById(id: string, userId: string): Promise<MealRecord> {
    const meal = await this.mealsRepository.findByIdAndUser(id, userId);
    if (!meal) {
      throw new AppError("Meal not found.", 404);
    }

    return meal;
  }

  async listByUser(userId: string): Promise<MealRecord[]> {
    return this.mealsRepository.listByUser(userId);
  }

  async update(input: UpdateMealInput): Promise<void> {
    const updated = await this.mealsRepository.update(input);
    if (!updated) {
      throw new AppError("Meal not found.", 404);
    }
  }

  async delete(input: DeleteMealInput): Promise<void> {
    const deleted = await this.mealsRepository.delete(input.id, input.userId);
    if (!deleted) {
      throw new AppError("Meal not found.", 404);
    }
  }

  async metrics(userId: string): Promise<Metrics> {
    const meals = await this.mealsRepository.listByUserAsc(userId);

    let totalOnDiet = 0;
    let currentStreak = 0;
    let bestOnDietStreak = 0;

    for (const meal of meals) {
      if (meal.is_on_diet) {
        totalOnDiet += 1;
        currentStreak += 1;
        if (currentStreak > bestOnDietStreak) {
          bestOnDietStreak = currentStreak;
        }
      } else {
        currentStreak = 0;
      }
    }

    const totalMeals = meals.length;

    return {
      totalMeals,
      totalOnDiet,
      totalOffDiet: totalMeals - totalOnDiet,
      bestOnDietStreak
    };
  }
}
