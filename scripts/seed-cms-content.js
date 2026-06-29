const http = require("http");

const API = "http://localhost:5001/api";

// ==============================
// SOURCE DATA
// ==============================

const STATISTICS = [
  { value: 25, suffix: "+", label: "Program Studi", desc: "Terakreditasi Unggul & Baik Sekali" },
  { value: 10000, suffix: "+", label: "Mahasiswa Aktif", desc: "Tersebar di 4 Fakultas" },
  { value: 500, suffix: "+", label: "Mitra Industri", desc: "Kerjasama Nasional & Internasional" },
  { value: 95, suffix: "%", label: "Penyerapan Kerja", desc: "Lulusan Terserap dalam 6 Bulan" },
];

const SEJARAH = [
  "Politeknik Perkapalan Negeri Surabaya (PPNS) didirikan pada tahun 1996 sebagai institusi pendidikan vokasi di bidang perkapalan dan maritim. Berawal dari sebuah program studi di bawah naungan ITS, PPNS kemudian berkembang menjadi politeknik negeri yang mandiri dan terkemuka.",
  'Sejak berdiri, PPNS telah mencetak ribuan lulusan yang tersebar di berbagai sektor industri maritim, baik nasional maupun internasional. Dengan motto "Smart Maritime Campus", PPNS terus berinovasi dalam pengembangan pendidikan vokasi yang relevan dengan kebutuhan industri.',
  "Pada tahun 2025, PPNS meraih akreditasi Unggul dari BAN-PT, menegaskan posisinya sebagai salah satu politeknik terbaik di Indonesia. Kini PPNS memiliki 4 fakultas dengan 25 program studi yang mencakup berbagai bidang teknologi maritim.",
];

const TIMELINE = [
  { year: "1996", title: "Pendirian PPNS", desc: "Didirikan sebagai program studi di bawah ITS, fokus pada pendidikan vokasi perkapalan." },
  { year: "2001", title: "Politeknik Mandiri", desc: "Menjadi politeknik negeri mandiri dengan 3 program studi." },
  { year: "2008", title: "Ekspansi Program", desc: "Pengembangan 5 program studi baru dan pembukaan fakultas teknik." },
  { year: "2015", title: "Smart Campus", desc: "Peluncuran inisiatif Smart Maritime Campus dan digitalisasi kampus." },
  { year: "2020", title: "Kerjasama Global", desc: "Jaringan mitra internasional dari 15 negara untuk riset dan pertukaran." },
  { year: "2025", title: "Akreditasi Unggul", desc: "Meraih peringkat Unggul dari BAN-PT dengan 25 program studi." },
];

const ACHIEVEMENTS = [
  { title: "Juara Umum KKCTBN", desc: "Kontes Kapal Cepat Indonesia", year: "2026", image: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=600&q=80", color: "from-amber-500 to-orange-600" },
  { title: "Akreditasi Unggul", desc: "Peringkat institusi tertinggi dari BAN-PT", year: "2025", image: "https://images.unsplash.com/photo-1562774053-701939374585?w=600&q=80", color: "from-blue-500 to-blue-700" },
  { title: "Hibah Riset Internasional", desc: "Pendanaan riset maritim dari World Bank", year: "2025", image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&q=80", color: "from-emerald-500 to-emerald-700" },
  { title: "Innovation Award", desc: "Penghargaan inovasi panel surya terapung", year: "2024", image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80", color: "from-purple-500 to-purple-700" },
];

const PROGRAMS = [
  { title: "Teknik Perkapalan", desc: "Program unggulan yang mencetak tenaga ahli di bidang perancangan, konstruksi, dan produksi kapal.", icon: "Ship", color: "from-blue-600 to-blue-800", image: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&q=80" },
  { title: "Teknik Kelistrikan", desc: "Fokus pada sistem kelistrikan kapal, otomasi, dan distribusi tenaga listrik maritim.", icon: "Zap", color: "from-amber-500 to-orange-600", image: "https://images.unsplash.com/photo-1581092335391-9583eb1c0f6a?w=800&q=80" },
  { title: "Teknik Mesin", desc: "Penguasaan teknologi permesinan kapal, sistem propulsi, dan pemeliharaan mesin industri.", icon: "Cog", color: "from-emerald-500 to-emerald-700", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80" },
  { title: "Teknik Permesinan", desc: "Spesialisasi dalam permesinan presisi, manufaktur komponen kapal, dan pengelasan.", icon: "Wrench", color: "from-purple-500 to-purple-700", image: "https://images.unsplash.com/photo-1581092335871-4bcb5c2c0c4b?w=800&q=80" },
  { title: "Teknologi Rekayasa", desc: "Program D4 yang mengintegrasikan rekayasa teknologi dengan aplikasi industri maritim.", icon: "Microscope", color: "from-cyan-500 to-cyan-700", image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80" },
  { title: "Teknik Otomasi", desc: "Pendalaman sistem kontrol otomatis, robotika, dan IoT untuk industri perkapalan.", icon: "Cpu", color: "from-rose-500 to-rose-700", image: "https://images.unsplash.com/photo-1581092335391-9583eb1c0f6a?w=800&q=80" },
];

const BENTO_ITEMS = [
  { title: "Teaching Factory", desc: "Pembelajaran berbasis industri maritim dengan standar global yang terintegrasi langsung ke dunia kerja.", icon: "Factory", color: "from-blue-600 to-blue-800", size: "large", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80" },
  { title: "Riset & Inovasi", desc: "Pusat riset maritim dengan 12 laboratorium modern dan 50+ publikasi internasional per tahun.", icon: "FlaskConical", color: "from-amber-500 to-orange-600", size: "small", image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80" },
  { title: "Smart Campus", desc: "Infrastruktur digital terpadu untuk mendukung ekosistem pembelajaran abad 21.", icon: "Monitor", color: "from-emerald-500 to-emerald-700", size: "wide", image: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80" },
  { title: "Industri 4.0", desc: "Pengembangan kompetensi di bidang otomatisasi, IoT, dan AI untuk sektor maritim.", icon: "Cpu", color: "from-purple-500 to-purple-700", size: "small", image: "https://images.unsplash.com/photo-1581092335871-4bcb5c2c0c4b?w=800&q=80" },
  { title: "Global Network", desc: "Jaringan mitra internasional dari 15 negara untuk pertukaran pelajar dan riset bersama.", icon: "Globe", color: "from-cyan-500 to-cyan-700", size: "tall", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80" },
];

const FASILITAS = [
  { title: "Lab Maritim", desc: "Laboratorium riset maritim dengan peralatan tercanggih untuk penelitian dan pengembangan teknologi kapal.", image: "https://images.unsplash.com/photo-1581092335391-9583eb1c0f6a?w=800&q=80", color: "from-blue-500 to-blue-700" },
  { title: "Smart Library", desc: "Perpustakaan digital dengan akses ke ribuan jurnal internasional dan ruang belajar kolaboratif.", image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80", color: "from-indigo-500 to-indigo-700" },
  { title: "Workshop Kapal", desc: "Bengkel kerja kapal seluas 2.000 m\u00b2 dengan fasilitas produksi dan perbaikan kapal skala penuh.", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80", color: "from-amber-500 to-amber-700" },
  { title: "Simulator Navigasi", desc: "Laboratorium simulasi navigasi kapal berbasis VR untuk pelatihan calon perwira pelayaran.", image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80", color: "from-emerald-500 to-emerald-700" },
];

const GALLERY_ITEMS = [
  { title: "Gedung Rektorat", desc: "Pusat administrasi dan pelayanan akademik", color: "from-blue-400 to-blue-600", image: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80", category: "Kampus" },
  { title: "Lab Maritim", desc: "Laboratorium riset maritim modern", color: "from-amber-400 to-amber-600", image: "https://images.unsplash.com/photo-1581092335391-9583eb1c0f6a?w=800&q=80", category: "Laboratorium" },
  { title: "Perpustakaan", desc: "Pusat literasi digital dan riset", color: "from-indigo-400 to-indigo-600", image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80", category: "Kampus" },
  { title: "Area Kampus", desc: "Lingkungan kampus yang asri", color: "from-emerald-400 to-emerald-600", image: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80", category: "Kampus" },
  { title: "Ruang Kelas", desc: "Fasilitas pembelajaran modern", color: "from-cyan-400 to-cyan-600", image: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&q=80", category: "Kampus" },
  { title: "Kapal Riset", desc: "Kapal riset karya mahasiswa PPNS", color: "from-rose-400 to-rose-600", image: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&q=80", category: "Prestasi" },
  { title: "Masjid Kampus", desc: "Pusat kegiatan keagamaan mahasiswa", color: "from-teal-400 to-teal-600", image: "https://images.unsplash.com/photo-1581092335391-9583eb1c0f6a?w=800&q=80", category: "Kampus" },
  { title: "Student Center", desc: "Ruang kreativitas dan kegiatan mahasiswa", color: "from-pink-400 to-pink-600", image: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&q=80", category: "Kegiatan" },
  { title: "Lab Komputer", desc: "Fasilitas computing dan simulasi maritim", color: "from-violet-400 to-violet-600", image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80", category: "Laboratorium" },
];

const GALLERY_CATEGORIES = ["Kampus", "Laboratorium", "Kegiatan", "Prestasi"];

const NEWS_ITEMS = [
  { slug: "panel-surya-10-gedung", date: "15 Mei 2026", title: "PPNS Luncurkan Program Panel Surya di 10 Gedung Utama", excerpt: "Sebagai langkah menuju kampus hemat energi, PPNS memasang panel surya berkapasitas 500 kWp di seluruh gedung utama kampus.", content: "PPNS mengambil langkah besar menuju kemandirian energi dengan meluncurkan program pemasangan panel surya di 10 gedung utama kampus. Proyek ini merupakan bagian dari komitmen institusi dalam mendukung transisi energi bersih dan mencapai target karbon netral pada tahun 2030.\n\nPanel surya berkapasitas total 500 kWp yang dipasang diperkirakan dapat memenuhi 30% kebutuhan listrik harian kampus. Program ini tidak hanya mengurangi biaya operasional, tetapi juga menjadi laboratorium hidup bagi mahasiswa untuk mempelajari teknologi energi terbarukan secara langsung.\n\nKerjasama dengan PLN dan Kementerian ESDM memungkinkan kelebihan listrik yang dihasilkan dapat disalurkan kembali ke jaringan listrik nasional melalui skema net metering.", tag: "Energi", color: "from-blue-500 to-blue-700", image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80" },
  { slug: "juara-kapal-cepat-nasional", date: "28 April 2026", title: "Mahasiswa PPNS Juara Kapal Cepat Nasional", excerpt: "Tim Kontes Kapal Cepat Indonesia (KKCTBN) dari PPNS berhasil meraih juara umum di ajang kompetisi nasional.", tag: "Prestasi", color: "from-amber-500 to-orange-600", image: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&q=80" },
  { slug: "kerjasama-10-industri-maritim", date: "10 April 2026", title: "PPNS Jalin Kerjasama dengan 10 Industri Maritim", excerpt: "Nota kesepahaman ditandatangani dengan perusahaan maritim terkemuka untuk program magang dan riset.", tag: "Kerjasama", color: "from-emerald-500 to-emerald-700", image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80" },
  { slug: "kapal-riset-mahasiswa", date: "22 Maret 2026", title: "Launching Kapal Riset Mahasiswa PPNS", excerpt: "Kapal riset karya mahasiswa PPNS siap digunakan untuk ekspedisi kelautan dan penelitian maritim.", tag: "Inovasi", color: "from-purple-500 to-purple-700", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80" },
];

const CONTACT_INFO = {
  address: "Jl. Teknik Kimia, Keputih, Kec. Sukolilo, Surabaya 60111",
  phone: "+62 31 594 7264",
  email: "info@ppns.ac.id",
  maps: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.635654321234!2d112.789!3d-7.293!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sPPNS!5e0!3m2!1sid!2sid!4v1",
};

const PARTNERS = [
  { name: "Kementerian LHK", image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=200&h=100&fit=crop&auto=format" },
  { name: "PLN", image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=200&h=100&fit=crop&auto=format" },
  { name: "PERTAMINA", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=100&fit=crop&auto=format" },
  { name: "UNESCO", image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=200&h=100&fit=crop&auto=format" },
  { name: "UNDP", image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=200&h=100&fit=crop&auto=format" },
  { name: "World Bank", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=100&fit=crop&auto=format" },
  { name: "Greenpeace", image: "https://images.unsplash.com/photo-1542601906990-b4d3fb082b5e?w=200&h=100&fit=crop&auto=format" },
  { name: "WWF Indonesia", image: "https://images.unsplash.com/photo-1470071459604-4016e2f5ff5c?w=200&h=100&fit=crop&auto=format" },
  { name: "ITS", image: "https://images.unsplash.com/photo-1562774053-701939374585?w=200&h=100&fit=crop&auto=format" },
  { name: "Universitas Indonesia", image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=200&h=100&fit=crop&auto=format" },
];

const KERJASAMA = [
  { name: "PAL Indonesia", bidang: "Galangan Kapal", logo: "PAL", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=100&fit=crop&auto=format" },
  { name: "Pertamina", bidang: "Energi Maritim", logo: "Pertamina", image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=200&h=100&fit=crop&auto=format" },
  { name: "Pelindo", bidang: "Kepelabuhan", logo: "Pelindo", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200&h=100&fit=crop&auto=format" },
  { name: "PT. Dok & Perkapalan", bidang: "Reparasi Kapal", logo: "DPS", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=100&fit=crop&auto=format" },
  { name: "ABS Consulting", bidang: "Sertifikasi", logo: "ABS", image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=200&h=100&fit=crop&auto=format" },
  { name: "BKI", bidang: "Klasifikasi", logo: "BKI", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=100&fit=crop&auto=format" },
];

// ==============================
// API Helper
// ==============================

function apiPut(path, data, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const options = {
      hostname: "localhost",
      port: 5001,
      path: "/api" + path,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
    };
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve({ success: false, raw: body });
        }
      });
    });
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

function apiPost(path, data, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const options = {
      hostname: "localhost",
      port: 5001,
      path: "/api" + path,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
    };
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve({ success: false, raw: body });
        }
      });
    });
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

function apiGet(path) {
  return new Promise((resolve, reject) => {
    http
      .get("http://localhost:5001/api" + path, (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            resolve({ success: false, raw: body });
          }
        });
      })
      .on("error", reject);
  });
}

// ==============================
// PAGE DATA
// ==============================

const PAGES = [
  {
    slug: "root",
    title: "Beranda",
    content: [
      { type: "hero", data: { badge: "Politeknik Perkapalan Negeri Surabaya", title: "PPNS Smart", subtitle: "Maritime Campus", description: "Portal informasi akademik, inovasi teknologi, berita kampus, dan kolaborasi industri maritim modern.", image: "https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80", button_text: "Lihat Informasi", button_link: "#program", stats_badge: "Sorotan Kampus", stats: [{ value: "25+", label: "Program Studi" }, { value: "Unggul", label: "Akreditasi" }, { value: "10rb+", label: "Mahasiswa Aktif" }, { value: "Surabaya", label: "Kampus Utama" }], stats_footer: "Penerimaan Mahasiswa Baru 2026/2027 dibuka" } },
      { type: "statistics", data: { cards: STATISTICS } },
      { type: "program", data: { bento_items: BENTO_ITEMS, programs: PROGRAMS, facilities: FASILITAS, kerjasama: KERJASAMA } },
      { type: "news", data: { items: NEWS_ITEMS, featured: NEWS_ITEMS.slice(0, 3) } },
      { type: "gallery", data: { images: GALLERY_ITEMS } },
      { type: "contact", data: CONTACT_INFO },
      { type: "partners", data: { items: PARTNERS } },
    ],
  },
  {
    slug: "tentang",
    title: "Tentang",
    content: [
      { type: "pagehero", data: { title: "Tentang PPNS", subtitle: "Membangun Generasi Maritim Indonesia yang Unggul", bgImage: "https://images.unsplash.com/photo-1562774053-701939374585?w=1440&q=80" } },
      { type: "statistics", data: { cards: STATISTICS } },
      { type: "highlights", data: { items: [{ value: "A+", label: "Peringkat Akreditasi" }, { value: "1996", label: "Tahun Berdiri" }, { value: "15+", label: "Negara Mitra" }] } },
      { type: "timeline", data: { items: TIMELINE } },
      { type: "achievements", data: { items: ACHIEVEMENTS } },
      { type: "aboutdetail", data: { sejarah: SEJARAH, visi: "Menjadi politeknik perkapalan yang unggul, inovatif, dan berdaya saing global dalam pengembangan teknologi maritim yang berkelanjutan pada tahun 2030.", misi: ["Menyelenggarakan pendidikan vokasi di bidang perkapalan dan maritim yang berkualitas dan relevan dengan kebutuhan industri.", "Melaksanakan penelitian terapan yang mendukung inovasi teknologi maritim dan keberlanjutan lingkungan.", "Mengembangkan sistem pengabdian kepada masyarakat berbasis teknologi tepat guna di sektor maritim.", "Membangun kerjasama strategis dengan industri, pemerintah, dan institusi riset baik nasional maupun internasional.", "Mewujudkan tata kelola institusi yang transparan, akuntabel, dan berbasis teknologi informasi."], pimpinan: [{ nama: "Dr. Ir. Bambang Susilo, M.T.", jabatan: "Direktur" }, { nama: "Dr. Eng. Dewi Sartika, S.T., M.Sc.", jabatan: "Wakil Direktur I (Akademik)" }, { nama: "Ir. Hendra Gunawan, M.T.", jabatan: "Wakil Direktur II (Keuangan)" }, { nama: "Rina Marlina, S.T., M.Kom.", jabatan: "Wakil Direktur III (Kemahasiswaan)" }] } },
      { type: "cta", data: { title: "Jelajahi Program Studi PPNS", description: "Temukan program studi yang sesuai dengan minat dan bakat Anda di bidang maritim.", buttons: [{ label: "Lihat Program", link: "/program", variant: "primary" }, { label: "Hubungi Kami", link: "/kontak", variant: "secondary" }], bgImage: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1920&q=80" } },
    ],
  },
  {
    slug: "program",
    title: "Program",
    content: [
      { type: "pagehero", data: { title: "Program Unggulan", subtitle: "Program pendidikan dan inovasi maritim modern", bgImage: "https://images.unsplash.com/photo-1581092335391-9583eb1c0f6a?w=1440&q=80" } },
      { type: "bento", data: { badge: "Inovasi Unggulan", title: "Program", highlight: "Unggulan", items: BENTO_ITEMS } },
      { type: "programs", data: { badge: "Program Studi", title: "Semua", highlight: "Program", description: "PPNS menawarkan enam program studi unggulan di bidang teknologi maritim yang dirancang untuk memenuhi kebutuhan industri global.", items: PROGRAMS } },
      { type: "facilities", data: { badge: "Fasilitas", title: "Fasilitas", highlight: "Modern", items: FASILITAS } },
      { type: "highlights", data: { items: [{ value: "25+", label: "Program Studi" }, { value: "100%", label: "Terakreditasi" }, { value: "10.000+", label: "Mahasiswa Aktif" }] } },
      { type: "kerjasama", data: { badge: "Kerjasama", title: "Mitra", highlight: "Industri", items: KERJASAMA } },
      { type: "cta", data: { title: "Siap Bergabung dengan PPNS?", description: "Mulai perjalanan Anda menuju karir di industri maritim global bersama PPNS.", buttons: [{ label: "Hubungi Kami", link: "/kontak", variant: "primary" }, { label: "Lihat Berita Terkini", link: "/berita", variant: "secondary" }], bgImage: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=1920&q=80" } },
    ],
  },
  {
    slug: "berita",
    title: "Berita",
    content: [
      { type: "pagehero", data: { title: "Berita Kampus", subtitle: "Informasi terbaru seputar PPNS", bgImage: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1440&q=80" } },
      { type: "news", data: { items: NEWS_ITEMS, featured: NEWS_ITEMS.slice(0, 3) } },
    ],
  },
  {
    slug: "galeri",
    title: "Galeri",
    content: [
      { type: "pagehero", data: { title: "Galeri Kampus", subtitle: "Jelajahi momen dan fasilitas terbaik PPNS melalui lensa", bgImage: "https://images.unsplash.com/photo-1562774053-701939374585?w=1440&q=80" } },
      { type: "highlights", data: { items: [{ value: "200+", label: "Foto Tersedia" }, { value: "12", label: "Fasilitas Terekam" }, { value: "9", label: "Kategori Galeri" }] } },
      { type: "gallery", data: { categories: GALLERY_CATEGORIES, items: GALLERY_ITEMS } },
      { type: "cta", data: { title: "Kunjungi Kampus Kami", description: "Lihat langsung fasilitas modern dan lingkungan kampus yang inspiratif.", buttons: [{ label: "Jadwalkan Kunjungan", link: "#", variant: "primary" }], bgImage: "https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80" } },
    ],
  },
  {
    slug: "kontak",
    title: "Kontak",
    content: [
      { type: "pagehero", data: { title: "Kontak Kami", subtitle: "Hubungi PPNS untuk informasi akademik, kerja sama, dan kunjungan kampus", bgImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1440&q=80" } },
      { type: "contact", data: CONTACT_INFO },
      { type: "cta", data: { title: "Tanyakan pada Kami", description: "Tim PPNS siap membantu pertanyaan Anda terkait pendidikan dan kerjasama.", buttons: [{ label: "Kirim Pesan", link: "mailto:info@ppns.ac.id", variant: "primary" }], bgImage: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&q=80" } },
    ],
  },
  {
    slug: "laporan",
    title: "Laporan",
    content: [
      { type: "pagehero", data: { title: "Laporan & Dokumen", subtitle: "Dokumentasi dan laporan program Green Campus PPNS", bgImage: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1440&q=80" } },
      { type: "features", data: { badge: "Dokumen", title: "Laporan", highlight: "Green Campus", description: "Dokumen lengkap mengenai program keberlanjutan dan Green Campus di PPNS.", items: [{ title: "Laporan Keberlanjutan 2025", description: "Dokumen lengkap capaian dan target program Green Campus tahun 2025. (4.2 MB, PDF)" }, { title: "Rencana Aksi Green Campus", description: "Strategi dan roadmap program keberlanjutan jangka panjang PPNS. (2.8 MB, PDF)" }, { title: "Data Emisi Karbon Kampus", description: "Laporan inventarisasi emisi gas rumah kaca seluruh area kampus. (1.5 MB, XLSX)" }, { title: "Pedoman Green Campus", description: "Buku panduan pelaksanaan program dan kebijakan lingkungan kampus. (3.1 MB, PDF)" }, { title: "Laporan Keuangan Hijau 2025", description: "Transparansi pengelolaan dana program keberlanjutan lingkungan kampus. (2.3 MB, PDF)" }, { title: "Audit Energi Kampus", description: "Evaluasi konsumsi energi dan rekomendasi efisiensi di seluruh area kampus. (3.7 MB, PDF)" }] } },
    ],
  },
];

// ==============================
// MAIN
// ==============================

async function seed() {
  console.log("🌱 Seeding CMS content via API...\n");

  // Login to get token
  const login = await apiPost("/auth/login", { email: "admin@ppns.ac.id", password: "admin123" });
  if (!login.success) {
    console.error("❌ Login failed:", login.message);
    process.exit(1);
  }
  const token = login.data.token;
  console.log("✓ Logged in as admin\n");

  for (const page of PAGES) {
    console.log(`  Seeding "${page.title}" (/${page.slug === "root" ? "" : page.slug})...`);

    const res = await apiPut(
      page.slug === "root" ? "/pages/root" : `/pages/${page.slug}`,
      { title: page.title, content: page.content, published: true },
      token,
    );

    if (res.success) {
      console.log(`    ✓ Updated: ${res.message || "OK"}`);
    } else {
      console.log(`    ⚠ ${res.message || JSON.stringify(res)}`);
    }
  }

  console.log("\n✅ Seed complete!");
  console.log("   All pages have been populated with current content.");
  console.log("   You can now edit them via Admin CMS → Pages.");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
