import { api } from './client';

export type UserRole = 'ojeador' | 'gestor_productos' | 'direccion';

export interface AuthUser {
  _id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
}

export async function login(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
}

export async function register(payload: {
  email: string;
  password: string;
  fullName: string;
  role?: UserRole;
}): Promise<{ user: AuthUser; token: string }> {
  const res = await api.post('/auth/register', payload);
  return res.data;
}

export async function me(): Promise<{ user: AuthUser }> {
  const res = await api.get('/auth/me');
  return res.data;
}
