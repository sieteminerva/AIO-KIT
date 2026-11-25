# WORK AGREEMENT, MODEL ROUTING & HANDOFF PROTOCOL

## 1. Matriks Pembagian Peran Model (Cost-to-Intelligence Routing)
Gunakan model yang paling tepat berdasarkan kompleksitas tugas untuk memaksimalkan efisiensi biaya:

| Fase / Jenis Tugas | Agen / Jalur Utama | Sifat Konteks & Batasan | Tujuan Efisiensi |
| :--- | :--- | :--- | :--- |
| **Brainstorming & Riset** | Google Search AI Mode / Web Chat | Di luar IDE (*Zero IDE Token*). | Menjaga *context window* editor tetap bersih dari sampah eksplorasi. |
| **Arsitektur, Outlining & Review** | Codex (Paid) | *High-signal input* (`.guidance` & *outline*). | Volume token kecil namun butuh penalaran tinggi agar desain tidak salah arah. |
| **Eksekusi Kode Utama** | Copilot + DeepSeek API | Membaca spesifikasi matang & `catalogue.json`. | Biaya *output* token sangat murah dengan kecepatan penulisan kode tinggi. |
| **Bug Fixing & Patching** | GitHub Copilot (Free Tier) | *Narrow scope* (1 file + *stack trace* error). | Memanfaatkan kuota gratis harian untuk perbaikan terisolasi. |
| **Dokumentasi Atomik** | Model Gratis / Ringan | Membaca kode komponen jadi -> tulis `readme.md`. | Tugas transformasi teks sederhana tanpa beban *reasoning* berat. |

## 2. Tata Kelola Memori Native vs. Filesystem
* **Native Memory (Copilot Memories)**: Hanya digunakan untuk menyimpan preferensi statis (*coding style*, konvensi bahasa, larangan global).
* **Project Filesystem (`boards.md` & `catalogue.json`)**: Satu-satunya sumber kebenaran (*Single Source of Truth*) untuk status tugas dinamis dan kontrak komponen.

## 3. Aturan Estafet & Override (Anti-Deadlock)
* Setiap entri di `boards.md` memiliki masa berlaku (TTL) 24 jam. Jika melewati batas tersebut atau sesi terputus, agen berikutnya sah melakukan *override*.
* Sebelum perpindahan agen, wajib menjalankan protokol *pre-compact* dan memperbarui `boards.md` (maksimal 3 poin / 8 baris).
