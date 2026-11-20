# Multi-Agent Harness & Context Management Architecture

Dokumen ini merangkum arsitektur kerja berbasis file, dokumentasi atomik terkompilasi, tata kelola memori lintas sesi, dan otomasi ritual CLI untuk mengorkestrasi berbagai model AI (kombinasi API berbayar dan gratisan) dalam satu *codebase* secara hemat token dan konsisten.

---

## 1. Topologi Codebase (Monorepo 5-Folder)

Struktur proyek dibagi berdasarkan isolasi tanggung jawab untuk membatasi ruang lingkup pemindaian konteks (*context boundary*) setiap agen:

* **`/folder-a` (Core UI Library)**: *Monorepo packages* untuk komponen inti. Setiap komponen memiliki dokumentasi atomik mandiri pada jalur `/library/components/<component-name>/readme.md`.
* **`/folder-b` (Showcase & Docs)**: Halaman demo, tampilan interaktif komponen, dan dokumentasi penggunaan library.
* **`/folder-c` (Consumer App)**: Aplikasi web contoh yang mengimplementasikan library dari Folder A sebagai validasi integrasi dunia nyata.
* **`/folder-d` (CLI Automation & Rituals)**: Kumpulan skrip Node.js (`.mjs`) untuk mengeksekusi ritual sesi, mengompilasi katalog dokumentasi, serta menjalankan verifikasi kode secara deterministik.
* **`/folder-e` (Orchestrator & Experiments)**: Kode eksperimental, logika generator, atau *server-side orchestrator* yang memanfaatkan library utama secara terprogram.

---

## 2. Atomic Documentation & Autopilot Catalogue

Untuk menghilangkan kebutuhan agen memindai seluruh folder komponen saat membangun fitur di proyek turunan (Folder B, C, atau E), sistem menggunakan pola dua tingkat (*Two-Tier Discovery*):

### A. Atomic `readme.md` (Single Source of Truth per Komponen)
* Setiap komponen di Folder A wajib memiliki `readme.md` lokalnya sendiri (`/library/components/<component-name>/readme.md`).
* Berisi kontrak spesifikasi komponen secara ringkas: *props*, varian, contoh penggunaan minimal, dan batasan perilaku.
* Saat agen memperbaiki atau memodifikasi komponen tertentu, ia cukup memuat satu file atomik ini tanpa menyentuh komponen lain.

### B. Automated Stitching ke `catalogue.json` (Autopilot Index)
* Sebuah skrip khusus di **Folder D** bertugas menyisir seluruh `readme.md` atomik di Folder A dan menggabungkannya (*stitching*) menjadi satu berkas terstruktur: **`catalogue.json`**.
* **Fungsi Autopilot**: Ketika agen bekerja di proyek konsumen (Folder C atau E) dan perlu memakai komponen UI dari library, agen cukup membaca `catalogue.json` sebagai indeks tunggal untuk mengetahui komponen apa saja yang tersedia beserta kontrak penggunaannya tanpa harus menelusuri struktur direktori Folder A.
* Skrip kompilasi katalog ini wajib dijalankan ulang setiap kali ada penambahan komponen baru atau perubahan kontrak API pada `readme.md` atomik.

---

## 3. Hierarki Navigasi & Tata Kelola (`.guidance` & `.docs`)

Untuk menghindari "pajak pembacaan" (*reading tax*) di awal sesi, pengetahuan proyek dipisahkan menjadi tiga lapisan:

### A. Root & Local Routers (`AGENTS.MD`)
* **Root `AGENTS.MD`**: Bertindak murni sebagai *router* global. Hanya berisi peta struktur folder A–E, kontrak akses lintas folder, lokasi `catalogue.json`, dan tautan ke aturan lokal.
* **Sub-folder `AGENTS.MD`**: Berisi batasan teknis spesifik untuk folder terkait.

### B. Tata Kelola Aktif (`/.guidance`)
Berisi dokumen operasional yang mengatur perilaku agen:
* **`Agent_rules.md`**: Aturan pemuatan konteks (*selective reading*). Agen dilarang membaca dokumen lain kecuali relevan dengan tugas aktif atau diperintahkan secara eksplisit.
* **`Rules.md` & `convention.md`**: Standar penulisan kode, struktur komponen atomik, dan larangan teknis.
* **`work_agreement.md`**: Protokol serah terima (*handoff*) dan penyelesaian konflik antar-agen.
* **`boards.md`**: Papan status tugas aktif. Wajib diperbarui agen sebelum dan sesudah bekerja. Dilengkapi aturan *time-to-live* (TTL): entri yang melewati batas usia hari tertentu sah di-*override* oleh agen lain untuk mencegah *deadlock*.

### C. Basis Pengetahuan Pasif (`/.docs`)
Menyimpan artefak jangka panjang seperti referensi teknis, hasil diskusi arsitektur, *summary* komponen, dan *outline* spesifikasi fitur. Hanya dibaca berdasarkan referensi spesifik (*on-demand*).

---

## 4. Protokol Siklus Sesi & Pencegahan Obesitas Konteks

Masalah utama pada *thread* chat jangka panjang (usia >10–14 hari) dengan kualitas hasil yang sudah solid adalah pembengkakan token akibat akumulasi riwayat percakapan. Protokol berikut memindahkan memori dari *chat window* ke *file system*:

### Fase 1: Inisialisasi Sesi (Low-Token Bootstrapping)
1. Agen menjalankan ritual awal melalui CLI: `node folder-d/session.mjs --start` (atau mode interaktif untuk manusia).
2. Agen hanya memindai daftar pekerjaan aktif di `boards.md`, `catalogue.json` (jika tugas melibatkan penggunaan komponen UI), dan riwayat `git log` terbaru.
3. **Fail-Fast Gate**: Jika respons awal agen tidak akurat atau menunjukkan tanda halusinasi, sesi langsung dihentikan dan diganti dengan model/agen lain sebelum terjadi kerusakan data.

### Fase 2: Eksekusi Berbasis Kontrak
* **Model Gratisan / Ringan**: Digunakan untuk pemetaan awal, pembacaan `catalogue.json` atau `readme.md` atomik, penulisan dokumentasi, atau tugas terisolasi dengan profil akses terbatas (*Read-Only* / *Safe Mode*).
* **Model Berbayar / Reasoning Tinggi**: Digunakan untuk eksekusi kode kompleks lintas paket setelah konteks disiapkan.

### Fase 3: Protokol Pre-Compact & Transfer Pengetahuan (Wajib)
Ketika ukuran konteks mendekati batas optimal atau sebelum sesi diakhiri/di-*compact*, agen wajib menjalankan ritual penutupan:
1. **Ekstraksi Pengetahuan**: Merangkum seluruh temuan, keputusan teknis, dan konteks penting yang didapat selama sesi berlangsung ke dalam file `.txt` / `.md` arsip di `.docs` agar tidak hilang saat *chat* dipadatkan.
2. **Pembaruan Katalog & Papan Tugas**:
   * Jika ada perubahan komponen di Folder A, jalankan skrip *stitching* untuk memperbarui `catalogue.json`.
   * Tulis ulang daftar pekerjaan berikutnya di `boards.md` dengan aturan ketat: **maksimal 3 poin utama** dan **maksimal 8 baris total** untuk menjaga kepadatan informasi (*high-signal state*).
3. **Audit Git & Verifikasi**: Mencatat ringkasan perubahan ke `git log` dan menjalankan `npm run verify` untuk memastikan seluruh *build*, *linter*, dan *test* lulus sebelum tongkat estafet dilepas.
4. **Sesi Penutup**: Menjalankan `node folder-d/session.mjs --end` lalu melakukan *compact* pada *thread* atau membuka sesi bersih berikutnya.

---

## 5. Prinsip Desain Utama (Core Takeaways)

* **Jadikan File System Sebagai Memori Utama**: Jangan mengandalkan riwayat *chat* sebagai penyimpanan jangka panjang. *Chat* hanyalah ruang kerja sementara (*RAM*), sedangkan `.guidance`, `.docs`, `catalogue.json`, dan `git log` adalah penyimpanan permanen (*Disk*).
* **Kompilasi Pengetahuan untuk Mesin**: Manusia membaca `readme.md` atomik per folder, sedangkan agen membaca `catalogue.json` hasil *stitching* untuk navigasi cepat tanpa *directory traversal*.
* **Gantikan Thinking Effort dengan CLI**: Segala ritual yang bersifat berulang (pengecekan status, *stitching* katalog, verifikasi *build*) wajib dibungkus dalam skrip `.mjs` di Folder D agar model AI tidak membuang token dan *reasoning* untuk hal prosedural.
