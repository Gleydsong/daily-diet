"use client";

export type ApiError = {
  code?: string;
  message?: string;
  error?: string;
  details?: unknown;
};

export class HttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly payload: ApiError | null
  ) {
    super(message);
    this.name = "HttpError";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const payload = await readPayload(response);

  if (!response.ok) {
    const apiError = isApiError(payload) ? payload : null;
    throw new HttpError(
      apiError?.message ?? apiError?.error ?? "Não foi possível concluir a operação.",
      response.status,
      apiError
    );
  }

  return payload as T;
}

async function readPayload(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function isApiError(payload: unknown): payload is ApiError {
  return typeof payload === "object" && payload !== null;
}
