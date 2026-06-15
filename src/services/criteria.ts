import api from '@/lib/api';
import type { ApiResponse, CriteriaCategory, CriteriaSubItem } from '@/types/admin';

export async function createCategory(data: {
  laboratory_id: number;
  item_id: number;
  nama_kategori: string;
  deskripsi?: string;
  urutan?: number;
}): Promise<CriteriaCategory> {
  const res = await api.post<ApiResponse<CriteriaCategory>>('/criteria/category/create', data);
  return res.data.data;
}

export async function getMyCriteria(): Promise<CriteriaCategory[]> {
  const res = await api.get<ApiResponse<CriteriaCategory[]>>('/criteria/my');
  return res.data.data || [];
}

export async function createCategoryWithSubItems(data: {
  laboratory_id: number;
  item_id: number;
  categories: Array<{
    nama_kategori: string;
    deskripsi?: string;
    urutan?: number;
    subitems: Array<{
      nama_subitem: string;
      urutan?: number;
    }>;
  }>;
}): Promise<CriteriaCategory> {
  const res = await api.post<ApiResponse<CriteriaCategory>>('/criteria/category-with-subitems/create', data);
  return res.data.data;
}

export async function createSubItem(data: { name: string; category_id: number }): Promise<CriteriaSubItem> {
  const res = await api.post<ApiResponse<CriteriaSubItem>>('/criteria/subitem/create', data);
  return res.data.data;
}

export async function getPendingCategories(): Promise<CriteriaCategory[]> {
  const res = await api.get<ApiResponse<CriteriaCategory[]>>('/criteria/category/pending');
  console.log("GET /api/criteria/category/pending response:", res.data.data);
  return res.data.data || [];
}

export async function getPendingSubItems(): Promise<CriteriaSubItem[]> {
  const res = await api.get<ApiResponse<CriteriaSubItem[]>>('/criteria/subitem/pending');
  return res.data.data || [];
}

export async function getApprovedCriteria(): Promise<CriteriaCategory[]> {
  const res = await api.get<ApiResponse<CriteriaCategory[]>>('/criteria/approved');
  console.log("GET /api/criteria/approved response:", res.data.data);
  return res.data.data || [];
}

export const getCriteriaByItemId = async (itemId: number): Promise<ApiResponse<CriteriaCategory[]>> => {
  const res = await api.get<ApiResponse<CriteriaCategory[]>>(`/criteria/item/${itemId}`);
  return res.data;
};

export async function approveCategory(id: number): Promise<void> {
  await api.put(`/criteria/category/${id}/approve`);
}

export async function rejectCategory(id: number, alasan_penolakan?: string): Promise<void> {
  await api.put(`/criteria/category/${id}/reject`, { alasan_penolakan });
}

export async function approveSubItem(id: number): Promise<void> {
  await api.put(`/criteria/subitem/${id}/approve`);
}

export async function rejectSubItem(id: number, alasan_penolakan?: string): Promise<void> {
  await api.put(`/criteria/subitem/${id}/reject`, { alasan_penolakan });
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/criteria/category/${id}`);
}

export async function deleteSubItem(id: number): Promise<void> {
  await api.delete(`/criteria/subitem/${id}`);
}

export async function bulkApproveCategories(data: { ids: number[] }): Promise<void> {
  await api.put('/criteria/categories/bulk-approve', data);
}

export async function bulkRejectCategories(data: { ids: number[] }): Promise<void> {
  await api.put('/criteria/categories/bulk-reject', data);
}

export async function updateCategory(id: number, data: {
  nama_kategori: string;
  urutan?: number;
  deskripsi?: string;
}): Promise<CriteriaCategory> {
  const res = await api.put<ApiResponse<CriteriaCategory>>(`/criteria/category/${id}/update`, data);
  return res.data.data;
}

export async function updateSubItem(id: number, data: {
  nama_subitem: string;
  category_id: number;
  urutan?: number;
  deskripsi?: string;
}): Promise<CriteriaSubItem> {
  const res = await api.put<ApiResponse<CriteriaSubItem>>(`/criteria/subitem/${id}/update`, data);
  return res.data.data;
}

export async function updateCategoryWithSubItems(id: number, data: {
  nama_kategori: string;
  urutan?: number;
  deskripsi?: string;
  subitems: Array<{
    id?: number;
    nama_subitem: string;
    urutan?: number;
    deskripsi?: string;
  }>;
}): Promise<CriteriaCategory> {
  const res = await api.put<ApiResponse<CriteriaCategory>>(`/criteria/category-with-subitems/${id}/update`, data);
  return res.data.data;
}
