import type { GalleryItem } from '@/types';

export const GALLERY_CATEGORIES = ['Semua', 'Kampus', 'Laboratorium', 'Kegiatan', 'Prestasi'] as const;

export const GALLERY_ITEMS: GalleryItem[] = [
  { title: 'Gedung Rektorat', desc: 'Pusat administrasi dan pelayanan akademik', color: 'from-blue-400 to-blue-600', image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80' },
  { title: 'Lab Maritim', desc: 'Laboratorium riset maritim modern', color: 'from-amber-400 to-amber-600', image: 'https://images.unsplash.com/photo-1581092335391-9583eb1c0f6a?w=800&q=80' },
  { title: 'Perpustakaan', desc: 'Pusat literasi digital dan riset', color: 'from-indigo-400 to-indigo-600', image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80' },
  { title: 'Area Kampus', desc: 'Lingkungan kampus yang asri', color: 'from-emerald-400 to-emerald-600', image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80' },
  { title: 'Ruang Kelas', desc: 'Fasilitas pembelajaran modern', color: 'from-cyan-400 to-cyan-600', image: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&q=80' },
  { title: 'Kapal Riset', desc: 'Kapal riset karya mahasiswa PPNS', color: 'from-rose-400 to-rose-600', image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&q=80' },
  { title: 'Masjid Kampus', desc: 'Pusat kegiatan keagamaan mahasiswa', color: 'from-teal-400 to-teal-600', image: 'https://images.unsplash.com/photo-1581092335391-9583eb1c0f6a?w=800&q=80' },
  { title: 'Student Center', desc: 'Ruang kreativitas dan kegiatan mahasiswa', color: 'from-pink-400 to-pink-600', image: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&q=80' },
  { title: 'Lab Komputer', desc: 'Fasilitas computing dan simulasi maritim', color: 'from-violet-400 to-violet-600', image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80' },
];
