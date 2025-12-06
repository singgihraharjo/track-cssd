# MediTrack CSSD

Sistem Informasi Manajemen Sterilisasi Sentral (CSSD) untuk Rumah Sakit. Aplikasi ini menangani pelacakan instrumen, distribusi steril, pengembalian alat kotor, dan manajemen inventaris dengan validasi kode QR.

## Fitur Utama

*   **Role-Based Access Control (RBAC)**: Login terpisah untuk Admin CSSD dan Perawat Unit.
*   **Manajemen Inventaris**: Pelacakan siklus sterilisasi, lokasi instrumen, dan status (Steril, Terpakai, Kotor).
*   **QR Code Workflow**:
    *   Generate QR untuk Unit dan Instrumen.
    *   Scan QR untuk Distribusi Barang Steril.
    *   Scan QR untuk Pengambilan Barang Kotor.
*   **FIFO Logic**: Sistem menyarankan barang yang lebih dulu steril untuk didistribusikan (First-In-First-Out).
*   **Dashboard**: Visualisasi stok, aktivitas transaksi, dan grafik penggunaan.

## Prasyarat

Sebelum memulai, pastikan komputer Anda telah terinstal:

*   [Node.js](https://nodejs.org/) (Versi 16 atau terbaru)
*   npm (biasanya sudah terbundle dengan Node.js)

## Cara Instalasi & Menjalankan

1.  **Ekstrak/Clone Proyek**
    Simpan semua file proyek dalam satu folder.

2.  **Install Dependensi**
    Buka terminal (Command Prompt/Terminal) di folder proyek, lalu jalankan:
    ```bash
    npm install
    ```

3.  **Jalankan Aplikasi**
    Untuk memulai server development lokal:
    ```bash
    npm run dev
    ```
    Aplikasi biasanya akan berjalan di `http://localhost:5173`.

4.  **Build untuk Produksi (Opsional)**
    Jika ingin membuat versi siap deploy:
    ```bash
    npm run build
    ```

## Akun Demo

Untuk masuk ke aplikasi, gunakan salah satu peran berikut pada halaman Login:

| Peran | Tombol Login | Fitur Akses |
| :--- | :--- | :--- |
| **Admin CSSD** | Admin CSSD | Akses Penuh (Dashboard, Unit, Inventaris, Distribusi, Validasi) |
| **Perawat Unit** | Perawat Unit | Terbatas (Dashboard, Validasi Penerimaan) |

## Struktur Folder

*   `/src`
    *   `/components` - Komponen UI (Layout, Scanner, dll)
    *   `/context` - State management global
    *   `/pages` - Halaman utama aplikasi
    *   `App.tsx` - Routing utama
    *   `types.ts` - Definisi tipe TypeScript
*   `index.html` - Entry point aplikasi
*   `vite.config.ts` - Konfigurasi build tool

## Catatan Penggunaan Kamera

Fitur Scanner QR membutuhkan izin akses kamera. Jika dijalankan di browser desktop lokal, pastikan browser Anda mengizinkan akses kamera untuk `localhost`.

---
© 2024 MediTrack Hospital Systems
