"use client";

import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Flame,
  Leaf,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Utensils,
  XCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { ZodError } from "zod";
import { apiRequest, HttpError } from "./lib/api";
import { type FieldErrors, type Meal, mealFormSchema, type MealFormInput, type Metrics } from "./lib/contracts";
import { formatDateTime, formatPercent, toDateTimeLocalValue, toIsoFromDateTimeLocal } from "./lib/formatters";

type MealFields = keyof MealFormInput;

type MealsResponse = {
  meals: Meal[];
};

type MetricsResponse = {
  metrics: Metrics;
};

type MealResponse = {
  meal: Meal;
};

const emptyMetrics: Metrics = {
  totalMeals: 0,
  totalOnDiet: 0,
  totalOffDiet: 0,
  bestOnDietStreak: 0
};

const initialForm: MealFormInput = {
  name: "",
  description: "",
  occurredAt: "",
  isOnDiet: true
};

export function DashboardPage() {
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [metrics, setMetrics] = useState<Metrics>(emptyMetrics);
  const [form, setForm] = useState<MealFormInput>(initialForm);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<MealFields>>({});

  const onDietRatio = useMemo(() => {
    if (metrics.totalMeals === 0) {
      return 0;
    }

    return metrics.totalOnDiet / metrics.totalMeals;
  }, [metrics.totalMeals, metrics.totalOnDiet]);

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError(null);

    try {
      const [mealsResult, metricsResult] = await Promise.all([
        apiRequest<MealsResponse>("/meals"),
        apiRequest<MetricsResponse>("/meals/metrics")
      ]);

      setMeals(mealsResult.meals);
      setMetrics(metricsResult.metrics);
    } catch (cause) {
      if (cause instanceof HttpError && cause.status === 401) {
        router.replace("/");
        return;
      }

      setError("Não foi possível carregar suas refeições. Verifique se a API está ativa.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);
    setFieldErrors({});

    try {
      const parsed = mealFormSchema.parse(form);
      const payload = {
        name: parsed.name,
        description: parsed.description?.trim() ? parsed.description.trim() : null,
        occurredAt: toIsoFromDateTimeLocal(parsed.occurredAt),
        isOnDiet: parsed.isOnDiet
      };

      if (editingMealId) {
        await apiRequest<null>(`/meals/${editingMealId}`, {
          method: "PUT",
          body: payload
        });
        setMessage("Refeição atualizada.");
      } else {
        await apiRequest<MealResponse>("/meals", {
          method: "POST",
          body: payload
        });
        setMessage("Refeição registrada.");
      }

      resetForm();
      await loadDashboard();
    } catch (cause) {
      if (cause instanceof ZodError) {
        setFieldErrors(
          cause.issues.reduce<FieldErrors<MealFields>>((acc, issue) => {
            const key = issue.path[0];
            if (typeof key === "string" && ["name", "description", "occurredAt", "isOnDiet"].includes(key)) {
              acc[key as MealFields] = issue.message;
            }
            return acc;
          }, {})
        );
        return;
      }

      setError(cause instanceof HttpError ? cause.message : "Não foi possível salvar a refeição.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(meal: Meal) {
    const confirmed = window.confirm(`Excluir "${meal.name}"? Esta ação não pode ser desfeita.`);
    if (!confirmed) {
      return;
    }

    setError(null);
    setMessage(null);

    try {
      await apiRequest<null>(`/meals/${meal.id}`, { method: "DELETE" });
      setMessage("Refeição excluída.");
      await loadDashboard();
    } catch (cause) {
      setError(cause instanceof HttpError ? cause.message : "Não foi possível excluir a refeição.");
    }
  }

  async function handleLogout() {
    await apiRequest<null>("/sessions", { method: "DELETE" });
    router.replace("/");
    router.refresh();
  }

  function startEdit(meal: Meal) {
    setEditingMealId(meal.id);
    setForm({
      name: meal.name,
      description: meal.description ?? "",
      occurredAt: toDateTimeLocalValue(meal.occurred_at),
      isOnDiet: meal.is_on_diet
    });
    setFieldErrors({});
    setMessage(null);
    setError(null);
  }

  function resetForm() {
    setEditingMealId(null);
    setForm(initialForm);
    setFieldErrors({});
  }

  return (
    <main className="dashboard-page">
      <div className="shell">
        <header className="topbar">
          <div className="nav-brand" aria-label="Daily Diet">
            <span className="brand-icon" aria-hidden="true">
              <Leaf size={22} strokeWidth={2.4} />
            </span>
            <span>Daily Diet</span>
          </div>

          <button className="button button-secondary" type="button" onClick={handleLogout}>
            <LogOut size={18} aria-hidden="true" />
            <span>Sair</span>
          </button>
        </header>

        <section className="dashboard-header" aria-labelledby="dashboard-title">
          <div className="dashboard-heading">
            <p className="eyebrow">Dashboard</p>
            <h1 id="dashboard-title">Sua consistência alimentar.</h1>
            <p className="muted">
              Registre, revise e acompanhe refeições dentro e fora da dieta com métricas calculadas pelo backend.
            </p>
          </div>

          <button className="button button-secondary" type="button" onClick={() => void loadDashboard()} disabled={loading}>
            <RefreshCw size={18} aria-hidden="true" />
            <span>{loading ? "Atualizando..." : "Atualizar"}</span>
          </button>
        </section>

        <section className="metrics-grid" aria-label="Métricas de refeições">
          <Metric title="Total de refeições" value={metrics.totalMeals} icon={<Utensils size={20} aria-hidden="true" />} />
          <Metric title="Dentro da dieta" value={metrics.totalOnDiet} icon={<CheckCircle2 size={20} aria-hidden="true" />} />
          <Metric title="Fora da dieta" value={metrics.totalOffDiet} icon={<XCircle size={20} aria-hidden="true" />} />
          <Metric title="Melhor sequência" value={metrics.bestOnDietStreak} icon={<Flame size={20} aria-hidden="true" />} />
        </section>

        <section className="summary-panel" aria-label="Aderência à dieta" style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <h2>{formatPercent(onDietRatio)} dentro da dieta</h2>
              <p className="muted" style={{ marginBottom: 0 }}>
                Proporção baseada nas refeições cadastradas para sua conta.
              </p>
            </div>
            <strong style={{ fontVariantNumeric: "tabular-nums", fontSize: "1.35rem" }}>
              {metrics.totalOnDiet}/{metrics.totalMeals}
            </strong>
          </div>
          <div className="progress-shell" aria-hidden="true" style={{ marginTop: 18 }}>
            <div className="progress-bar" style={{ width: `${Math.round(onDietRatio * 100)}%` }} />
          </div>
        </section>

        <div className="dashboard-grid">
          <section className="meal-form-panel" aria-labelledby="meal-form-title">
            <p className="eyebrow">{editingMealId ? "Edição" : "Novo registro"}</p>
            <h2 id="meal-form-title">{editingMealId ? "Editar refeição" : "Registrar refeição"}</h2>
            <p className="muted">Campos obrigatórios são validados antes de enviar ao backend.</p>

            <form className="form" onSubmit={handleSubmit} noValidate>
              <label className="field">
                <span>Nome da refeição</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby="meal-name-error"
                />
                <p className="field-error" id="meal-name-error" role="alert">
                  {fieldErrors.name}
                </p>
              </label>

              <label className="field">
                <span>Descrição</span>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  aria-invalid={Boolean(fieldErrors.description)}
                  aria-describedby="meal-description-error"
                />
                <p className="field-error" id="meal-description-error" role="alert">
                  {fieldErrors.description}
                </p>
              </label>

              <div className="form-row">
                <label className="field">
                  <span>Data e hora</span>
                  <input
                    type="datetime-local"
                    value={form.occurredAt}
                    onChange={(event) => setForm((current) => ({ ...current, occurredAt: event.target.value }))}
                    aria-invalid={Boolean(fieldErrors.occurredAt)}
                    aria-describedby="meal-date-error"
                  />
                  <p className="field-error" id="meal-date-error" role="alert">
                    {fieldErrors.occurredAt}
                  </p>
                </label>

                <div className="diet-toggle">
                  <span className="toggle-label">Status</span>
                  <div className="toggle-options">
                    <button
                      className="toggle-option"
                      type="button"
                      aria-pressed={form.isOnDiet}
                      onClick={() => setForm((current) => ({ ...current, isOnDiet: true }))}
                    >
                      Dentro
                    </button>
                    <button
                      className="toggle-option toggle-option-danger"
                      type="button"
                      aria-pressed={!form.isOnDiet}
                      onClick={() => setForm((current) => ({ ...current, isOnDiet: false }))}
                    >
                      Fora
                    </button>
                  </div>
                </div>
              </div>

              {error ? (
                <div className="alert alert-error" role="alert">
                  <AlertCircle size={20} aria-hidden="true" />
                  <span>{error}</span>
                </div>
              ) : null}

              {message ? (
                <div className="alert alert-success" role="status">
                  <CheckCircle2 size={20} aria-hidden="true" />
                  <span>{message}</span>
                </div>
              ) : null}

              <button className="button button-primary button-full" type="submit" disabled={submitting}>
                <Plus size={19} aria-hidden="true" />
                <span>{submitting ? "Salvando..." : editingMealId ? "Salvar alterações" : "Registrar refeição"}</span>
              </button>

              {editingMealId ? (
                <button className="button button-secondary button-full" type="button" onClick={resetForm}>
                  Cancelar edição
                </button>
              ) : null}
            </form>
          </section>

          <section className="summary-panel" aria-labelledby="meal-list-title">
            <p className="eyebrow">Histórico</p>
            <h2 id="meal-list-title">Refeições recentes</h2>

            {loading ? (
              <div className="meal-list" aria-label="Carregando refeições">
                <div className="skeleton" />
                <div className="skeleton" />
                <div className="skeleton" />
              </div>
            ) : meals.length === 0 ? (
              <div className="empty-state">
                <div>
                  <CalendarClock size={40} aria-hidden="true" />
                  <h3>Nenhuma refeição cadastrada</h3>
                  <p className="muted">Comece pelo formulário ao lado para gerar suas métricas.</p>
                </div>
              </div>
            ) : (
              <div className="meal-list">
                {meals.map((meal) => (
                  <article className="meal-card" key={meal.id}>
                    <div>
                      <div className="meal-title">
                        <strong>{meal.name}</strong>
                        <span className={meal.is_on_diet ? "badge badge-success" : "badge badge-danger"}>
                          {meal.is_on_diet ? "Dentro da dieta" : "Fora da dieta"}
                        </span>
                      </div>
                      <p className="muted" style={{ margin: "0 0 8px" }}>
                        {meal.description || "Sem descrição informada."}
                      </p>
                      <div className="meal-meta">
                        <span>{formatDateTime(meal.occurred_at)}</span>
                      </div>
                    </div>

                    <div className="meal-actions" aria-label={`Ações para ${meal.name}`}>
                      <button className="icon-button" type="button" onClick={() => startEdit(meal)} aria-label={`Editar ${meal.name}`}>
                        <Pencil size={18} aria-hidden="true" />
                      </button>
                      <button
                        className="icon-button icon-button-danger"
                        type="button"
                        onClick={() => void handleDelete(meal)}
                        aria-label={`Excluir ${meal.name}`}
                      >
                        <Trash2 size={18} aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function Metric({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="metric">
      <div className="metric-title">
        <span>{title}</span>
        {icon}
      </div>
      <strong>{value}</strong>
    </div>
  );
}
