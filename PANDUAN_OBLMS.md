# Buku Panduan Penggunaan OBLMS (Outcome-Based Learning Management System)

Selamat datang di OBLMS! Dokumen ini adalah panduan lengkap dan detail untuk menggunakan seluruh fitur yang ada di dalam aplikasi OBLMS, yang dirancang khusus untuk mendukung siklus pendidikan berbasis luaran (Outcome-Based Education). Panduan ini dibagi berdasarkan peran (role) pengguna.

---

## DAFTAR ISI
1. [Memulai (Akses, Registrasi, dan Login)](#1-memulai)
2. [Panduan Administrator (Admin & Super Admin)](#2-panduan-administrator)
3. [Panduan Quality Assurance (QA)](#3-panduan-quality-assurance-qa)
4. [Panduan Ketua Departemen (HoD)](#4-panduan-ketua-departemen)
5. [Panduan Dosen](#5-panduan-dosen)
6. [Panduan Mahasiswa](#6-panduan-mahasiswa)

---

## 1. Memulai

### 1.1 Registrasi Akun
**Proses Penggunaan:**
1. Akses halaman utama aplikasi di browser Anda.
2. Klik tombol **Register** atau **Daftar Akun**.
3. Lengkapi form yang disediakan, meliputi: Nama Lengkap, Alamat Email (gunakan email institusi jika ada), dan Password.
4. Klik **Daftar**.
5. *Catatan:* Akun yang baru didaftarkan (khususnya untuk Dosen/Staf) akan berstatus *Pending*. Anda harus menunggu persetujuan (Approval) dari Administrator sebelum dapat melakukan Login.

### 1.2 Login
**Proses Penggunaan:**
1. Masuk ke halaman **Login**.
2. Masukkan Email dan Password yang telah didaftarkan.
3. Klik **Login**.
4. **Keamanan Wajib:** Jika ini adalah login pertama Anda atau jika password Anda baru saja di-reset oleh Admin menjadi *password default*, sistem akan memaksa Anda untuk memperbarui password sebelum mengizinkan akses ke Dashboard.
5. Setelah berhasil, Anda akan diarahkan ke Dashboard sesuai dengan peran (role) Anda.

### 1.3 Mengganti Peran (Switch Role) & Konteks Program Studi
**Proses Penggunaan:**
1. OBLMS mendukung peran ganda. Jika Anda adalah seorang Dosen yang juga menjabat sebagai Ketua Departemen atau staf QA, Anda bisa berpindah dashboard tanpa perlu relogin.
2. Klik pada ikon/nama **Profil Anda** di pojok kanan atas (Header navigasi).
3. Akan muncul dropdown menu. Pada bagian **Ganti Peran / Program Studi**, pilih kombinasi role dan prodi yang ingin Anda kelola saat ini (Misal: `QA - Teknik Informatika`).
4. Halaman akan dimuat ulang (*refresh*) dan seluruh menu sidebar serta data yang ditampilkan akan menyesuaikan dengan otoritas peran tersebut.

---

## 2. Panduan Administrator

Peran Administrator (Admin) dan Super Admin bertanggung jawab atas pengelolaan data master institusi dan persetujuan pengguna.

### 2.1 Manajemen Pengguna
**Proses Penggunaan:**
1. Buka menu **Manajemen Pengguna** dari Sidebar.
2. **Persetujuan Akun (Approval):** Pada tabel pendaftar, cari baris pengguna yang berstatus *Pending*. Klik tombol **Approve (Setujui)** agar pengguna tersebut dapat login.
3. **Mengatur Role Departemen (Assign Role):** Klik icon **Edit** (pensil) pada baris pengguna. Sebuah dialog akan muncul. Pilih Program Studi, lalu centang peran yang diberikan kepada orang tersebut (contoh: Dosen, QA, Admin). Klik Simpan.
4. **Reset Password:** Jika pengguna lupa sandi, Admin dapat mengklik opsi **Reset Password** pada pengguna tersebut. Sistem akan mengatur sandi kembali ke default (misalnya `password123`) dan memaksa pengguna untuk mengubahnya saat login berikutnya.

### 2.2 Manajemen Institusi
**Proses Penggunaan:**
1. Buka menu **Manajemen Institusi**.
2. **Tambah Struktur:** Anda dapat menambah data secara hierarki:
   - Tambah *Universitas* -> Tambah *Fakultas* di bawah universitas -> Tambah *Departemen/Prodi* di bawah fakultas.
3. **Penunjukan Kepala Departemen:** Pada halaman detail sebuah Departemen, pilih opsi **Tetapkan Kepala Departemen**. Sebuah dropdown berisi nama pengguna yang memiliki role di departemen tersebut akan muncul. Pilih satu dosen untuk dijadikan Ketua Departemen yang aktif.

### 2.3 Pengumuman & Pengaturan Sistem
**Proses Penggunaan:**
1. **Membuat Pengumuman:** Masuk ke menu **Pengumuman**, klik **Buat Pengumuman**. Isi judul, konten, dan pilih lingkup (Global seluruh universitas atau spesifik per-Departemen). Pengumuman ini akan muncul di dashboard semua pengguna terkait.
2. **Pengaturan Sistem Global:** Masuk ke menu **Pengaturan**, Admin dapat mengkonfigurasi Rentang Nilai (Grade Scale) konversi skor numerik menjadi huruf (A, B, C) untuk seluruh universitas, serta mematikan/menghidupkan fitur aplikasi.

---

## 3. Panduan Quality Assurance (QA)

Peran QA / Gugus Kendali Mutu bertugas merancang kurikulum berbasis OBE dan mengelola penawaran kelas.

### 3.1 Tinjauan Kurikulum (Curriculum Builder)
Proses ini menggunakan fitur *Stepper* (tahapan berurutan).
**Proses Penggunaan:**
1. Buka menu **Kurikulum OBE**. Klik **Buat Kurikulum Baru** dan tetapkan tahun akademik (misal: 2024-2028).
2. **Langkah 1 (Visi & Misi):** Masukkan rumusan Visi dan Misi institusi/departemen.
3. **Langkah 2 (Profil Lulusan):** Tambahkan Profil Lulusan (GP/Graduate Profiles) yang diharapkan dari alumni prodi ini.
4. **Langkah 3 (PLO - Program):** Masukkan daftar *Program Learning Outcomes* (PLO) / Capaian Pembelajaran Lulusan (CPL).
5. **Langkah 4 (CLO - Bank):** Masukkan bank *Course Learning Outcomes* (CLO) / Capaian Pembelajaran Mata Kuliah (CPMK). CLO ini dapat dikaitkan dengan satu atau lebih PLO.
6. **Langkah 5 (Daftar Mata Kuliah):** Pilih mata kuliah apa saja dari katalog master yang akan ditawarkan dan dimasukkan ke kurikulum tahun ini.
7. **Langkah 6 (Pemetaan / Mapping):** Petakan (centang) kombinasi PLO dan CLO mana saja yang akan diajarkan pada masing-masing mata kuliah.
8. **Langkah 7 (Desain Asesmen):** Untuk tiap CLO yang dipetakan, tentukan instrumen/teknik penilaiannya (contoh: Kuis, Tugas, Ujian Tulis).
9. **Langkah 8 (Pembobotan / Weighting):** Tetapkan persentase bobot untuk masing-masing teknik penilaian yang telah dipilih di langkah sebelumnya agar mencapai total 100%. Ini mengunci standar evaluasi yang harus diikuti dosen.
10. **Langkah 9 (Laporan Kurikulum):** Lihat tinjauan akhir, pratinjau, dan laporan matriks kurikulum secara keseluruhan.
11. **Langkah 10 (Pengajuan & Persetujuan):** Setelah semua tahap selesai, klik **Submit for Approval** pada banner yang tersedia. Draf akan terkunci dan dikirim ke Ketua Departemen untuk direview.

### 3.2 Katalog Mata Kuliah
**Proses Penggunaan:**
1. Buka menu **Katalog Mata Kuliah**.
2. Klik **Tambah Mata Kuliah**. Isi Kode MK, Nama MK, Deskripsi, Jumlah SKS, dan tipe (Wajib/Pilihan). Klik Simpan. Mata kuliah ini akan masuk ke bank data untuk bisa dipakai di kurikulum mana saja.

### 3.3 Manajemen Jadwal & Kelas
**Proses Penggunaan:**
1. Buka menu **Manajemen Jadwal**.
2. Klik **Buka Kelas Baru**. Pilih Mata Kuliah dari kurikulum yang sudah disetujui (Approved).
3. Tetapkan **Dosen Pengampu**, tentukan semester dan tahun ajaran, isi keterangan ruangan/jadwal (contoh: "Senin 08:00 R.101"), lalu klik **Simpan**.

### 3.4 Analitik & Metrik QA
**Proses Penggunaan:**
1. Buka menu **Analitik Capaian** atau **Metrik QA**.
2. Lihat dashboard interaktif yang menampilkan grafik batang ketercapaian rata-rata PLO departemen.
3. Anda dapat melihat laporan kesejajaran (alignment) untuk mendeteksi apakah ada mata kuliah yang bobot CLO-nya belum mencapai 100%.

---

## 4. Panduan Ketua Departemen

Ketua Departemen (Head of Department) berfokus pada persetujuan dan monitoring level strategis.

### 4.1 Persetujuan Kurikulum
**Proses Penggunaan:**
1. Buka menu **Tinjauan Kurikulum**.
2. Cari Kurikulum yang statusnya *Submitted* (warna kuning).
3. Klik dan periksa keseluruhan dokumen (dari Visi Misi hingga Desain Asesmen).
4. Di bagian *Banner* atas, klik **Approve (Setujui)** jika sudah sesuai. Jika ada yang kurang, klik **Revision Requested**, masukkan catatan revisi, dan kembalikan ke QA.
5. Kurikulum yang berstatus *Approved* baru dapat diakses oleh Dosen untuk kelas mereka.

### 4.2 Pantauan Akademik
**Proses Penggunaan:**
1. Pada menu **Metrik QA** atau **Analitik Capaian**, Anda dapat memantau ringkasan statistik departemen secara langsung.
2. Anda bisa melihat daftar mahasiswa berisiko tinggi (At-Risk) hasil kompilasi dari seluruh kelas yang ada di departemen Anda.
3. Buka menu **Metrik QA** untuk melihat kinerja akademik secara makro.

---

## 5. Panduan Dosen

Dosen bertanggung jawab mengelola operasional kelas harian, modul, serta melakukan penilaian (grading) yang selaras dengan panduan QA.

### 5.1 Manajemen Kelas & Modul
**Proses Penggunaan:**
1. Buka menu **Manajemen Kelas**. Anda akan melihat *Cards* berisi kelas yang ditugaskan kepada Anda. Klik **Kelola Kelas**.
2. **Tambah Materi/Modul:** Masuk ke tab **Modul & Materi**. Klik **Tambah Topik Mingguan**. Isi judul pertemuan, minggu ke-berapa, isi konten materi (bisa *embed* link video atau lampiran), dan tandai CLO mana yang sedang dibahas di modul tersebut.
3. **Pengaturan Fitur (Config):** Dosen dapat menghidupkan/mematikan fitur spesifik di kelasnya (seperti Gamifikasi, Jurnal SRL, atau Forum) dari tab Pengaturan.

### 5.2 Pemetaan OBL
**Proses Penggunaan:**
1. Di dalam ruang Kelas, klik tab **Pemetaan OBL**.
2. Halaman ini bersifat *Read-Only* (hanya baca). Ini adalah pedoman (blueprint) yang dibuat QA. Dosen harus melihat tabel ini untuk mengetahui persis CLO apa saja yang ditargetkan di kelas ini dan teknik asesmen apa yang wajib dibuat.

### 5.3 Pembuatan Tugas, Ujian & Penilaian
**Proses Penggunaan:**
1. **Membuat Penugasan:** Buka menu **Penilaian** dari sidebar (atau tab Asesmen di dalam kelas). Klik **Buat Tugas/Kuis**.
2. Anda wajib memilih tipe tugas sesuai yang dipetakan QA. *Sistem akan secara otomatis membatasi CLO yang bisa dipilih berdasarkan desain QA*. 
3. Tentukan due date (tenggat waktu) dan format pengumpulan (Upload File atau CBT/Kuis Online). Klik Simpan & Publish.
4. **Memberi Nilai (Grading):** Setelah mahasiswa mengumpulkan (submit), klik tombol **Nilai Submission**.
5. *Penting:* Form penilaian tidak akan meminta satu nilai "gelondongan". Form akan memecah kotak input nilai berdasarkan CLO yang diukur oleh tugas tersebut (Misal: Nilai untuk CLO-1, Nilai untuk CLO-2). Nilai akhir asesmen akan dikalkulasi secara otomatis oleh sistem berdasarkan persentase bobot CLO.

### 5.4 Gradebook & Analitik Mahasiswa
**Proses Penggunaan:**
1. **Gradebook:** Buka menu **Analitik Mahasiswa** (atau tab Gradebook di dalam kelas). Di sini Anda akan melihat matriks lengkap seluruh mahasiswa. Kolom-kolomnya menjabarkan nilai berdasarkan asesmen, kumulatif CLO, dan perhitungan nilai mutlak serta nilai huruf OBE. Anda bisa menekan tombol **Export to Excel** untuk mengunduh rekap.
2. **Pemantauan Khusus:** Pantau grafik interaktif (grafik radar/bar) performa kelas. Sistem secara cerdas akan menandai mahasiswa dengan label "At-Risk" jika nilainya anjlok di bawah ambang batas rata-rata kelas.

---

## 6. Panduan Mahasiswa

Fokus utama mahasiswa adalah belajar, mengerjakan tugas, dan melatih kemandirian (SRL).

### 6.1 Mengambil Kelas (Enrollment) & Belajar
**Proses Penggunaan:**
1. Buka menu **Kelas Saya**. Sistem akan menampilkan kelas yang berstatus *Published* oleh Dosen.
2. Klik tombol **Enroll (Ambil Kelas)** pada kelas yang ingin diikuti.
3. Setelah masuk kelas, buka tab **Materi Pembelajaran**. Baca secara berurutan materi mingguan yang sudah diunggah oleh Dosen Anda.

### 6.2 Mengerjakan Tugas & Ujian
**Proses Penggunaan:**
1. Buka menu **Tugas & Ujian** dari sidebar, atau pantau dari widget *Upcoming Deadlines* di Dashboard Anda.
2. Klik tugas yang aktif.
3. Jika tipenya Upload: Klik kolom lampiran, masukkan URL dokumen Anda atau file tugas Anda, lalu tekan **Submit**.
4. Jika tipenya Kuis (CBT): Klik **Mulai Kuis**. Jawab pertanyaan pilihan ganda atau esai yang muncul di layar, lalu klik **Selesaikan Kuis**. Nilai (jika otomatis) akan langsung keluar.

### 6.3 Pemetaan OBL & Pantauan Capaian
**Proses Penggunaan:**
1. Buka menu **Analitik Capaian** atau **Pemetaan OBL** di sidebar Anda.
2. Anda bisa melihat sejauh mana Anda sudah menguasai kompetensi yang ditargetkan prodi (Radar Chart PLO). 
3. Anda bisa mengetahui kelemahan spesifik Anda. (Misalnya: Nilai A di mata kuliah tersebut, tapi grafik menunjukkan Anda sangat lemah di CLO khusus praktik laboratorium).

### 6.4 Pelacak SRL (Self-Regulated Learning)
**Proses Penggunaan:**
1. Buka menu **Pelacak SRL** dari sidebar (atau tab Jurnal SRL di dalam ruang kelas).
2. Setiap awal minggu, tetapkan target komitmen jam belajar mandiri (contoh: "Saya akan belajar mandiri 4 jam minggu ini").
3. Di akhir minggu, isi **Jurnal Refleksi**. Tulis kendala yang dialami dan centang "Apakah target belajar saya tercapai?". Hal ini akan membangun kemandirian metakognitif Anda (bisa dilihat oleh Dosen).

### 6.5 Komunitas & Diskusi
**Proses Penggunaan:**
1. **Forum Diskusi:** Buka menu **Komunitas** di sidebar atau masuk ke tab Komunitas di dalam kelas. Klik **Buat Topik (Thread) Baru** jika ada yang ingin ditanyakan. Teman sekelas dan dosen dapat memberikan komentar/balasan.
