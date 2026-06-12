import type { Statistic, SejarahData, TimelineEvent, Achievement } from '@/types';

export const STATISTICS: Statistic[] = [
  { value: 25, suffix: '+', label: 'Program Studi', desc: 'Terakreditasi Unggul & Baik Sekali' },
  { value: 10000, suffix: '+', label: 'Mahasiswa Aktif', desc: 'Tersebar di 4 Fakultas' },
  { value: 500, suffix: '+', label: 'Mitra Industri', desc: 'Kerjasama Nasional & Internasional' },
  { value: 95, suffix: '%', label: 'Penyerapan Kerja', desc: 'Lulusan Terserap dalam 6 Bulan' },
];

export const ABOUT_DATA: SejarahData = {
  sejarah: [
    'Politeknik Perkapalan Negeri Surabaya (PPNS) didirikan pada tahun 1996 sebagai institusi pendidikan vokasi di bidang perkapalan dan maritim. Berawal dari sebuah program studi di bawah naungan ITS, PPNS kemudian berkembang menjadi politeknik negeri yang mandiri dan terkemuka.',
    'Sejak berdiri, PPNS telah mencetak ribuan lulusan yang tersebar di berbagai sektor industri maritim, baik nasional maupun internasional. Dengan motto "Smart Maritime Campus", PPNS terus berinovasi dalam pengembangan pendidikan vokasi yang relevan dengan kebutuhan industri.',
    'Pada tahun 2025, PPNS meraih akreditasi Unggul dari BAN-PT, menegaskan posisinya sebagai salah satu politeknik terbaik di Indonesia. Kini PPNS memiliki 4 fakultas dengan 25 program studi yang mencakup berbagai bidang teknologi maritim.',
  ],
  visi: 'Menjadi politeknik perkapalan yang unggul, inovatif, dan berdaya saing global dalam pengembangan teknologi maritim yang berkelanjutan pada tahun 2030.',
  misi: [
    'Menyelenggarakan pendidikan vokasi di bidang perkapalan dan maritim yang berkualitas dan relevan dengan kebutuhan industri.',
    'Melaksanakan penelitian terapan yang mendukung inovasi teknologi maritim dan keberlanjutan lingkungan.',
    'Mengembangkan sistem pengabdian kepada masyarakat berbasis teknologi tepat guna di sektor maritim.',
    'Membangun kerjasama strategis dengan industri, pemerintah, dan institusi riset baik nasional maupun internasional.',
    'Mewujudkan tata kelola institusi yang transparan, akuntabel, dan berbasis teknologi informasi.',
  ],
  pimpinan: [
    { nama: 'Dr. Ir. Bambang Susilo, M.T.', jabatan: 'Direktur' },
    { nama: 'Dr. Eng. Dewi Sartika, S.T., M.Sc.', jabatan: 'Wakil Direktur I (Akademik)' },
    { nama: 'Ir. Hendra Gunawan, M.T.', jabatan: 'Wakil Direktur II (Keuangan)' },
    { nama: 'Rina Marlina, S.T., M.Kom.', jabatan: 'Wakil Direktur III (Kemahasiswaan)' },
  ],
};

export const TIMELINE: TimelineEvent[] = [
  { year: '1996', title: 'Pendirian PPNS', desc: 'Didirikan sebagai program studi di bawah ITS, fokus pada pendidikan vokasi perkapalan.' },
  { year: '2001', title: 'Politeknik Mandiri', desc: 'Menjadi politeknik negeri mandiri dengan 3 program studi.' },
  { year: '2008', title: 'Ekspansi Program', desc: 'Pengembangan 5 program studi baru dan pembukaan fakultas teknik.' },
  { year: '2015', title: 'Smart Campus', desc: 'Peluncuran inisiatif Smart Maritime Campus dan digitalisasi kampus.' },
  { year: '2020', title: 'Kerjasama Global', desc: 'Jaringan mitra internasional dari 15 negara untuk riset dan pertukaran.' },
  { year: '2025', title: 'Akreditasi Unggul', desc: 'Meraih peringkat Unggul dari BAN-PT dengan 25 program studi.' },
];

export const ACHIEVEMENTS: Achievement[] = [
  { title: 'Juara Umum KKCTBN', desc: 'Kontes Kapal Cepat Indonesia', year: '2026', image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=600&q=80', color: 'from-amber-500 to-orange-600' },
  { title: 'Akreditasi Unggul', desc: 'Peringkat institusi tertinggi dari BAN-PT', year: '2025', image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=600&q=80', color: 'from-blue-500 to-blue-700' },
  { title: 'Hibah Riset Internasional', desc: 'Pendanaan riset maritim dari World Bank', year: '2025', image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&q=80', color: 'from-emerald-500 to-emerald-700' },
  { title: 'Innovation Award', desc: 'Penghargaan inovasi panel surya terapung', year: '2024', image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80', color: 'from-purple-500 to-purple-700' },
];
