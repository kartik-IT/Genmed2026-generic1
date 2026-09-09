import { get } from './client';

export interface AuthStatus { configured: boolean }
export interface AuthUser { id: string; name?: string; email?: string; picture?: string }

export async function fetchAuthStatus(): Promise<AuthStatus> {
  return get<AuthStatus>('/api/auth/status');
}
