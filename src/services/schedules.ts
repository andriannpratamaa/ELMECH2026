import api from '@/lib/api';
import type { ApiResponse, Schedule } from '@/types/admin';

export async function getSchedules(params?: Record<string, any>): Promise<Schedule[]> {
  const res = await api.get<ApiResponse<Schedule[]>>('/schedules', { params });
  return res.data.data || [];
}

export async function getSchedulesByLab(labId: number): Promise<Schedule[]> {
  const res = await api.get<ApiResponse<Schedule[]>>(`/schedules/lab/${labId}`);
  return res.data.data || [];
}

export async function getScheduleById(id: number): Promise<Schedule | null> {
  const res = await api.get<ApiResponse<Schedule>>(`/schedules/${id}`);
  return res.data.data || null;
}

export async function createSchedule(data: Partial<Schedule>): Promise<Schedule> {
  const res = await api.post<ApiResponse<Schedule>>('/schedules', data);
  return res.data.data;
}

export async function updateSchedule(id: number, data: Partial<Schedule>): Promise<Schedule> {
  const res = await api.put<ApiResponse<Schedule>>(`/schedules/${id}`, data);
  return res.data.data;
}

export async function deleteSchedule(id: number): Promise<void> {
  await api.delete(`/schedules/${id}`);
}
