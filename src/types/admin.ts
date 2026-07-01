export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface User {
  id: number;
  name: string;
  email: string;
  nip?: string;
  role: "admin" | "kalab" | "plp" | "teknisi";
  password?: string;
  laboratory_id?: number | null;
  lab_name?: string;
  created_at?: string;
}

export interface Lab {
  id: number;
  nama_lab: string;
  lokasi?: string;

  kalab_id?: number | null;
  kalab_name?: string;

  plp_id?: number | null;
  teknisi_id?: number | null;

  plp_name?: string;
  teknisi_name?: string;

  items_count?: number;
  item_ids?: string;
  items?: Item[];
  report_file?: string;
  created_at?: string;
}

export interface Item {
  id: number;
  nama_barang: string;
  kode_barang?: string;
  pembuat_alat?: string;
  tanggal_pembelian?: string;
  tanggal_kalibrasi_terakhir?: string;
  tanggal_kalibrasi_berikutnya?: string;
  categories?: CriteriaCategory[];
  inspection_count?: number;
  category_count?: number;
  created_at?: string;
}

export interface Inspection {
  id: number;
  inspection_id?: number;
  laboratory_id?: number;
  lab_name?: string;
  month?: number;
  year?: number;
  status?: string;
  approval_status?: string;
  review_status?: string;
  created_at?: string;
  tanggal_inspeksi?: string;
  inspector_name?: string;
  inspector_id?: number;
  item_name?: string;
  item_code?: string;
  total_kategori?: number;
  total_sub_item?: number;
  jumlah_b?: number;
  jumlah_k?: number;
  foto_url?: string;
  alasan_penolakan?: string;
  catatan?: string;
  tahun?: number;
  semester?: string;
}

export interface MonthlyGroup {
  bulan_ke: number;
  categories: {
    category_id: number;
    nama_kategori: string;
    urutan?: number;
    items: {
      id: number;
      subitem_id?: number;
      nama_subitem: string;
      status?: string;
      keterangan?: string;
      approval_status?: string;
      alasan_penolakan?: string;
    }[];
  }[];
  statistics?: {
    total_items?: number;
    baik?: number;
    kurang?: number;
    na?: number;
    overall_status?: string;
  };
  review?: {
    review_status?: string;
    reviewed_by?: number | null;
    reviewer_name?: string | null;
    alasan_penolakan?: string | null;
    reviewed_at?: string | null;
  };
}

export interface InspectionDetail extends Inspection {
  items?: InspectionItem[];
  monthly_results?: MonthlyGroup[];
}

export interface InspectionItem {
  id: number;
  result_id?: number;
  inspection_id?: number;
  item_id?: number;
  item_name?: string;
  item_code?: string;
  condition?: string;
  status?: string;
  notes?: string;
  category_name?: string;
  category_id?: number;
}

export interface CriteriaCategory {
  id: number;
  nama_kategori: string;
  deskripsi?: string;
  urutan?: number;
  laboratory_id?: number;
  laboratory?: Lab;
  item_id?: number;
  item_ids?: number[];
  items?: Item[];
  item_names?: string;
  status?: string;
  alasan_penolakan?: string;
  sub_items?: CriteriaSubItem[];
  subitems?: CriteriaSubItem[];
  created_at?: string;
}

export interface CriteriaSubItem {
  id: number;
  nama_subitem: string;
  urutan?: number;
  kategori_id?: number;
  category_id?: number;
  category_name?: string;
  laboratory_id?: number;
  status?: string;
  alasan_penolakan?: string;
  created_at?: string;
}

export interface Profile {
  id: number;
  name: string;
  email: string;
  nip?: string;
  role: "admin" | "kalab" | "plp" | "teknisi";
  laboratory_id?: number | null;
  lab_name?: string;
}
