import { z } from "zod";

export const authSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome.").optional(),
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres.")
});

export const mealFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da refeição."),
  description: z.string().trim().optional(),
  occurredAt: z.string().min(1, "Informe data e hora da refeição."),
  isOnDiet: z.boolean()
});

export type AuthInput = z.infer<typeof authSchema>;
export type MealFormInput = z.infer<typeof mealFormSchema>;

export type User = {
  id: string;
  name: string;
  email: string;
};

export type Meal = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  occurred_at: string;
  is_on_diet: boolean;
  created_at: string;
  updated_at: string;
};

export type Metrics = {
  totalMeals: number;
  totalOnDiet: number;
  totalOffDiet: number;
  bestOnDietStreak: number;
};

export type FieldErrors<T extends string> = Partial<Record<T, string>>;
