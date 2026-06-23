export type Semester = 'GANJIL' | 'GENAP';

export interface TahunSemester {
  tahun: number;
  semester: Semester;
  label: string;
}

/**
 * Mapping bulan → semester:
 * Ganjil = Agustus (8) - Januari (1)
 * Genap  = Februari (2) - Juli (7)
 */

/** Tentukan semester berdasarkan bulan (1-12) */
export function bulanToSemester(bulan: number): Semester {
  if (bulan >= 2 && bulan <= 7) return 'GENAP';
  return 'GANJIL';
}

/** Dapatkan tahun+semester untuk tanggal tertentu */
export function getTahunSemester(date: Date = new Date()): TahunSemester {
  const bulan = date.getMonth() + 1;
  let tahun = date.getFullYear();
  const semester = bulanToSemester(bulan);
  // Januari masuk Ganjil tahun sebelumnya
  if (bulan === 1) tahun -= 1;
  return { tahun, semester, label: `${tahun} - ${semester}` };
}

/** Dapatkan label untuk tampilan dropdown */
export function formatTahunSemester(tahun: number, semester: Semester): string {
  const label = semester === 'GANJIL' ? 'Ganjil' : 'Genap';
  return `${tahun} - ${label}`;
}

/** Apakah periode (tahun, semester) sudah lewat (read-only)? */
export function isPeriodPast(tahun: number, semester: Semester): boolean {
  const current = getTahunSemester();
  if (tahun < current.tahun) return true;
  if (tahun > current.tahun) return false;
  // tahun sama, bandingkan semester
  const order: Record<Semester, number> = { GANJIL: 0, GENAP: 1 };
  return order[semester] < order[current.semester];
}

/** Buat daftar pilihan dari data inspeksi + periode saat ini */
export function buildSemesterOptions(
  existing: { tahun: number; semester: Semester }[],
): TahunSemester[] {
  const current = getTahunSemester();
  const map = new Map<string, TahunSemester>();

  // existing data
  for (const e of existing) {
    const key = `${e.tahun}-${e.semester}`;
    if (!map.has(key)) {
      map.set(key, { ...e, label: formatTahunSemester(e.tahun, e.semester) });
    }
  }

  // current period (might not have data yet)
  const key = `${current.tahun}-${current.semester}`;
  if (!map.has(key)) {
    map.set(key, current);
  }

  return Array.from(map.values()).sort((a, b) => {
    if (a.tahun !== b.tahun) return b.tahun - a.tahun;
    return a.semester === b.semester ? 0 : a.semester === 'GANJIL' ? -1 : 1;
  });
}
