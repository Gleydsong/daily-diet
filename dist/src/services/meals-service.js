"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MealsService = void 0;
const app_error_1 = require("../errors/app-error");
class MealsService {
    mealsRepository;
    constructor(mealsRepository) {
        this.mealsRepository = mealsRepository;
    }
    async create(input) {
        return this.mealsRepository.create(input);
    }
    async getById(id, userId) {
        const meal = await this.mealsRepository.findByIdAndUser(id, userId);
        if (!meal) {
            throw new app_error_1.AppError("Meal not found.", 404);
        }
        return meal;
    }
    async listByUser(userId) {
        return this.mealsRepository.listByUser(userId);
    }
    async update(input) {
        const updated = await this.mealsRepository.update(input);
        if (!updated) {
            throw new app_error_1.AppError("Meal not found.", 404);
        }
    }
    async delete(input) {
        const deleted = await this.mealsRepository.delete(input.id, input.userId);
        if (!deleted) {
            throw new app_error_1.AppError("Meal not found.", 404);
        }
    }
    async metrics(userId) {
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
            }
            else {
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
exports.MealsService = MealsService;
