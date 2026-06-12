import api from '@/lib/api';
import type { Profile } from '@/types/admin';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  message?: string;
  token?: string;
  user?: Profile;
}

export async function login(payload: LoginPayload): Promise<LoginResult> {
  try {
    const res = await api.post('/auth/login', payload);
    const d = res.data.data || {};
    if (d.token) {
      localStorage.setItem('token', d.token);
      localStorage.setItem('user', JSON.stringify(d.user));
    }
    return { success: true, token: d.token, user: d.user, message: res.data.message };
  } catch (err: any) {
    const message = err.response?.data?.message || 'Login gagal. Periksa email dan password.';
    return { success: false, message };
  }
}

export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function getUser(): Profile | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try { return JSON.parse(raw) as Profile; } catch { return null; }
}

export function removeToken(): void {
  logout();
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
