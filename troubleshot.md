# Rangkuman Perbaikan Bug (Troubleshoot)

Berikut adalah rangkuman dari bug-bug yang ditemukan beserta perbaikannya selama proses pengembangan proyek ini, yang disusun berdasarkan riwayat commit/chat:

## 26 September 2026
* **Bug**: Ada kendala pada fungsionalitas fitur buku nilai (gradebook).
  * **Perbaikan**: Melakukan perbaikan pada sistem atau kalkulasi _gradebook_.
* **Bug**: Tombol "Unenroll" (batal pendaftaran) tetap muncul walau batas waktu (deadline) sudah lewat.
  * **Perbaikan**: Menyembunyikan tombol pembatalan pendaftaran secara default, tombol hanya akan muncul jika periode aktif masih berlaku.
* **Bug**: Nama instruktur/dosen tidak bisa digunakan dalam pencarian (search filter) pada halaman kursus mahasiswa.
  * **Perbaikan**: Menambahkan variabel nama instruktur ke dalam logika filter pencarian kursus.
* **Bug**: Tampilan UI dan Badge (label) pada halaman evaluasi mahasiswa global tidak terlihat jelas saat menggunakan mode gelap (_dark mode_).
  * **Perbaikan**: Menerapkan antarmuka panel samping (sheet side panel) dan memperbaiki kontras warna pada badge agar nyaman dibaca di mode gelap.
* **Bug**: Warna teks pada badge CLO (Course Learning Outcome) menyatu dengan _background_ di mode gelap, sehingga sulit dibaca.
  * **Perbaikan**: Menyesuaikan pewarnaan teks (text colors) khusus saat mode gelap aktif.
* **Bug**: Teks yang diketik menggunakan SunEditor tidak terbaca di mode gelap karena warna teks yang tidak terwariskan dengan benar.
  * **Perbaikan**: Memaksa elemen dengan kelas `sun-editor-editable` untuk mewarisi warna teks (inherit) secara langsung di mode gelap.
* **Bug**: Deskripsi kaya teks (_rich text_) tidak menampilkan format sebagaimana mestinya dari editor.
  * **Perbaikan**: Menyesuaikan proses render agar deskripsi dilingkupi dengan kelas `sun-editor-editable` agar tampil sesuai format aslinya.
* **Bug**: Antarmuka tampilan (UI) untuk baris daftar penilaian kursus tidak optimal.
  * **Perbaikan**: Mengubah antarmuka penilaian kursus menggunakan komponen panel (Sheet) agar interaksi lebih nyaman.
* **Bug**: Ketidaksesuaian pencatatan atau tampilan jam (_timezone_) pada sistem.
  * **Perbaikan**: Melakukan sinkronisasi dan perbaikan perhitungan _timezone_ di aplikasi.

## 25 September 2026
* **Bug**: Aplikasi terjebak dalam putaran alih-halaman (infinite redirect loop) karena konflik state management.
  * **Perbaikan**: Menambahkan penanda versi (versioning) pada konfigurasi _Zustand store_ agar tidak terjadi loop berkepanjangan.
* **Bug**: Tidak ada dukungan format teks khusus untuk penjelasan detail (rich text), dan _link_ rute di dashboard ada yang terputus.
  * **Perbaikan**: Mengimplementasikan perpustakaan SunEditor dan memperbaiki path navigasi dashboard.

## 26 Juni 2026
* **Bug**: Laporan kurikulum mengalami error bentrok data (_duplicate key error_) karena daftar mata kuliah yang tidak dipilih ikut ter-render dengan kunci yang sama.
  * **Perbaikan**: Mengubah logika iterasi mata kuliah pada komponen untuk mencegah penggunaan *key* (kunci) ganda.
* **Bug**: Tabel Quality Assurance (QA) di dashboard menampilkan data kurikulum yang tidak aktif dan menghilangkan (hide) mata kuliah yang kosong tanpa sengaja.
  * **Perbaikan**: Memperbaiki fungsi _filter_ agar hanya merender kurikulum yang aktif dan menampilkan status mata kuliah meskipun belum ada nilainya.

## 11 Juni 2026
* **Bug**: Terdapat sedikit *glitch* pada dashboard khusus Quality Assurance (QA).
  * **Perbaikan**: Memperbaiki dan menstabilkan dashboard QA.

## 10 Juni 2026
* **Bug**: Formulir registrasi tidak menyesuaikan bahasa/terjemahan nama-nama _role_, dan ada kesalahan penempatan admin universitas (admin assignment).
  * **Perbaikan**: Menerjemahkan peran-peran (_roles_) pada form dan memperbaiki mekanisme penetapan admin ke universitas yang sesuai.
* **Bug**: Dialog untuk Edit User Role mengalami kegagalan (crash) karena ada komponen yang belum diimpor (_Missing Input import_).
  * **Perbaikan**: Menambahkan `import { Input }` yang hilang di dalam komponen _EditUserRoleDialog_.
* **Bug**: Terjadi error _TypeScript_ karena data fakultas/departemen menerima data nilai universitas kosong (null) yang tidak dizinkan oleh sistem.
  * **Perbaikan**: Mengubah _type checking_ untuk mengizinkan (allow) nilai *null* untuk referensi universitas pada komponen departemen.
* **Bug**: Siapa saja bisa membuat universitas baru tanpa izin yang sesuai.
  * **Perbaikan**: Membatasi rute akses dan API pembuatan universitas hanya untuk akun *Super Admin*.

## 09 Juni 2026
* **Bug**: Sistem _error_ karena kendala _Foreign Key_ sewaktu profil admin diedit, gara-gara data lawas _departmentRoles_ admin.
  * **Perbaikan**: Mengonfigurasi form agar mengabaikan (_ignore_) status data lama tersebut waktu melakukan pembaruan (_update_).
* **Bug**: Admin bisa memilih menu pilihan (*dropdown*) role kosong, atau universitas yang tersedia tidak dimuat sepenuhnya.
  * **Perbaikan**: Memperbaiki pengambilan (_fetching_) data universitas agar menampilkan seluruhnya dan otomatis menonaktifkan opsi kosong.
* **Bug**: Tampilan nama institusi di tabel _user_ (pengguna) terpotong/tidak responsif, dan tombol saring (filter) fakultas muncul untuk role Admin yang tidak seharusnya ada.
  * **Perbaikan**: Memperbaiki struktur responsif tabel dan memberikan logika untuk menyembunyikan filter fakultas bagi admin.
* **Bug**: Pesan *error* bawaan Vercel Blob (layanan _storage_) tidak ramah pengguna.
  * **Perbaikan**: Menyesuaikan dan memoles _error message_ khusus untuk komponen unggah data _Vercel Blob_.
* **Bug**: Halaman bantuan atau dukungan (_support_) mahasiswa gagal ter-render saat di-*build*.
  * **Perbaikan**: Menambahkan instruksi _force dynamic_ pada laman *student support* agar selalu dirender dengan benar.


# Jawaban QnA Sidang Disertasi (Sistem OLIMS)

**Pertanyaan:**
Q12. Black-Box 100% berhasil — apakah tidak ada satu pun bug atau kegagalan? Bagaimana kes ujian disusun?

**Jawaban:**

Tingkat keberhasilan 100% pada pengujian Black-Box bukanlah hasil instan yang mulus pada percobaan pertama, melainkan merupakan **hasil akhir yang dicapai setelah melalui beberapa iterasi pengujian dan perbaikan (debugging)**. 

Terkait penyusunan pengujian, terdapat **30 kes ujian (test cases)** yang diturunkan secara terstruktur dari 30 elemen kerangka fungsional sistem OLIMS. Hal ini dilakukan untuk memastikan adanya rekam jejak (*traceability*) yang jelas antara kebutuhan sistem dengan skenario pengujiannya.

Pada kenyataannya, proses pengujian tersebut berjalan sangat sehat yang dibuktikan dengan penemuan sejumlah *bug* (kegagalan) pada siklus awal dan pertengahan. Angka 100% didapat setelah semua celah tersebut ditangani. Berikut adalah beberapa contoh perbaikan *bug* nyata yang terekam selama proses iterasi pengembangan sistem OLIMS:

1. **Bug Tampilan Pengumpulan Tugas**: Ditemukan kegagalan fungsi di sisi antarmuka mahasiswa di mana jika mahasiswa mengumpulkan lebih dari satu tautan/link tugas, sistem hanya mampu menampilkan satu tautan (tautan lainnya tidak terlihat). Perbaikan dilakukan dengan merender seluruh array *attachments*.
2. **Kebocoran Akses Tugas Draft**: Ditemukan bug logika di mana tugas dari sebuah mata kuliah yang masih berstatus "Draft" (belum diterbitkan oleh dosen) tetap bocor dan muncul di dasbor mahasiswa. Perbaikan dilakukan dengan memperketat kueri pencarian berdasarkan status terbit (*isPublished*) pada pengaturan mata kuliah (*CourseConfig*).
3. **Kegagalan Sistem (Infinite Redirect Loop)**: Aplikasi sempat mengalami malfungsi putaran alih-halaman tiada henti (infinite loop) yang disebabkan oleh konflik pengelolaan *state* (Zustand).
4. **Error pada Filter dan Pelaporan**: Fitur filter pencarian berdasarkan nama instruktur tidak merespons, serta pelaporan kurikulum sempat mengalami gangguan *duplicate key error* karena mata kuliah kosong yang ikut diproses.
5. **Validasi Waktu (Tombol Unenroll)**: Terdapat kesalahan validasi di mana tombol batal pendaftaran kursus (*unenroll*) tetap bisa diakses meskipun periode waktunya sudah habis.

Keberhasilan 100% pada pengujian Black-Box menegaskan bahwa **semua *bug* yang ditemukan selama proses iterasi telah sukses diperbaiki**. Ke-30 kes ujian akhir dapat dieksekusi tanpa satu pun kegagalan, membuktikan bahwa fungsionalitas sistem OLIMS sudah stabil dan sesuai dengan elemen kerangka yang ditetapkan.


# Pemetaan Akses Menu Berdasarkan Role (OLIMS)

Sistem OLIMS memiliki arsitektur multi-role di mana setiap pengguna (user) memiliki akses ke fitur dan menu yang spesifik sesuai dengan perannya di institusi. Berikut adalah ringkasan menu beserta tab-tab turunan (jika ada) yang dapat diakses oleh masing-masing *role*:

## 1. Mahasiswa (Student)
Role ini ditujukan bagi mahasiswa untuk mengikuti kegiatan perkuliahan, mengerjakan tugas, dan melacak kemajuan akademik mereka.
* **Dashboard (`/student`)**: Halaman utama yang menampilkan ringkasan aktivitas dan pengingat jadwal.
* **Kelas Saya (`/student/courses`)**: Daftar mata kuliah yang sedang diikuti. Saat masuk ke detail sebuah mata kuliah, menu ini terbagi lagi menjadi tab berikut:
  * **Materi & Topik**: Modul dan bahan ajar yang dibagikan dosen.
  * **Tugas & Penilaian**: Daftar tugas/kuis khusus mata kuliah tersebut (terdapat sub-tab **Detail Penugasan** dan **Pengumpulan** pada masing-masing tugas).
  * **Rekap Capaian & Nilai**: Menampilkan rincian nilai mahasiswa yang terbagi atas tab **Rekap Capaian (OBE)** dan **Buku Nilai (Komponen)**.
  * **Forum Diskusi**: Tempat berdiskusi khusus kelas tersebut.
  * **Jurnal SRL & Refleksi**: Area untuk mengisi catatan refleksi belajar mandiri (Self-Regulated Learning).
  * **Papan Peringkat (Leaderboard)**: Peringkat poin gamifikasi di kelas.
  * **Umpan Balik**: Kuesioner evaluasi untuk mata kuliah dan dosen.
* **Tugas & Ujian (`/student/assessments`)**: Halaman ringkasan untuk melihat tugas yang tertunda dan selesai dari semua mata kuliah secara global.
* **Pemetaan OBL (`/student/obl`)**: Pemantauan pencapaian *Outcome-Based Learning*.
* **Pelacak SRL (`/student/srl`)**: Fitur evaluasi diri global.
* **Analitik Capaian (`/student/analytics`)**: Grafik dan data capaian pembelajaran. Terdapat pembagian tab analitik:
  * **Rata-rata PLO** (Program Learning Outcome)
  * **Rata-rata CLO** (Course Learning Outcome)
  * **Rata-rata SCL** (Student-Centered Learning)
* **Komunitas (`/student/community`)**: Forum diskusi antar mahasiswa dan dosen lintas mata kuliah.
* **Pusat Bantuan (`/student/support`)**: Layanan pembuatan tiket bantuan/keluhan.
* **Profil (`/profile`)**: Pengaturan data diri mahasiswa.

## 2. Dosen (Teacher)
Role ini ditujukan bagi dosen (pengajar) untuk mengelola kelas, memberikan nilai, dan memantau perkembangan anak didiknya.
* **Dashboard (`/teacher`)**: Ringkasan kelas yang diajar dan tugas yang perlu dinilai.
* **Manajemen Kelas (`/teacher/courses`)**: Tempat dosen mengatur deskripsi dan modul kelas. Di dalam detail kelas, dosen memiliki akses ke tab-tab yang sama dengan mahasiswa (Materi, Tugas, Rekap Capaian, Forum, dll), namun dengan hak akses editor (Tambah/Ubah/Hapus).
* **Penugasan & Ujian (`/teacher/assessments`)**: Mengelola penugasan seluruh mata kuliah. Terdapat menu/dialog pembuatan tugas dengan tab:
  * **Tugas Baru**: Membuat deskripsi tugas/kuis dari awal.
  * **Salin dari Kelas Lain**: Menduplikasi tugas yang sama dari kelas sebelumnya.
* **Pemantauan Mahasiswa (`/teacher/students`)**: Daftar kehadiran dan mahasiswa. Terdapat fitur penambahan mahasiswa (Enrollment) dengan tab:
  * **Import CSV (Banyak)**: Mendaftarkan mahasiswa secara masal.
  * **Input Manual (Satu)**: Mendaftarkan mahasiswa secara tunggal.
* **Pemetaan OBL (`/teacher/obl`)**: Pengaturan *Course Learning Outcome* (CLO).
* **Pelatihan Dosen (`/teacher/training`)**: Modul peningkatan kompetensi pengajar.

## 3. Quality Assurance (QA / Gugus Kendali Mutu)
Role ini digunakan oleh tim penjamin mutu untuk memastikan standar kurikulum tercapai.
* **Dashboard QA (`/qa`)**: Gambaran umum metrik akademik institusi.
* **Manajemen Kurikulum (`/qa/curriculum`)**: Memantau dan merancang struktur kurikulum.
* **Pemantauan Mata Kuliah (`/qa/subjects`)**: Analisis kesesuaian materi silabus.
* **Analisis Data (`/qa/analytics` & `/qa/metrics`)**: Laporan statistik pencapaian. Data analitik mahasiswa per angkatan disajikan dengan tab yang sama seperti analitik mahasiswa:
  * **Rata-rata PLO**
  * **Rata-rata CLO**
  * **Rata-rata SCL**
* **Evaluasi Dosen & Mahasiswa (`/qa/teachers` & `/qa/students`)**: Memantau aktivitas, partisipasi, dan tingkat kelulusan.
* **Umpan Balik (`/qa/feedback`)**: Mengelola kuesioner akademik.
* **Jadwal Akademik (`/qa/schedules`)**: Pantauan kalender akademik.

## 4. Administrator (Admin)
Role staf tata usaha/admin institusi untuk mengelola pendaftaran (*enrollment*) dan data master.
* **Dashboard Admin (`/admin`)**: Halaman ringkasan operasional sistem.
* **Manajemen Pengguna (`/admin/users`)**: Mengelola akun pengguna. Halaman ini dibagi menjadi tab:
  * **Daftar Pengguna / Semua Pengguna**
  * **Menunggu Persetujuan** (Approval Pendaftaran)
  * **Akses & Peran** (Permintaan akses tambahan lintas jurusan)
* **Manajemen Institusi (`/admin/institutions`)**: Mengelola struktur data akademik, terdiri dari tab:
  * **Universitas**
  * **Fakultas**
  * **Program Studi**
* **Pengaturan Sistem (`/admin/settings`)**: Konfigurasi parameter institusi, terdiri dari tab:
  * **Rentang Nilai** (Pengaturan skala bobot dan huruf mutu)
  * **Fitur Global** (Pengaturan fitur umum/sistem)
  * **Tahun Ajaran** (Pengaturan periode waktu aktif akademik)
* **Pengaturan Peran (`/admin/roles`)**: Mendistribusikan kewenangan.
* **Pengumuman (`/admin/announcements`)**: Penyiaran informasi massal kepada sivitas akademika.
* **Helpdesk (`/admin/support`)**: Merespons tiket keluhan/bantuan dari pengguna.

## 5. Super Admin
Role pemegang hak akses tertinggi di aplikasi (Developer/Pusat).
* **Global Users (`/super_admin/users`)**: Mengelola admin pusat dan pendaftaran awal institusi/universitas baru. Halaman dibagi menjadi tab:
  * **Semua Admin**
  * **Menunggu Persetujuan** (Approval Registrasi Kampus)

## 6. Pimpinan Institusi (Dekan & Rektor)
Role eksekutif (top-level) yang berfokus pada pelaporan agregat (tingkat makro). Memiliki rincian tab analitik (*Rata-rata PLO, CLO, SCL*) serupa dengan menu QA.
* **Fakultas Analytics (`/dean/analytics`)**: Pantauan agregat metrik tingkat khusus satu fakultas (untuk Dekan).
* **Universitas Analytics (`/rector/analytics`)**: Pantauan agregat metrik seluruh fakultas secara universal (untuk Rektor).
