import { get, post } from './client';

export interface AuthStatus { configured: boolean }
export interface AuthUser { id: string; name?: string; email?: string; picture?: string }

export async function fetchAuthStatus(): Promise<AuthStatus> {
  return get<AuthStatus>('/api/auth/status');
}

export async function fetchCurrentUser(): Promise<{ user: AuthUser }> {
  return get<{ user: AuthUser }>('/api/auth/me');
}

export async function signOut(): Promise<void> {
  await post<void>('/api/auth/logout', {});
}
