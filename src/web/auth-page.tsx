"use client";

import { AlertCircle, ArrowRight, CheckCircle2, Leaf, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { ZodError } from "zod";
import { apiRequest, HttpError } from "./lib/api";
import { authSchema, type FieldErrors, type User } from "./lib/contracts";

type AuthMode = "login" | "register";
type AuthFields = "name" | "email" | "password";

type SessionResponse = {
  user: User;
};

export function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<AuthFields>>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    const data = new FormData(event.currentTarget);
    const input = {
      name: mode === "register" ? String(data.get("name") ?? "") : undefined,
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? "")
    };

    try {
      const parsed = authSchema.parse(input);

      if (mode === "register") {
        if (!parsed.name) {
          setFieldErrors({ name: "Informe seu nome." });
          return;
        }

        await apiRequest<{ user: User }>("/users", {
          method: "POST",
          body: {
            name: parsed.name,
            email: parsed.email,
            password: parsed.password
          }
        });
        setSuccess("Conta criada. Entrando com segurança...");
      }

      await apiRequest<SessionResponse>("/sessions", {
        method: "POST",
        body: {
          email: parsed.email,
          password: parsed.password
        }
      });

      router.push("/dashboard");
      router.refresh();
    } catch (cause) {
      if (cause instanceof ZodError) {
        setFieldErrors(
          cause.issues.reduce<FieldErrors<AuthFields>>((acc, issue) => {
            const key = issue.path[0];
            if (typeof key === "string" && ["name", "email", "password"].includes(key)) {
              acc[key as AuthFields] = issue.message;
            }
            return acc;
          }, {})
        );
        return;
      }

      if (cause instanceof HttpError) {
        setError(cause.status === 409 ? "Este e-mail já está em uso." : cause.message);
        return;
      }

      setError("Não foi possível autenticar agora. Verifique a API e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell auth-page">
      <section className="brand-panel" aria-labelledby="daily-diet-title">
        <div>
          <div className="brand-mark">
            <span className="brand-icon" aria-hidden="true">
              <Leaf size={24} strokeWidth={2.4} />
            </span>
            <span>Daily Diet</span>
          </div>

          <h1 id="daily-diet-title">Rotina alimentar com leitura clara do progresso.</h1>
          <p>
            Registre refeições, identifique consistência dentro da dieta e acompanhe sequências
            positivas sem depender de planilhas ou controles manuais.
          </p>
        </div>

        <div className="insight-grid" aria-label="Destaques do produto">
          <div className="insight">
            <CheckCircle2 size={22} aria-hidden="true" />
            <strong>Foco diário</strong>
            <span>Cadastro rápido por refeição</span>
          </div>
          <div className="insight">
            <LockKeyhole size={22} aria-hidden="true" />
            <strong>Conta segura</strong>
            <span>Sessão em cookie HTTP-only</span>
          </div>
          <div className="insight">
            <Leaf size={22} aria-hidden="true" />
            <strong>Métricas úteis</strong>
            <span>Total, aderência e melhor sequência</span>
          </div>
        </div>
      </section>

      <section className="auth-card" aria-labelledby="auth-title">
        <p className="eyebrow">Acesso</p>
        <h2 id="auth-title">{mode === "login" ? "Entre na sua rotina." : "Crie sua conta."}</h2>
        <p className="muted">
          {mode === "login"
            ? "Use seu e-mail e senha para continuar monitorando suas refeições."
            : "Informe seus dados para começar a acompanhar sua dieta hoje."}
        </p>

        <div className="tabs" role="tablist" aria-label="Tipo de acesso">
          <button
            className="tab"
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            onClick={() => setMode("login")}
          >
            Entrar
          </button>
          <button
            className="tab"
            type="button"
            role="tab"
            aria-selected={mode === "register"}
            onClick={() => setMode("register")}
          >
            Criar conta
          </button>
        </div>

        <form className="form" onSubmit={handleSubmit} noValidate>
          {mode === "register" ? (
            <label className="field">
              <span>Nome</span>
              <input
                name="name"
                type="text"
                autoComplete="name"
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby="name-error"
              />
              <p className="field-error" id="name-error" role="alert">
                {fieldErrors.name}
              </p>
            </label>
          ) : null}

          <label className="field">
            <span>E-mail</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby="email-error"
            />
            <p className="field-error" id="email-error" role="alert">
              {fieldErrors.email}
            </p>
          </label>

          <label className="field">
            <span>Senha</span>
            <input
              name="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby="password-error"
            />
            <p className="field-error" id="password-error" role="alert">
              {fieldErrors.password}
            </p>
          </label>

          {error ? (
            <div className="alert alert-error" role="alert">
              <AlertCircle size={20} aria-hidden="true" />
              <span>{error}</span>
            </div>
          ) : null}

          {success ? (
            <div className="alert alert-success" role="status">
              <CheckCircle2 size={20} aria-hidden="true" />
              <span>{success}</span>
            </div>
          ) : null}

          <button className="button button-primary button-full" type="submit" disabled={loading}>
            <span>{loading ? "Processando..." : mode === "login" ? "Entrar" : "Criar e entrar"}</span>
            <ArrowRight size={20} aria-hidden="true" />
          </button>
        </form>
      </section>
    </main>
  );
}
