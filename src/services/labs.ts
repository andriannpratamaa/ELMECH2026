import api from '@/lib/api';
import type { ApiResponse, Lab } from '@/types/admin';

export async function getLabs(params?: Record<string, any>): Promise<Lab[]> {
  const res = await api.get<ApiResponse<Lab[]>>('/labs', { params });
  return res.data.data || [];
}

export async function getLabById(id: number): Promise<Lab | null> {
  const res = await api.get<ApiResponse<Lab>>(`/labs/${id}`);
  return res.data.data || null;
}

export async function createLab(data: Partial<Lab>): Promise<Lab> {
  const res = await api.post<ApiResponse<Lab>>('/labs', data);
  return res.data.data;
}

export async function updateLab(id: number, data: Partial<Lab>): Promise<Lab> {
  const res = await api.put<ApiResponse<Lab>>(`/labs/${id}`, data);
  return res.data.data;
}

export async function deleteLab(id: number): Promise<void> {
  await api.delete(`/labs/${id}`);
}
