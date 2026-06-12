import api from '@/lib/api';
import type { ApiResponse, User } from '@/types/admin';

export async function getUsers(params?: Record<string, any>): Promise<User[]> {
  const res = await api.get<ApiResponse<User[]>>('/users', { params });
  return res.data.data || [];
}

export async function getUserById(id: number): Promise<User | null> {
  const res = await api.get<ApiResponse<User>>(`/users/${id}`);
  return res.data.data || null;
}

export async function createUser(data: Partial<User>): Promise<User> {
  const res = await api.post<ApiResponse<User>>('/users', data);
  return res.data.data;
}

export async function updateUser(id: number, data: Partial<User>): Promise<User> {
  const res = await api.put<ApiResponse<User>>(`/users/${id}`, data);
  return res.data.data;
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/users/${id}`);
}
