import api from '@/lib/api';
import type { ApiResponse, Inspection, InspectionDetail, InspectionItem } from '@/types/admin';

function mapMonthlyItem(r: any): InspectionItem {
  const rawCondition = r.status || r.hasil_status || r.condition || r.hasil || r.overall_status || r.nilai || r.kondisi || r.bk || r.label || r.value || r.result || "";
  return {
    id: r.id,
    result_id: r.result_id ?? r.id,
    inspection_id: r.inspection_id,
    item_id: r.item_id ?? r.subitem_id,
    item_name: r.item_name ?? r.nama_subitem,
    condition: rawCondition,
    status: rawCondition,
    notes: r.notes ?? r.keterangan,
    category_name: r.category_name ?? r.nama_kategori,
    category_id: r.category_id ?? r.kategori_id,
  };
}

function flattenItems(monthly_results: any): InspectionItem[] {
  if (!monthly_results) return [];
  if (Array.isArray(monthly_results)) {
    const items: InspectionItem[] = [];
    for (const month of monthly_results) {
      const cats = month.categories || month.category || month.data || [];
      for (const cat of cats) {
        const catName = cat.nama_kategori || cat.category_name || cat.nama || "Lainnya";
        const subItems = cat.items || cat.sub_items || cat.results || cat.subitems || cat.data || [];
        for (const r of subItems) {
          items.push({ ...mapMonthlyItem(r), category_name: catName });
        }
      }
    }
    return items;
  }
  if (monthly_results.categories) {
    const items: InspectionItem[] = [];
    for (const cat of monthly_results.categories) {
      const catName = cat.nama_kategori || cat.category_name || "Lainnya";
      const subItems = cat.items || cat.sub_items || cat.results || [];
      for (const r of subItems) {
        items.push({ ...mapMonthlyItem(r), category_name: catName });
      }
    }
    return items;
  }
  console.warn("[flattenItems] unrecognized structure:", monthly_results);
  return [];
}

export async function getPendingReviews(): Promise<Inspection[]> {
  const res = await api.get<ApiResponse<Inspection[]>>('/inspections/pending-reviews');
  return res.data.data || [];
}

export async function getInspectionDetail(id: number): Promise<InspectionDetail | null> {
  try {
    const res = await api.get<ApiResponse<{ inspection: Record<string, any>; monthly_results: any }>>(`/inspections/detail/${id}`);
    const raw = res.data.data;
    if (!raw) {
      console.warn('[getInspectionDetail] empty data for id:', id);
      return null;
    }
    const { inspection, monthly_results } = raw;
    const result: InspectionDetail = {
      id: inspection.id,
      inspection_id: inspection.inspection_id ?? inspection.id,
      laboratory_id: inspection.laboratory_id,
      lab_name: inspection.nama_lab,
      month: inspection.bulan_ke ?? inspection.month,
      year: inspection.year,
      status: inspection.status,
      approval_status: (inspection.approval_status || inspection.status || "PENDING").toUpperCase(),
      created_at: inspection.tanggal_inspeksi ?? inspection.created_at,
      tanggal_inspeksi: inspection.tanggal_inspeksi,
      inspector_name: inspection.inspector_name,
      inspector_id: inspection.inspector_id,
      item_name: inspection.nama_barang,
      item_code: inspection.kode_barang,
      total_kategori: inspection.total_kategori,
      total_sub_item: inspection.total_sub_item,
      jumlah_b: inspection.jumlah_b,
      jumlah_k: inspection.jumlah_k,
      foto_url: inspection.foto_url,
      alasan_penolakan: inspection.alasan_penolakan,
      catatan: inspection.catatan,
      items: flattenItems(monthly_results),
      monthly_results: monthly_results,
    };
    return result;
  } catch (err) {
    console.error('[getInspectionDetail] error for id:', id, err);
    return null;
  }
}

export async function getInspectionsByMonth(bulan: number): Promise<Inspection[]> {
  const res = await api.get<ApiResponse<Inspection[]>>(`/inspections/month/${bulan}`);
  return res.data.data || [];
}

export async function createInspection(data: {
  item_id: number;
  laboratory_id?: number;
  catatan?: string;
  checklist_results?: { subitem_id: number; status: string; keterangan?: string; bulan_ke?: number }[];
}): Promise<Inspection> {
  const res = await api.post<ApiResponse<Inspection>>('/inspections/create', data);
  return res.data.data;
}

export async function createInspectionMultipart(formData: FormData): Promise<Inspection> {
  const res = await api.post<ApiResponse<Inspection>>('/inspections/create', formData);
  return res.data.data;
}

export async function updateInspectionResult(
  inspectionId: number,
  data: { bulan_ke: number; results: { id?: number; subitem_id?: number; status: string; keterangan?: string }[] },
): Promise<void> {
  await api.put(`/inspections/${inspectionId}/results`, data);
}

export async function getLabSemesters(laboratoryId: number): Promise<{ tahun: number; semester: string }[]> {
  const res = await api.get<{ success: boolean; data: { tahun: number; semester: string }[] }>(
    `/inspections/lab/${laboratoryId}/semesters`
  );
  return res.data.data || [];
}

export async function getInspectionResultsByStatus(
  status: "PENDING" | "APPROVED" | "REJECTED",
  tahun?: number,
  semester?: string,
) {
  const params = new URLSearchParams({ approval_status: status });
  if (tahun) params.set('tahun', String(tahun));
  if (semester) params.set('semester', semester);
  const res = await api.get(`/inspections/results/status?${params.toString()}`);
  return res.data;
}

export async function approveResult(resultId: number): Promise<void> {
  await api.put(`/inspections/result/${resultId}/approve`);
}

export async function rejectResult(resultId: number, alasan_penolakan?: string): Promise<void> {
  await api.put(`/inspections/result/${resultId}/reject`, { alasan_penolakan });
}

export async function bulkApproveResults(data: { ids: number[] }): Promise<void> {
  const res = await api.put('/inspections/results/bulk-approve', data);
}

export async function bulkRejectResults(data: { ids: number[]; alasan_penolakan: string }): Promise<void> {
  const res = await api.put('/inspections/results/bulk-reject', data);
}

export async function approveMonth(id: number, bulan: number): Promise<void> {
  await api.put(`/inspections/${id}/approve-month/${bulan}`);
}

export async function rejectMonth(id: number, bulan: number, alasan_penolakan?: string): Promise<void> {
  await api.put(`/inspections/${id}/reject-month/${bulan}`, { alasan_penolakan });
}

export async function deleteInspection(id: number): Promise<void> {
  await api.delete(`/inspections/${id}`);
}

export async function exportInspection(id: number): Promise<Blob> {
  const res = await api.get(`/inspections/export/${id}`, { responseType: 'blob' });
  return res.data;
}

export async function getMyPendingInspections(): Promise<Inspection[]> {
  const res = await api.get<ApiResponse<Inspection[]>>('/inspections/my-pending');
  return res.data.data || [];
}

export async function updateSingleResult(resultId: number, data: { condition?: string; status?: string; notes?: string }): Promise<void> {
  await api.put(`/inspections/result/${resultId}`, data);
}

export async function exportAllInspections(): Promise<Blob> {
  const res = await api.get('/inspections/export-all', { responseType: 'blob' });
  return res.data;
}

export async function getInspectionByItemId(
  itemId: number,
  tahun?: number,
  semester?: string,
): Promise<{
  exists: boolean;
  inspection_id: number | null;
  tahun: number | null;
  semester: string | null;
  review_status: string | null;
  alasan_penolakan: string | null;
  has_approved_month: boolean;
  filled_months: number;
}> {
  const params = new URLSearchParams();
  if (tahun) params.set('tahun', String(tahun));
  if (semester) params.set('semester', semester);
  const qs = params.toString();
  const res = await api.get<{
    success: boolean;
    exists: boolean;
    inspection_id: number | null;
    tahun: number | null;
    semester: string | null;
    review_status: string | null;
    alasan_penolakan: string | null;
    has_approved_month: boolean;
    filled_months: number;
  }>(`/inspections/by-item/${itemId}${qs ? '?' + qs : ''}`);
  return res.data;
}

export async function checkLabInspectionsStatus(
  labId: number,
  tahun: number,
  semester: string,
): Promise<{
  success: boolean;
  canExport: boolean;
  incompleteInspections: any[];
  totalItems: number;
  completedItems: number;
}> {
  const res = await api.get<{
    success: boolean;
    canExport: boolean;
    incompleteInspections: any[];
    totalItems: number;
    completedItems: number;
  }>('/inspections/check-lab-status', {
    params: { labId, tahun, semester }
  });
  return res.data;
}

export async function exportLabItems(
  labId: number,
  tahun: number,
  semester: string,
): Promise<void> {
  const response = await api.get('/inspections/export-lab', {
    params: { labId, tahun, semester },
    responseType: 'blob'
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Export_Lab_${labId}_${tahun}_${semester}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.parentElement?.removeChild(link);
  window.URL.revokeObjectURL(url);
}
