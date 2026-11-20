# UKK SMT4

## Setup setelah clone (Windows PowerShell)

1. Install dependency:

   ```powershell
   npm.cmd install
   ```

2. Salin template environment lalu isi koneksi database dan rahasia lokal:

   ```powershell
   Copy-Item .env.example .env
   ```

   Isi `DATABASE_URL` dengan koneksi MariaDB/MySQL, `ADMIN_PASSWORD` dengan password admin minimal 8 karakter, dan `JWT_SECRET` dengan nilai acak minimal 32 byte. Buat nilai `JWT_SECRET` dengan:

   ```powershell
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

3. Buat database kosong bernama `db_ukksmt4_reyhan` pada server MariaDB/MySQL.
4. Terapkan skema tabel dan buat akun admin:

   ```powershell
   npm.cmd run db:migrate
   npm.cmd run db:seed-admin
   ```

5. Jalankan aplikasi:

   ```powershell
   npm.cmd run dev
   ```

Buka `http://localhost:3000` dan masuk menggunakan email `reyhansonjaya27@gmail.com` serta password yang Anda isi pada `ADMIN_PASSWORD`.

Migrasi menyiapkan struktur tabel; seed membuat akun admin saja. Artikel, kategori, jurusan, dan profil perusahaan tidak ikut tersalin dan dapat ditambahkan melalui aplikasi. Jangan commit `.env` atau kredensial database ke GitHub.
