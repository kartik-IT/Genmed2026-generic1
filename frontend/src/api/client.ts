// ── Base URL detection ──────────────────────────────────────────────
// In development, Vite proxies /api/* to Express (configured in vite.config.ts).
// In production, both are served from the same origin.

const BASE_URL = '';

// Flag to track if backend is available
let backendAvailable = true;

// ── Error types ─────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body?: unknown
  ) {
    super(`API Error ${status}: ${statusText}`);
    this.name = 'ApiError';
  }
}

// ── Core fetch wrapper ──────────────────────────────────────────────

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      
      // Mark backend as unavailable on 502/503/504 errors
      if (response.status === 502 || response.status === 503 || response.status === 504) {
        backendAvailable = false;
        console.warn('[API Client] Backend unavailable, falling back to mock data');
      }
      
      throw new ApiError(response.status, response.statusText, body);
    }

    // Backend is responsive
    backendAvailable = true;
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(408, 'Request timeout');
    }
    
    // Network error - backend likely unavailable
    backendAvailable = false;
    console.warn('[API Client] Network error, falling back to mock data');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

// ── Public methods ──────────────────────────────────────────────────

export async function get<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: 'GET' });
}

export async function post<T>(endpoint: string, body: unknown): Promise<T> {
  return request<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function isBackendAvailable(): boolean {
  return backendAvailable;
}
