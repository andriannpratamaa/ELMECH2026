const mysql = require('mysql2/promise');

const pages = [
  {
    slug: 'beranda',
    title: 'Beranda',
    content: JSON.stringify([
      {
        type: 'hero',
        data: {
          badge: 'Green Campus PPNS',
          title: 'Green Campus',
          subtitle: 'Kampus Berwawasan Lingkungan',
          description: 'Portal informasi Green Campus PPNS — komitmen kami menuju kampus yang hijau, bersih, berkelanjutan, dan ramah lingkungan.',
          button_text: 'Jelajahi Program',
          button_link: '/program',
          stats_badge: 'Sorotan Kampus',
          stats: [
            { value: '25+', label: 'Program Studi' },
            { value: 'A+', label: 'Akreditasi' },
            { value: '10rb+', label: 'Mahasiswa' },
            { value: 'Surabaya', label: 'Kampus Pusat' },
          ],
          stats_footer: 'Pendaftaran Mahasiswa Baru 2026/2027 dibuka',
          image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80',
        },
      },
      {
        type: 'stats',
        data: {
          badge: 'Capaian',
          title: 'Green Campus dalam Angka',
          items: [
            { value: '95%', label: 'Pengurangan Emisi', description: 'Sejak 2020' },
            { value: '12', label: 'Program Hijau', description: 'Aktif berjalan' },
            { value: '5.000+', label: 'Pohon Ditanam', description: 'Di area kampus' },
            { value: '80%', label: 'Daur Ulang', description: 'Sampah terkelola' },
          ],
        },
      },
      {
        type: 'features',
        data: {
          badge: 'Program Kami',
          title: 'Inisiatif',
          highlight: 'Hijau',
          description: 'Berbagai program lingkungan yang kami selenggarakan untuk menciptakan kampus berkelanjutan.',
          items: [
            { icon: '🌱', title: 'Penghijauan Kampus', description: 'Program penanaman pohon dan perawatan taman di seluruh area kampus.' },
            { icon: '♻️', title: 'Bank Sampah', description: 'Pengelolaan sampah terpadu dengan sistem 3R (Reduce, Reuse, Recycle).' },
            { icon: '💡', title: 'Hemat Energi', description: 'Penggunaan panel surya dan lampu LED hemat energi di seluruh gedung.' },
            { icon: '🚲', title: 'Kampus Bersepeda', description: 'Fasilitas parkir sepeda dan jalur khusus untuk mendukung transportasi hijau.' },
            { icon: '💧', title: 'Konservasi Air', description: 'Sistem penampungan air hujan dan pengolahan air limbah terpadu.' },
            { icon: '📚', title: 'Edukasi Hijau', description: 'Seminar dan workshop tentang lingkungan untuk sivitas akademika.' },
          ],
        },
      },
      {
        type: 'gallery',
        data: {
          title: 'Galeri Kegiatan',
          images: [
            { image: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=600&q=80', title: 'Penghijauan Kampus', description: 'Aksi tanam pohon' },
            { image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80', title: 'Bank Sampah', description: 'Pengelolaan sampah' },
            { image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80', title: 'Panel Surya', description: 'Energi terbarukan' },
            { image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=80', title: 'Daur Ulang', description: 'Kreativitas dari limbah' },
            { image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80', title: 'Bersepeda', description: 'Transportasi hijau' },
            { image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80', title: 'Edukasi', description: 'Seminar lingkungan' },
          ],
        },
      },
      {
        type: 'cta',
        data: {
          title: 'Ikuti Perkembangan Green Campus',
          subtitle: 'Dapatkan informasi terbaru seputar program dan kegiatan Green Campus PPNS.',
          buttons: [
            { label: 'Lihat Berita', link: '/berita', variant: 'primary' },
            { label: 'Hubungi Kami', link: '/kontak', variant: 'secondary' },
          ],
        },
      },
    ]),
  },
  {
    slug: 'tentang',
    title: 'Tentang',
    content: JSON.stringify([
      {
        type: 'hero',
        data: {
          badge: 'Tentang Kami',
          title: 'Green Campus',
          subtitle: 'Komitmen Menuju Kampus Berkelanjutan',
          description: 'Green Campus PPNS adalah inisiatif untuk menciptakan lingkungan kampus yang ramah lingkungan, berkelanjutan, dan mendukung pembangunan hijau.',
          button_text: 'Lihat Program',
          button_link: '/program',
          stats_badge: 'Fakta Cepat',
          stats: [
            { value: '2020', label: 'Tahun Mulai' },
            { value: '95%', label: 'Target Emisi' },
            { value: '15+', label: 'Mitra Hijau' },
            { value: '12', label: 'Program Aktif' },
          ],
          image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80',
        },
      },
      {
        type: 'text',
        data: {
          badge: 'Tentang Green Campus',
          title: 'Apa itu',
          highlight: 'Green Campus?',
          body: '<p>Green Campus adalah program yang bertujuan untuk mengintegrasikan prinsip-prinsip keberlanjutan lingkungan ke dalam seluruh aspek operasional kampus. Mulai dari pengelolaan energi, air, sampah, hingga transportasi dan edukasi lingkungan.</p><p>PPNS berkomitmen untuk menjadi pionir dalam penerapan konsep green campus di Indonesia, khususnya di bidang maritim. Dengan melibatkan seluruh sivitas akademika, kami berupaya menciptakan budaya ramah lingkungan yang berkelanjutan.</p>',
        },
      },
      {
        type: 'stats',
        data: {
          badge: 'Angka & Fakta',
          title: 'Capaian',
          highlight: 'Kami',
          items: [
            { value: '95%', label: 'Pengurangan Emisi', description: 'Sejak program dimulai' },
            { value: '5.000+', label: 'Pohon Ditanam', description: 'Di area kampus' },
            { value: '80%', label: 'Daur Ulang Sampah', description: 'Terkelola dengan baik' },
            { value: '12', label: 'Program Aktif', description: 'Berjalan setiap tahun' },
          ],
        },
      },
      {
        type: 'cta',
        data: {
          title: 'Ingin Tahu Lebih Lanjut?',
          subtitle: 'Hubungi kami untuk informasi lebih detail tentang program Green Campus PPNS.',
          buttons: [
            { label: 'Hubungi Kami', link: '/kontak', variant: 'primary' },
            { label: 'Lihat Program', link: '/program', variant: 'secondary' },
          ],
        },
      },
    ]),
  },
  {
    slug: 'program',
    title: 'Program',
    content: JSON.stringify([
      {
        type: 'hero',
        data: {
          badge: 'Program Unggulan',
          title: 'Program',
          subtitle: 'Green Campus PPNS',
          description: 'Berbagai program dan inisiatif hijau yang kami jalankan untuk mewujudkan kampus berwawasan lingkungan.',
          button_text: 'Ikuti Berita',
          button_link: '/berita',
          stats_badge: 'Program Aktif',
          stats: [
            { value: '12', label: 'Program' },
            { value: '6', label: 'Bidang' },
            { value: '100%', label: 'Partisipasi' },
            { value: '2026', label: 'Target Baru' },
          ],
          image: 'https://images.unsplash.com/photo-1581092335391-9583eb1c0f6a?w=1920&q=80',
        },
      },
      {
        type: 'text',
        data: {
          badge: 'Program Kami',
          title: 'Inisiatif',
          highlight: 'Hijau',
          body: '<p>Program Green Campus PPNS mencakup enam bidang utama: penghijauan, energi terbarukan, pengelolaan sampah, konservasi air, transportasi hijau, dan edukasi lingkungan. Setiap program dirancang dengan target yang terukur dan melibatkan partisipasi aktif seluruh sivitas akademika.</p>',
        },
      },
      {
        type: 'features',
        data: {
          title: 'Bidang Program',
          items: [
            { icon: '🌱', title: 'Penghijauan', description: 'Penanaman pohon, taman vertikal, dan ruang terbuka hijau di seluruh area kampus.' },
            { icon: '☀️', title: 'Energi Terbarukan', description: 'Panel surya, lampu LED hemat energi, dan sistem manajemen energi pintar.' },
            { icon: '♻️', title: 'Pengelolaan Sampah', description: 'Bank sampah, komposting, dan program 3R yang melibatkan mahasiswa.' },
            { icon: '💧', title: 'Konservasi Air', description: 'Penampungan air hujan, pengolahan air limbah, dan kampanye hemat air.' },
            { icon: '🚲', title: 'Transportasi Hijau', description: 'Jalur sepeda, shuttle listrik, dan area parkir ramah lingkungan.' },
            { icon: '📖', title: 'Edukasi Lingkungan', description: 'Kurikulum hijau, workshop, dan seminar kesadaran lingkungan.' },
          ],
        },
      },
      {
        type: 'cta',
        data: {
          title: 'Siap Bergabung?',
          subtitle: 'Dukung program Green Campus PPNS dan jadi bagian dari perubahan.',
          buttons: [
            { label: 'Hubungi Kami', link: '/kontak', variant: 'primary' },
            { label: 'Baca Berita', link: '/berita', variant: 'secondary' },
          ],
        },
      },
    ]),
  },
  {
    slug: 'galeri',
    title: 'Galeri',
    content: JSON.stringify([
      {
        type: 'hero',
        data: {
          badge: 'Dokumentasi',
          title: 'Galeri',
          subtitle: 'Green Campus',
          description: 'Dokumentasi kegiatan dan program Green Campus PPNS.',
          image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
        },
      },
      {
        type: 'text',
        data: {
          title: 'Jelajahi',
          highlight: 'Kegiatan Kami',
          body: '<p>Berikut adalah dokumentasi berbagai kegiatan Green Campus yang telah kami laksanakan. Setiap foto mencerminkan komitmen kami terhadap lingkungan yang lebih baik.</p>',
        },
      },
      {
        type: 'gallery',
        data: {
          images: [
            { image: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=600&q=80', title: 'Penghijauan', description: 'Penanaman pohon di area kampus' },
            { image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80', title: 'Pengelolaan Sampah', description: 'Pemilahan sampah terpadu' },
            { image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80', title: 'Panel Surya', description: 'Energi bersih untuk kampus' },
            { image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=80', title: 'Kreativitas Daur Ulang', description: 'Kerajinan dari limbah' },
            { image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80', title: 'Bersepeda', description: 'Go Green transportasi' },
            { image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80', title: 'Seminar Hijau', description: 'Edukasi lingkungan' },
          ],
        },
      },
      {
        type: 'cta',
        data: {
          title: 'Kunjungi Kampus Kami',
          subtitle: 'Lihat langsung program Green Campus PPNS.',
          buttons: [
            { label: 'Hubungi Kami', link: '/kontak', variant: 'primary' },
          ],
        },
      },
    ]),
  },
  {
    slug: 'berita',
    title: 'Berita',
    content: JSON.stringify([
      {
        type: 'hero',
        data: {
          badge: 'Informasi',
          title: 'Berita',
          subtitle: 'Green Campus',
          description: 'Informasi terbaru seputar program Green Campus dan kegiatan lingkungan di PPNS.',
          image: 'https://images.unsplash.com/photo-1504711434969-e33886168d8c?w=1920&q=80',
        },
      },
      {
        type: 'text',
        data: {
          title: 'Headline',
          highlight: 'Terkini',
          body: '<p>Ikuti perkembangan terbaru program Green Campus PPNS melalui berita dan artikel berikut.</p>',
        },
      },
    ]),
  },
  {
    slug: 'kontak',
    title: 'Kontak',
    content: JSON.stringify([
      {
        type: 'hero',
        data: {
          badge: 'Hubungi Kami',
          title: 'Hubungi',
          subtitle: 'Tim Green Campus',
          description: 'Silakan hubungi kami untuk informasi lebih lanjut tentang program Green Campus PPNS.',
          image: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=1920&q=80',
        },
      },
      {
        type: 'features',
        data: {
          title: 'Informasi Kontak',
          items: [
            { icon: '📍', title: 'Alamat', description: 'Jl. Teknik Kimia, Keputih, Sukolilo, Surabaya 60111' },
            { icon: '📞', title: 'Telepon', description: '(031) 594 7464' },
            { icon: '📧', title: 'Email', description: 'green.campus@ppns.ac.id' },
            { icon: '🕐', title: 'Jam Kerja', description: 'Senin - Jumat, 08:00 - 16:00 WIB' },
          ],
        },
      },
      {
        type: 'cta',
        data: {
          title: 'Kunjungi Langsung Kampus PPNS',
          subtitle: 'Datang dan lihat langsung program Green Campus kami.',
          buttons: [
            { label: 'Lihat Peta', link: '#', variant: 'primary' },
            { label: 'Program Kami', link: '/program', variant: 'secondary' },
          ],
        },
      },
    ]),
  },
  {
    slug: 'laporan',
    title: 'Laporan',
    content: JSON.stringify([
      {
        type: 'hero',
        data: {
          badge: 'Dokumen',
          title: 'Laporan',
          subtitle: 'Keberlanjutan',
          description: 'Dokumen dan laporan terkait program Green Campus PPNS yang dapat diunduh.',
          image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1920&q=80',
        },
      },
      {
        type: 'text',
        data: {
          title: 'Dokumen',
          highlight: 'Tersedia',
          body: '<p>Unduh laporan dan dokumen terkait program Green Campus PPNS di sini.</p>',
        },
      },
    ]),
  },
];

async function update() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'green_campus_cms',
    port: 3306,
  });

  for (const p of pages) {
    await conn.query(
      'UPDATE pages SET title = ?, content = ? WHERE slug = ?',
      [p.title, p.content, p.slug]
    );
    console.log(`✓ Updated: ${p.slug}`);
  }

  console.log('\nAll pages updated!');
  await conn.end();
}

update().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
