/**
 * BuyEway Centralized API Client
 * ─────────────────────────────────────────────────────────────────
 * ARCHITECTURE:
 *   Browser → http://localhost:8000/api/v1  (Node Gateway, port 8000)
 *   Browser → http://localhost:8080          (Go Compute, port 8080)
 *
 * NEXT_PUBLIC_GATEWAY_URL and NEXT_PUBLIC_COMPUTE_URL are baked into
 * the production JS bundle at Docker build time via ARG in Dockerfile.
 *
 * DO NOT use relative paths here — this is a client-side app that
 * makes requests from the USER'S BROWSER, not from inside Docker.
 * The browser cannot resolve container-internal hostnames.
 * ─────────────────────────────────────────────────────────────────
 */

// ── Storage Keys ─────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  TOKEN:     'buyeway_jwt_token',
  USER:      'buyeway_user',
  INQUIRIES: 'buyeway_inquiries',
} as const;

// ── Base URLs (baked in at build time) ───────────────────────────────────────
// Fallback to localhost ports in case build args were not supplied (local `npm run dev`)
export const GATEWAY_URL: string =
  process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8000/api/v1';

export const COMPUTE_URL: string =
  process.env.NEXT_PUBLIC_COMPUTE_URL || 'http://localhost:8080';

// ── Token Store ───────────────────────────────────────────────────────────────
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

export function setSession(token: string, user: Record<string, unknown>): void {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
}

export function getStoredUser<T = Record<string, unknown>>(): T | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEYS.USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// ── Request Helper ────────────────────────────────────────────────────────────
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  auth?: boolean;   // inject Bearer token header
  base?: string;    // override base URL entirely
}

interface ApiError extends Error {
  status: number;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, auth = false, base } = options;
  const baseUrl = base ?? GATEWAY_URL;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (auth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    // Network-level failure (gateway offline, CORS, DNS)
    const err = new Error(
      `Cannot reach server at ${baseUrl}. Is the gateway running?`
    ) as ApiError;
    err.status = 0;
    throw err;
  }

  // Guard: if server returns HTML (e.g. Nginx error page), surface a clear error
  const contentType = response.headers.get('Content-Type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    console.error('[apiClient] Non-JSON response:', response.status, text.slice(0, 200));
    const err = new Error(
      `Server returned an unexpected response (HTTP ${response.status}). The API gateway may be offline or misconfigured.`
    ) as ApiError;
    err.status = response.status;
    throw err;
  }

  const data = await response.json();

  if (!response.ok) {
    const err = new Error(
      data.error || data.message || `Request failed with status ${response.status}`
    ) as ApiError;
    err.status = response.status;
    throw err;
  }

  return data as T;
}

// ── Auth API ──────────────────────────────────────────────────────────────────
export interface AuthPayload {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    supplierId?: number;
    sellerStatus?: string;
    isKycVerified?: boolean;
  };
}

export async function loginApi(email: string, password: string): Promise<AuthPayload> {
  return apiRequest<AuthPayload>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function registerApi(payload: {
  email: string;
  password: string;
  name: string;
  location?: string;
  stateName?: string;
}): Promise<AuthPayload> {
  return apiRequest<AuthPayload>('/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export async function logoutApi(): Promise<void> {
  try {
    await apiRequest('/auth/logout', { method: 'POST', auth: true });
  } catch {
    // Logout is best-effort — always clear local session regardless
  } finally {
    clearSession();
  }
}

export async function getMeApi(): Promise<AuthPayload['user']> {
  return apiRequest<AuthPayload['user']>('/auth/me', { auth: true });
}
