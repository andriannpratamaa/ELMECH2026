-- Create Database
CREATE DATABASE IF NOT EXISTS ppns_lab_inspection;
USE ppns_lab_inspection;

-- Laboratories Table (must be before users karena FK)
CREATE TABLE IF NOT EXISTS laboratories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_lab VARCHAR(255) NOT NULL,
  lokasi VARCHAR(255) NOT NULL,
  kalab_id INT NULL,
  item_ids VARCHAR(1000) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kalab_id) REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nama_lab (nama_lab)
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  nip VARCHAR(50) DEFAULT '',
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'kalab') NOT NULL DEFAULT 'kalab',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Items Table
CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_barang VARCHAR(255) NOT NULL,
  kode_barang VARCHAR(100) NOT NULL UNIQUE,
  pembuat_alat VARCHAR(255),
  tanggal_pembelian DATE,
  kondisi ENUM('baik', 'rusak_ringan', 'rusak_berat') NOT NULL DEFAULT 'baik',
  status ENUM('aktif', 'nonaktif') NOT NULL DEFAULT 'aktif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_kode_barang (kode_barang),
  INDEX idx_kondisi (kondisi)
);

-- Inspections Table
CREATE TABLE IF NOT EXISTS inspections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  laboratory_id INT NOT NULL,
  item_id INT NOT NULL,
  inspector_id INT NOT NULL,
  tanggal_inspeksi DATETIME NOT NULL,
  catatan TEXT,
  foto VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (laboratory_id) REFERENCES laboratories(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  FOREIGN KEY (inspector_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_laboratory_id (laboratory_id),
  INDEX idx_item_id (item_id),
  INDEX idx_inspector_id (inspector_id),
  INDEX idx_tanggal_inspeksi (tanggal_inspeksi)
);

-- Inspection Categories (Kategori Pemeriksaan)
CREATE TABLE IF NOT EXISTS inspection_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_kategori VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  urutan INT DEFAULT 1,
  status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'APPROVED',
  alasan_penolakan TEXT,
  created_by INT,
  laboratory_id INT,
  item_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (laboratory_id) REFERENCES laboratories(id) ON DELETE SET NULL,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL,
  INDEX idx_urutan (urutan),
  INDEX idx_status (status),
  INDEX idx_laboratory_id (laboratory_id)
);

-- Inspection Sub Items (Item Checklist per Kategori)
CREATE TABLE IF NOT EXISTS inspection_subitems (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  nama_subitem VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  urutan INT DEFAULT 1,
  status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'APPROVED',
  alasan_penolakan TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES inspection_categories(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_category_id (category_id),
  INDEX idx_urutan (urutan),
  INDEX idx_status (status)
);

-- Inspection Results (Hasil Inspeksi Detail per Item)
CREATE TABLE IF NOT EXISTS inspection_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  inspection_id INT NOT NULL,
  subitem_id INT NOT NULL,
  bulan_ke INT NOT NULL DEFAULT 1,
  status ENUM('B', 'K', 'N/A') NOT NULL DEFAULT 'B',
  keterangan TEXT,
  approval_status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  alasan_penolakan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE,
  FOREIGN KEY (subitem_id) REFERENCES inspection_subitems(id) ON DELETE CASCADE,
  UNIQUE INDEX idx_unique_inspec_subitem_month (inspection_id, subitem_id, bulan_ke),
  INDEX idx_inspection_id (inspection_id),
  INDEX idx_subitem_id (subitem_id)
);

-- Schedules Table
CREATE TABLE IF NOT EXISTS schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  laboratory_id INT NOT NULL,
  tanggal DATE NOT NULL,
  keterangan VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (laboratory_id) REFERENCES laboratories(id) ON DELETE CASCADE,
  INDEX idx_laboratory_id (laboratory_id),
  INDEX idx_tanggal (tanggal)
);

-- Insert sample admin user (password: admin123)
INSERT INTO users (name, nip, email, password, role) VALUES
('Admin PPNS', '', 'admin@ppns.ac.id', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36CHqg9C', 'admin');

-- Insert sample kalab user (password: kalab123)
INSERT INTO users (name, nip, email, password, role) VALUES
('Kepala Lab Fisika', '197501012005011001', 'kalab.fisika@ppns.ac.id', '$2a$10$kCqWc5WXmvT5pqH5s5V9a.B3ZYN8hIQQZv3H1f8.N7u8O5p5H1Hp2', 'kalab');

-- Insert sample laboratory
INSERT INTO laboratories (nama_lab, lokasi, kalab_id, item_ids) VALUES
('Lab Fisika', 'Gedung A Lantai 2', 2, '1,2'),
('Lab Kimia', 'Gedung B Lantai 3', NULL, '3,4'),
('Lab Biologi', 'Gedung C Lantai 1', NULL, '5,6');

-- Insert sample inspection categories
INSERT INTO inspection_categories (nama_kategori, deskripsi, urutan) VALUES
('Pemeriksaan Fisik dan Umum', 'Diisi kondisi fisik alat secara umum sesuai manual book', 1),
('Pemeriksaan Komponen', 'Diisi komponen-komponen alat sesuai manual book', 2),
('Pemeriksaan Operasional', 'Diisi komponen-komponen alat sesuai manual book', 3),
('Perawatan Rutin', 'Diisi sesuai dengan petunjuk perawatan rutin sesuai manual book', 4),
('Keselamatan dan Lingkungan (K3L)', 'Diisi sesuai dengan petunjuk K3L sesuai manual book', 5);

-- Insert sample inspection sub items
-- Category 1: Pemeriksaan Fisik dan Umum
INSERT INTO inspection_subitems (category_id, nama_subitem, deskripsi, urutan) VALUES
(1, 'Bodi Alat', 'Kondisi bodi alat (cacat, goresan, dll)', 1),
(1, 'Kebersihan Alat', 'Alat dalam kondisi bersih dari debu/noda', 2),
(1, 'Keutuhan Casing', 'Casing/tutup alat utuh dan tidak rusak', 3);

-- Category 2: Pemeriksaan Komponen
INSERT INTO inspection_subitems (category_id, nama_subitem, deskripsi, urutan) VALUES
(2, 'Kabel Listrik', 'Kabel tidak putus, isolasi baik, tidak ada kerusakan', 1),
(2, 'Socket/Plug', 'Socket dan plug dalam kondisi normal', 2),
(2, 'Tombol Kontrol', 'Semua tombol berfungsi normal, tidak macet', 3),
(2, 'Display/Layar', 'Display/layar berfungsi normal jika ada', 4);

-- Category 3: Pemeriksaan Operasional
INSERT INTO inspection_subitems (category_id, nama_subitem, deskripsi, urutan) VALUES
(3, 'Fungsi Normal', 'Alat dapat dihidupkan dan berfungsi normal', 1),
(3, 'Response Alat', 'Response alat cepat dan tepat sesuai input', 2),
(3, 'Akurasi', 'Hasil pengukuran akurat (jika ada pengukuran)', 3),
(3, 'Kecepatan Operasi', 'Kecepatan operasi normal sesuai spesifikasi', 4);

-- Category 4: Perawatan Rutin
INSERT INTO inspection_subitems (category_id, nama_subitem, deskripsi, urutan) VALUES
(4, 'Pembersihan', 'Alat telah dibersihkan secara rutin', 1),
(4, 'Kalibrasi', 'Alat telah dikalibrasi jika diperlukan', 2),
(4, 'Penggantian Komponen', 'Komponen habis pakai telah diganti', 3),
(4, 'Pelumasan', 'Bagian bergerak telah dilumasi jika perlu', 4);

-- Category 5: Keselamatan dan Lingkungan
INSERT INTO inspection_subitems (category_id, nama_subitem, deskripsi, urutan) VALUES
(5, 'Standar Keselamatan', 'Alat memenuhi standar keselamatan yang berlaku', 1),
(5, 'Tidak Ada Bahaya', 'Tidak ada bahan berbahaya tertinggal di alat', 2),
(5, 'Aman Dioperasikan', 'Alat aman untuk dioperasikan oleh pengguna', 3),
(5, 'Lingkungan Aman', 'Area sekitar alat aman dan bebas hambatan', 4),
(5, 'Dokumentasi & Labeling', 'Ada label identitas dan dokumentasi keselamatan yang jelas', 5);

-- Inspection Monthly Reviews (Review per bulan oleh admin)
CREATE TABLE IF NOT EXISTS inspection_monthly_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  inspection_id INT NOT NULL,
  bulan_ke INT NOT NULL,
  review_status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  reviewed_by INT,
  alasan_penolakan TEXT,
  reviewed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_inspection_month (inspection_id, bulan_ke),
  INDEX idx_review_status (review_status)
);

-- Insert sample items
INSERT INTO items (nama_barang, kode_barang, pembuat_alat, tanggal_pembelian, kondisi, status) VALUES
('Mikroskop Optik', 'FIS-001', 'Zeiss', '2022-01-15', 'baik', 'aktif'),
('Spektrofotometer', 'FIS-002', 'PerkinElmer', '2022-06-20', 'baik', 'aktif'),
('Timbangan Analitik', 'KIM-001', 'OHAUS', '2021-03-10', 'rusak_ringan', 'aktif'),
('Oven Laboratorium', 'KIM-002', 'Memmert', '2020-11-05', 'baik', 'aktif'),
('Inkubator', 'BIO-001', 'Sheldon', '2022-05-12', 'baik', 'aktif'),
('Centrifuge', 'BIO-002', 'Eppendorf', '2019-08-30', 'rusak_berat', 'nonaktif');
