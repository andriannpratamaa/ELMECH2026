-- Migration: Add tahun (year) and semester to inspections table
-- Each item can have one inspection per (tahun, semester) pair
-- Ganjil = Agustus - Januari
-- Genap = Februari - Juli

ALTER TABLE inspections
  ADD COLUMN tahun YEAR NOT NULL AFTER item_id,
  ADD COLUMN semester ENUM('GANJIL','GENAP') NOT NULL AFTER tahun;

-- Migrate existing data: derive tahun from tanggal_inspeksi
UPDATE inspections SET tahun = YEAR(tanggal_inspeksi);

-- Migrate existing data: derive semester from bulan of tanggal_inspeksi
-- Feb (2) - Jul (7) = GENAP
-- Agu (8) - Jan (1) = GANJIL (Jan uses previous year's Ganjil)
UPDATE inspections SET semester = 'GENAP' WHERE MONTH(tanggal_inspeksi) BETWEEN 2 AND 7;
UPDATE inspections SET semester = 'GANJIL' WHERE MONTH(tanggal_inspeksi) IN (8,9,10,11,12);
UPDATE inspections SET semester = 'GANJIL', tahun = tahun - 1 WHERE MONTH(tanggal_inspeksi) = 1;

-- Add unique constraint: one inspection per item per year+semester
ALTER TABLE inspections
  ADD UNIQUE KEY unique_item_semester (item_id, tahun, semester);

-- Index for faster lookups by year+semester
ALTER TABLE inspections
  ADD INDEX idx_tahun_semester (tahun, semester);
