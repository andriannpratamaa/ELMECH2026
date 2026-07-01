import api from '@/lib/api';
import type { ApiResponse, Item } from '@/types/admin';

export async function getItems(params?: Record<string, any>): Promise<Item[]> {
  const res = await api.get<ApiResponse<Item[]>>('/items', { params });
  return res.data.data || [];
}

export async function getItemsByLab(labId: number): Promise<Item[]> {
  const res = await api.get<ApiResponse<Item[]>>(`/items/lab/${labId}`);
  return res.data.data || [];
}

export async function getMyItems(): Promise<Item[]> {
  const res = await api.get<ApiResponse<Item[]>>('/items/my');
  return res.data.data || [];
}

export async function getItemById(id: number): Promise<Item | null> {
  const res = await api.get<ApiResponse<Item>>(`/items/${id}`);
  return res.data.data || null;
}

export async function createItem(data: Partial<Item>): Promise<Item> {
  const res = await api.post<ApiResponse<Item>>('/items', data);
  return res.data.data;
}

export async function updateItem(id: number, data: Partial<Item>): Promise<Item> {
  const res = await api.put<ApiResponse<Item>>(`/items/${id}`, data);
  return res.data.data;
}

export async function deleteItem(id: number): Promise<void> {
  await api.delete(`/items/${id}`);
}

export async function getCalibrationAlerts() {
  const res = await api.get("/items/calibration-alerts");
  return res.data.data || [];
}