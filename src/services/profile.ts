import api from '@/lib/api';
import type { ApiResponse, Profile } from '@/types/admin';

export async function getProfile(): Promise<Profile | null> {
  const res = await api.get<ApiResponse<Profile>>('/auth/profile');
  return res.data.data || null;
}

export async function updateProfile(data: Partial<Profile>): Promise<Profile> {
  const res = await api.put<ApiResponse<Profile>>('/auth/profile', data);
  return res.data.data;
}
