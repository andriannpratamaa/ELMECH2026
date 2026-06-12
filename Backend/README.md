# PPNS Lab Inspection Backend

Sistem backend untuk pemantauan dan inspeksi laboratorium di Politeknik Negeri Surabaya (PPNS).

## Fitur

- Authentication dengan JWT
- Password hashing menggunakan bcrypt
- Role-based access control (admin & kalab)
- CRUD untuk users, laboratorium, barang, dan inspeksi
- Upload foto inspeksi
- Jadwal inspeksi
- Clean code MVC structure

## Tech Stack

- Node.js
- Express.js
- MySQL
- JWT
- bcryptjs
- multer (upload file)
- express-validator (validasi input)

## Installation

1. Clone repository ini
2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` ke `.env` dan sesuaikan konfigurasi database:
```bash
cp .env.example .env
```

4. Import database schema:
```bash
mysql -u root -p < database.sql
```

5. Start server:
```bash
npm run dev  # Development dengan nodemon
npm start    # Production
```

Server akan berjalan di `http://localhost:5000`

## Database Setup

### Default Users

**Admin:**
- Email: admin@ppns.ac.id
- Password: admin123

**Kalab (Kepala Lab):**
- Email: kalab.fisika@ppns.ac.id
- Password: kalab123

### Database Schema

Tabel utama:
- `users` - Data pengguna
- `laboratories` - Data laboratorium
- `items` - Data barang/alat laboratorium
- `inspections` - Data hasil inspeksi
- `schedules` - Jadwal inspeksi

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login dan dapatkan token
- `GET /api/auth/profile` - Get profile user (require auth)

### Users (Admin Only)
- `GET /api/users` - Lihat semua user
- `POST /api/users` - Buat user baru
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Hapus user

### Laboratories
- `GET /api/labs` - Lihat semua lab
- `POST /api/labs` - Buat lab (admin only)
- `PUT /api/labs/:id` - Update lab (admin only)
- `DELETE /api/labs/:id` - Hapus lab (admin only)

### Items
- `GET /api/items` - Lihat semua barang
- `GET /api/items/lab/:laboratoryId` - Lihat barang per lab
- `POST /api/items` - Buat barang (admin only)
- `PUT /api/items/:id` - Update barang (admin only)
- `DELETE /api/items/:id` - Hapus barang (admin only)

### Inspections
- `GET /api/inspections` - Lihat semua inspeksi (admin only)
- `GET /api/inspections/my-inspections` - Lihat inspeksi saya
- `GET /api/inspections/lab/:laboratoryId` - Lihat inspeksi per lab (admin only)
- `POST /api/inspections` - Buat inspeksi
- `PUT /api/inspections/:id` - Update inspeksi

### Schedules
- `GET /api/schedules` - Lihat semua jadwal
- `GET /api/schedules/lab/:laboratoryId` - Lihat jadwal per lab
- `POST /api/schedules` - Buat jadwal (admin only)
- `PUT /api/schedules/:id` - Update jadwal (admin only)
- `DELETE /api/schedules/:id` - Hapus jadwal (admin only)

## JWT Token Usage

Untuk mengakses endpoint yang dilindungi, sertakan token di header:

```
Authorization: Bearer <token>
```

## Upload File

File foto dapat diupload melalui endpoint POST `/api/inspections` dengan form-data:
- `foto` - File gambar (JPEG, PNG, GIF)
- `laboratory_id` - ID laboratorium
- `item_id` - ID barang
- `kondisi` - Kondisi barang
- `catatan` - Catatan inspeksi

File akan disimpan di folder `/uploads/`

## Testing dengan Postman

### 1. Login

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@ppns.ac.id",
  "password": "admin123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": 1,
      "name": "Admin PPNS",
      "email": "admin@ppns.ac.id",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Get Profile

```
GET http://localhost:5000/api/auth/profile
Authorization: Bearer <token_dari_login>
```

### 3. Get All Laboratories

```
GET http://localhost:5000/api/labs
Authorization: Bearer <token>
```

### 4. Create Item

```
POST http://localhost:5000/api/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "laboratory_id": 1,
  "nama_barang": "Bunsen Burner",
  "kode_barang": "FIS-003",
  "kondisi": "baik",
  "status": "aktif"
}
```

### 5. Create Inspection dengan Photo

```
POST http://localhost:5000/api/inspections
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- laboratory_id: 1
- item_id: 1
- kondisi: baik
- catatan: Inspeksi rutin, barang dalam kondisi baik
- foto: [pilih file gambar]
```

## Struktur Folder

```
backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── validation.js
│   │   └── multerConfig.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── laboratoryController.js
│   │   ├── itemController.js
│   │   ├── inspectionController.js
│   │   └── scheduleController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── laboratoryRoutes.js
│   │   ├── itemRoutes.js
│   │   ├── inspectionRoutes.js
│   │   └── scheduleRoutes.js
│   └── models/
├── uploads/
├── server.js
├── package.json
├── .env
├── .env.example
├── .gitignore
└── database.sql
```

## Error Handling

API akan mengembalikan response dengan format:

Success:
```json
{
  "success": true,
  "message": "Operasi berhasil",
  "data": { ... }
}
```

Error:
```json
{
  "success": false,
  "message": "Deskripsi error"
}
```

## Security

- Password di-hash menggunakan bcryptjs
- JWT token dengan secret key yang aman
- Input validation menggunakan express-validator
- File upload dengan validasi tipe dan ukuran
- Role-based authorization middleware

## Pengembangan Selanjutnya

- [ ] Pagination untuk list endpoints
- [ ] Search/filter untuk data
- [ ] Report generation (PDF/Excel)
- [ ] Notification system
- [ ] Backup & restore database
- [ ] Audit log untuk setiap aktivitas
- [ ] Dashboard statistics

## Support

Untuk pertanyaan atau masalah, silakan hubungi tim development.
"# Backend-Green-Campus" 
