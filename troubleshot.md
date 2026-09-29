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
* **Bug**: Ada bagian teks aplikasi belum mengikuti konfigurasi terjemahan (bahasa).
  * **Perbaikan**: Mengubah dan memperbaiki teks dengan format sistem multibahasa.
* **Bug**: Halaman bantuan atau dukungan (_support_) mahasiswa gagal ter-render saat di-*build*.
  * **Perbaikan**: Menambahkan instruksi _force dynamic_ pada laman *student support* agar selalu dirender dengan benar.
