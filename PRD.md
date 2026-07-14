# PRD — Sistem Manajemen Klinik Hewan & Petshop
**Versi:** 1.0
**Status:** Source of Truth — semua keputusan implementasi (developer maupun AI coding agent) HARUS merujuk ke dokumen ini. Jika ada ambiguitas antara kode dan dokumen ini, dokumen ini yang berlaku, kecuali ada perubahan resmi yang menambah versi dokumen.

---

## 1. Ringkasan Produk

### 1.1 Latar Belakang
Owner mengelola klinik hewan sekaligus menjual produk petshop. Saat ini pengelolaan produk, transaksi (POS), rekam medis/perawatan hewan, dan penentuan harga dilakukan secara terpisah/manual. Dibutuhkan satu web app terintegrasi.

### 1.2 Tujuan Produk
1. Satu sistem untuk mengelola produk petshop DAN layanan klinik.
2. Satu POS yang bisa memproses penjualan produk maupun layanan klinik dalam satu transaksi.
3. Monitoring riwayat perawatan/titipan hewan, mendukung banyak hewan per customer.
4. Owner memiliki kontrol penuh dan tunggal atas harga produk dan layanan (role lain tidak bisa mengubah harga).
5. Sistem sederhana, minim konfigurasi, mudah dikembangkan lebih lanjut (arsitektur modular, bukan monolith rumit).
6. UI/UX profesional, bukan tampilan generik/template murahan.

### 1.3 Non-Tujuan (Out of Scope v1)
- Tidak ada integrasi pembayaran online/payment gateway di v1 (transaksi dicatat sebagai cash/transfer manual, status lunas/belum lunas).
- Tidak ada aplikasi mobile native — hanya web app responsive.
- Tidak ada modul akuntansi/pajak lengkap.
- Tidak ada sistem booking/appointment online untuk customer di v1 (bisa jadi v2).
- Tidak ada notifikasi WhatsApp/SMS otomatis di v1 (placeholder untuk v2).

### 1.4 Definisi Kesuksesan (Acceptance Criteria Produk)
- Owner dapat mengubah harga produk/layanan dan perubahan langsung berlaku pada transaksi POS berikutnya.
- Staff dapat menyelesaikan satu transaksi penjualan campuran (produk + layanan) dalam satu alur tanpa berpindah modul.
- Dokter dapat mencatat hasil perawatan pada hewan tertentu dan riwayat tersebut muncul di profil hewan tersebut, terurut berdasarkan waktu.
- Satu customer dapat memiliki banyak hewan, dan setiap hewan punya riwayat perawatan terpisah.
- Customer yang hanya membeli produk cukup dicatat sebagai nama tanpa perlu membuat akun/login.

---

## 2. Tech Stack & Arsitektur

| Layer | Pilihan | Alasan |
|---|---|---|
| Frontend + Backend (BFF) | Next.js (App Router), TypeScript | Satu codebase, server actions mengurangi kebutuhan API layer terpisah |
| Database & Auth | Supabase (Postgres, Supabase Auth, Storage, Row Level Security) | Auth + DB + RLS + storage jadi satu, minim konfigurasi tambahan |
| Hosting | Vercel | Deploy otomatis dari Git, cocok dengan Next.js |
| Styling/UI | Tailwind CSS + shadcn/ui | Konsisten, cepat, terlihat profesional tanpa desain custom dari nol |
| State/data fetching | Supabase JS client + React Server Components; TanStack Query hanya jika dibutuhkan interaktivitas client-side kompleks (mis. POS cart) | Minim boilerplate |
| Testing E2E | Playwright | Sesuai requirement, mendukung multi-role testing |
| Testing Unit/Integration | Vitest (atau Jest) untuk logic murni (kalkulasi harga, total transaksi, dsb.) | Menjaga logic bisnis kritikal (harga, stok) tetap benar |

### 2.1 Prinsip Arsitektur (WAJIB dipatuhi)
1. **Single source of truth harga**: harga produk/layanan HANYA disimpan di tabel `products` dan `services`. Transaksi menyimpan `price_at_transaction` (snapshot) agar riwayat transaksi lama tidak berubah saat harga di-update.
2. **RLS-first**: otorisasi akses data ditegakkan di level database (RLS Supabase), bukan hanya di UI. UI role-check adalah lapisan kedua (UX), bukan satu-satunya pengaman.
3. **Modular by domain**: folder/route dikelompokkan per domain (`products`, `clinic`, `pos`, `pets`, `pricing`), bukan per tipe file, agar mudah dikembangkan/diserahkan ke developer lain.
4. **No premature complexity**: tidak ada microservices, tidak ada queue/event system di v1. Semua synchronous melalui Supabase langsung.
5. **Audit minimal tapi ada**: setiap perubahan harga dan setiap transaksi tercatat dengan `created_by` dan `created_at`.

---

## 3. Role & Hak Akses

| Role | Deskripsi | Bisa Akses |
|---|---|---|
| **Owner** | Pemilik bisnis, akses penuh | Semua modul, termasuk kontrol harga, laporan, manajemen user/role |
| **Dokter** | Tenaga medis klinik | Rekam medis pet, jadwal/riwayat perawatan, lihat data pet & customer, TIDAK bisa ubah harga, TIDAK bisa akses laporan keuangan |
| **Staff** | Kasir/admin harian | POS (transaksi produk & layanan), manajemen stok produk (tambah/kurang stok, TIDAK bisa ubah harga jual), input data customer & pet baru, TIDAK bisa akses rekam medis detail (hanya lihat status umum), TIDAK bisa ubah harga |
| **Customer** | Pemilik hewan | Login opsional: jika punya akun, bisa lihat riwayat & status hewan miliknya sendiri saja (read-only). Jika hanya beli produk, tidak perlu akun — dicatat by name saja pada transaksi |

### 3.1 Matriks Hak Akses Detail

| Aksi | Owner | Dokter | Staff | Customer |
|---|---|---|---|---|
| Lihat/ubah harga produk | ✅ | ❌ | ❌ | ❌ |
| Lihat/ubah harga layanan | ✅ | ❌ | ❌ | ❌ |
| CRUD produk (nama, kategori, stok) | ✅ | ❌ | ✅ (kecuali harga) | ❌ |
| CRUD layanan (nama, deskripsi) | ✅ | ❌ | ❌ | ❌ |
| Buat transaksi POS | ✅ | ❌ | ✅ | ❌ |
| Void/refund transaksi | ✅ | ❌ | ❌ (butuh approval owner) | ❌ |
| Input rekam medis/perawatan | ✅ | ✅ | ❌ | ❌ |
| Lihat rekam medis pet | ✅ | ✅ | ✅ (ringkas, non-medis detail) | ✅ (pet miliknya saja) |
| CRUD data customer & pet | ✅ | ❌ | ✅ | ✅ (data miliknya saja, self-update terbatas) |
| Lihat laporan penjualan | ✅ | ❌ | ❌ | ❌ |
| Manajemen user & role | ✅ | ❌ | ❌ | ❌ |

Catatan implementasi: matriks ini harus tercermin 1:1 di RLS policy Supabase (Bagian 4.9), bukan hanya di UI.

---

## 4. Skema Database (Supabase / Postgres)

Semua tabel menggunakan `id uuid default gen_random_uuid() primary key`, serta `created_at timestamptz default now()`. Tabel yang bisa diubah menyertakan `updated_at timestamptz default now()`.

### 4.1 `profiles`
Extend dari `auth.users` (1:1).
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid (FK ke auth.users.id) | PK |
| full_name | text | |
| role | text check in ('owner','dokter','staff','customer') | |
| phone | text | nullable |
| is_active | boolean default true | untuk nonaktifkan akun staff/dokter tanpa hapus |
| created_at | timestamptz | |

### 4.2 `customers`
Tidak wajib berelasi ke `auth.users` (customer bisa tanpa akun).
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| profile_id | uuid FK profiles.id nullable | diisi jika customer punya akun login |
| full_name | text NOT NULL | wajib diisi minimal nama, untuk customer walk-in |
| phone | text nullable | |
| address | text nullable | |
| created_by | uuid FK profiles.id | staff/owner yang menginput |
| created_at | timestamptz | |

### 4.3 `pets`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| customer_id | uuid FK customers.id NOT NULL | 1 customer → banyak pets |
| name | text NOT NULL | |
| species | text | mis. 'anjing','kucing', dll |
| breed | text nullable | |
| sex | text nullable | |
| birth_date | date nullable | |
| weight_kg | numeric nullable | update tiap kunjungan (histori disimpan di visits) |
| notes | text nullable | alergi, kondisi kronis, dsb |
| photo_url | text nullable | Supabase Storage |
| created_at | timestamptz | |

### 4.4 `product_categories`
| Kolom | Tipe |
|---|---|
| id | uuid PK |
| name | text NOT NULL unique |

### 4.5 `products`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| name | text NOT NULL | |
| category_id | uuid FK product_categories.id nullable | |
| sku | text unique nullable | |
| price | numeric NOT NULL | harga jual saat ini — HANYA owner yang boleh update via RLS |
| cost_price | numeric nullable | harga modal, untuk laporan margin (owner only) |
| stock_qty | integer NOT NULL default 0 | |
| unit | text default 'pcs' | |
| is_active | boolean default true | soft-delete produk |
| updated_at | timestamptz | |

### 4.6 `services`
Layanan klinik (grooming, vaksin, konsultasi, dsb).
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| name | text NOT NULL | |
| description | text nullable | |
| price | numeric NOT NULL | HANYA owner yang boleh update |
| duration_minutes | integer nullable | estimasi durasi |
| is_active | boolean default true | |
| updated_at | timestamptz | |

### 4.7 `price_history`
Audit trail perubahan harga (produk maupun layanan).
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| item_type | text check in ('product','service') | |
| item_id | uuid NOT NULL | |
| old_price | numeric | |
| new_price | numeric | |
| changed_by | uuid FK profiles.id | harus role owner |
| changed_at | timestamptz default now() | |

### 4.8 `visits` (Rekam Medis / Perawatan)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| pet_id | uuid FK pets.id NOT NULL | |
| handled_by | uuid FK profiles.id | dokter yang menangani |
| visit_type | text | mis. 'checkup','vaksin','grooming','rawat_inap' |
| diagnosis | text nullable | |
| treatment_notes | text nullable | |
| weight_kg | numeric nullable | snapshot berat saat visit ini |
| next_visit_recommendation | date nullable | |
| status | text check in ('ongoing','completed') default 'completed' | untuk kasus titip rawat yang masih berjalan |
| transaction_id | uuid FK transactions.id nullable | jika visit ini menghasilkan tagihan |
| created_at | timestamptz | |

### 4.9 `transactions` (POS)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| transaction_number | text unique NOT NULL | mis. INV-20260714-0001 |
| customer_id | uuid FK customers.id nullable | nullable untuk pembeli tanpa data (walk-in anonim, jika diizinkan) |
| cashier_id | uuid FK profiles.id NOT NULL | staff/owner yang input |
| subtotal | numeric NOT NULL | |
| discount | numeric default 0 | |
| total | numeric NOT NULL | |
| payment_method | text check in ('cash','transfer','other') | |
| payment_status | text check in ('paid','unpaid','partial') default 'paid' | |
| status | text check in ('completed','void') default 'completed' | |
| voided_by | uuid FK profiles.id nullable | wajib owner |
| voided_reason | text nullable | |
| created_at | timestamptz | |

### 4.10 `transaction_items`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | PK |
| transaction_id | uuid FK transactions.id NOT NULL | |
| item_type | text check in ('product','service') NOT NULL | |
| item_id | uuid NOT NULL | FK ke products.id atau services.id tergantung item_type (di-enforce di application layer, bukan FK constraint langsung karena beda tabel) |
| item_name_snapshot | text NOT NULL | salinan nama saat transaksi, agar histori tetap benar walau nama produk berubah |
| price_at_transaction | numeric NOT NULL | snapshot harga saat transaksi (WAJIB, ini prinsip arsitektur #1) |
| qty | integer NOT NULL default 1 | |
| line_total | numeric NOT NULL | price_at_transaction * qty |
| pet_id | uuid FK pets.id nullable | diisi jika item adalah layanan klinik untuk pet tertentu |

### 4.11 Relasi Ringkas (ERD naratif)
```
customers 1───N pets 1───N visits
customers 1───N transactions N───N (via transaction_items) products/services
transactions 1───N transaction_items
products N───1 product_categories
price_history N───1 (products atau services)
profiles 1───1 auth.users
```

### 4.12 RLS Policy — Ketentuan Wajib
Diimplementasikan sebagai policy Postgres, contoh ketentuan (bukan syntax final, tapi WAJIB dipenuhi):
- `products.price` dan `services.price`: `UPDATE` hanya diizinkan jika `auth.jwt()` role = 'owner'.
- `transactions`/`transaction_items`: `INSERT` diizinkan untuk role `owner` dan `staff`. `UPDATE status='void'` hanya `owner`.
- `visits`: `INSERT`/`UPDATE` hanya role `dokter` dan `owner`.
- `customers`/`pets` milik sendiri (`profile_id` = auth.uid()): role `customer` hanya boleh `SELECT` data miliknya sendiri.
- Semua tabel: role `staff` tidak boleh `SELECT` kolom `cost_price` pada `products` (gunakan view terpisah tanpa kolom tersebut jika Postgres RLS column-level dibutuhkan, atau exclude di query layer aplikasi).

---

## 5. Spesifikasi Fitur per Modul

### 5.1 Manajemen Produk
**User story:** Sebagai staff/owner, saya ingin mengelola data produk agar stok dan info produk selalu akurat.
- F1.1 — CRUD produk (nama, kategori, SKU, stok, satuan). Staff bisa CRUD kecuali field `price`.
- F1.2 — Owner CRUD kategori produk.
- F1.3 — Update stok manual (in/out) dengan alasan (restock, rusak, penyesuaian).
- F1.4 — Stok otomatis berkurang saat transaksi POS berhasil (item_type='product').
- F1.5 — Notifikasi visual (badge) untuk stok di bawah ambang batas minimum (default 5, bisa dikonfigurasi per produk — field `min_stock_alert` opsional, tambahkan ke skema jika dipakai).
- F1.6 — Soft delete via `is_active=false`, bukan hard delete (agar histori transaksi tidak rusak).

### 5.2 Manajemen Klinik
**User story:** Sebagai dokter, saya ingin mencatat hasil perawatan pet agar riwayat medis tersimpan dan bisa dilihat kembali.
- F2.1 — Owner CRUD layanan klinik (nama, deskripsi, durasi) kecuali field `price` hanya owner (owner sendiri yang CRUD keseluruhan; dokter/staff read-only).
- F2.2 — Dokter membuat entri `visits` baru untuk pet tertentu: diagnosis, catatan treatment, berat badan, rekomendasi kunjungan berikutnya.
- F2.3 — Status visit: `ongoing` (untuk kasus titip rawat inap yang butuh update berkala) dan `completed`.
- F2.4 — Riwayat visit ditampilkan kronologis di halaman profil pet.
- F2.5 — Visit dapat dikaitkan ke transaksi (agar layanan yang diberikan otomatis tertagih di POS).

### 5.3 POS (Point of Sale)
**User story:** Sebagai staff, saya ingin memproses transaksi produk dan layanan sekaligus dalam satu struk.
- F3.1 — Tambah item ke keranjang: cari produk (by nama/SKU) atau layanan (by nama).
- F3.2 — Jika item adalah layanan, wajib pilih `pet_id` terkait (dan otomatis `customer_id` dari pet tersebut).
- F3.3 — Harga item di-snapshot ke `price_at_transaction` saat item ditambahkan ke transaksi (bukan saat checkout, untuk kejelasan; harga tidak berubah lagi setelah masuk keranjang pada sesi tsb).
- F3.4 — Hitung subtotal, diskon (nominal atau persen), total otomatis.
- F3.5 — Pilih metode pembayaran: cash/transfer/other.
- F3.6 — Checkout: generate `transaction_number` unik, kurangi stok produk terkait, simpan transaksi + items.
- F3.7 — Cetak/download struk (PDF atau tampilan print-friendly).
- F3.8 — Void transaksi: hanya owner, wajib isi alasan, mengembalikan stok produk yang terjual dalam transaksi tsb.
- F3.9 — Customer pada transaksi: pilih customer existing, buat baru cepat (quick-add nama+telepon), atau tanpa customer (anonim) jika hanya beli produk dan customer menolak beri data.

### 5.4 Monitoring Hewan (Pet Records)
**User story:** Sebagai customer, saya ingin melihat riwayat perawatan semua hewan peliharaan saya.
- F4.1 — Satu customer dapat memiliki banyak pet; setiap pet punya halaman profil sendiri.
- F4.2 — Profil pet menampilkan: data dasar, grafik/tabel berat badan dari waktu ke waktu (dari histori `visits.weight_kg`), daftar riwayat visit kronologis.
- F4.3 — Customer (jika login) hanya bisa melihat pet miliknya sendiri, read-only.
- F4.4 — Staff/owner dapat menambah pet baru saat customer datang pertama kali (termasuk saat titip rawat).
- F4.5 — Status "sedang dititipkan/rawat inap" terlihat jelas di dashboard (list visits dengan status `ongoing`).

### 5.5 Kontrol Harga (Owner Only)
**User story:** Sebagai owner, saya ingin menjadi satu-satunya yang bisa mengubah harga jual produk dan layanan.
- F5.1 — Halaman khusus "Kontrol Harga" hanya bisa diakses role owner.
- F5.2 — Setiap perubahan harga tercatat otomatis ke `price_history` (old_price, new_price, changed_by, changed_at) — via trigger Postgres atau application logic yang wajib dijalankan dalam transaction DB yang sama.
- F5.3 — Role lain (dokter, staff) melihat harga dalam mode read-only di seluruh bagian aplikasi.
- F5.4 — Owner dapat melihat riwayat perubahan harga per item (grafik/tabel harga vs waktu).

---

## 6. Alur Kerja End-to-End (Workflow Utama)

### W1 — Transaksi Penjualan Produk Saja (Customer Walk-in Tanpa Akun)
1. Staff login → buka POS.
2. Staff cari produk, tambah ke keranjang.
3. Staff input nama customer (quick-add, tanpa akun/login).
4. Staff pilih metode pembayaran, checkout.
5. Sistem: stok produk berkurang, transaksi tersimpan, struk bisa dicetak.

### W2 — Titip Rawat Hewan + Transaksi Layanan
1. Staff/Owner mendaftarkan customer baru + data pet (jika belum ada).
2. Dokter membuka profil pet, membuat entri `visits` baru dengan status `ongoing`, isi diagnosis awal.
3. Staff membuat transaksi POS: tambah item layanan (mis. "Rawat Inap"), pilih pet terkait, checkout → transaksi `transaction_id` dikaitkan ke `visits.transaction_id`.
4. Dokter update entri visit (tambah catatan treatment harian) selama masa rawat, status tetap `ongoing`.
5. Saat pet dipulangkan, dokter set status visit menjadi `completed`, isi rekomendasi kunjungan berikutnya.
6. Customer (jika punya akun) login → melihat riwayat visit pet tersebut ter-update.

### W3 — Owner Mengubah Harga
1. Owner login → buka "Kontrol Harga".
2. Owner pilih produk/layanan, ubah harga, simpan.
3. Sistem mencatat ke `price_history`, harga baru langsung berlaku untuk transaksi baru; transaksi lama tidak berubah (karena snapshot).
4. Staff yang sedang membuka POS di sesi lain melihat harga baru saat menambah item baru ke keranjang.

### W4 — Void Transaksi
1. Staff melapor ke owner ada kesalahan transaksi.
2. Owner buka detail transaksi → pilih "Void", isi alasan.
3. Sistem: status transaksi jadi `void`, stok produk yang terjual dikembalikan, transaksi tidak dihitung dalam laporan penjualan aktif (tapi tetap tampil di histori dengan label void).

### W5 — Customer Dengan Banyak Hewan Mengecek Riwayat
1. Customer login.
2. Dashboard menampilkan daftar semua pet miliknya.
3. Customer pilih salah satu pet → lihat riwayat visit, berat badan dari waktu ke waktu.
4. Customer tidak bisa melihat data pet milik customer lain (ditegakkan oleh RLS).

---

## 7. UI/UX Guidelines

- Desain profesional, bukan default template: gunakan palet warna netral (mis. dasar putih/abu, satu warna aksen — disarankan hijau teal atau biru gelap untuk kesan medis/terpercaya), tipografi jelas (Inter atau sejenis), whitespace cukup.
- Layout dashboard per role: sidebar navigasi berbeda konten sesuai role (owner melihat menu "Kontrol Harga" & "Laporan", dokter/staff tidak).
- POS harus dioptimalkan untuk kecepatan input (keyboard-friendly, search instan, minim klik).
- Profil pet menyerupai "medical record" ringkas: header info dasar, tab/section riwayat, grafik berat badan sederhana.
- Konsisten menggunakan komponen shadcn/ui agar semua form, tabel, modal seragam.
- Mobile-responsive minimal untuk halaman POS dan profil pet (staff/dokter mungkin akses dari tablet).

---

## 8. Kebutuhan Non-Fungsional

- **Performa**: pencarian produk/layanan di POS harus terasa instan (<300ms untuk dataset ratusan item — gunakan index pada `name`/`sku`).
- **Keamanan**: seluruh otorisasi ditegakkan via RLS (bukan hanya UI). Password/auth ditangani penuh oleh Supabase Auth.
- **Reliabilitas data harga**: perubahan harga dan snapshot transaksi tidak boleh race condition — gunakan transaction DB saat checkout POS (update stok + insert transaksi + insert items dalam satu DB transaction/RPC).
- **Auditability**: setiap perubahan harga dan setiap void transaksi harus punya jejak (siapa, kapan, alasan).
- **Skalabilitas kode**: struktur folder per domain agar penambahan fitur baru (mis. booking online di v2) tidak mengganggu modul lain.

---

## 9. Struktur Route/Folder (Next.js App Router) — Acuan Wajib

```
/app
  /(auth)/login
  /(dashboard)
    /owner/pricing          -> F5 Kontrol Harga
    /owner/reports          -> Laporan penjualan
    /products               -> F1 Manajemen Produk (akses owner+staff, field price read-only utk staff)
    /clinic/services        -> F2.1 Manajemen layanan (owner CRUD, dokter/staff read-only)
    /clinic/visits/[petId]  -> F2.2-F2.4 Rekam medis per pet
    /pos                    -> F3 Point of Sale
    /customers
    /pets/[petId]           -> F4 Profil & monitoring pet
  /api (hanya jika perlu endpoint di luar server actions, mis. webhook masa depan)
/lib
  /supabase (client, server, middleware)
  /domain
    /products
    /services
    /pos
    /pets
    /pricing
/components
  /ui (shadcn)
  /pos
  /pets
  /pricing
```

---

## 10. Target Testing

### 10.1 Unit/Integration Test (Vitest)
Wajib meng-cover logic bisnis kritikal, minimal:
- Kalkulasi total transaksi (subtotal, diskon, total) dengan berbagai kombinasi qty & diskon.
- Snapshot harga: memastikan `price_at_transaction` tidak berubah walau `products.price` diubah setelah transaksi dibuat.
- Pengurangan & pengembalian stok (checkout dan void).
- Validasi RLS logic di level fungsi (jika ada helper permission-check di aplikasi).

### 10.2 E2E Test dengan Playwright — Wajib per Fitur & Workflow

Struktur folder test yang disarankan:
```
/tests
  /e2e
    auth.spec.ts
    products.spec.ts
    services-pricing.spec.ts
    pos.spec.ts
    pets-monitoring.spec.ts
    clinic-visits.spec.ts
    void-transaction.spec.ts
    rbac.spec.ts
    workflows/
      w1-walkin-product-sale.spec.ts
      w2-boarding-treatment.spec.ts
      w3-owner-price-change.spec.ts
      w4-void-transaction.spec.ts
      w5-customer-view-pets.spec.ts
```

Gunakan Playwright Projects/storageState untuk login sebagai masing-masing role (owner, dokter, staff, customer) tanpa login ulang di tiap test.

#### 10.2.1 Test per Fitur

**`auth.spec.ts`**
- Login berhasil untuk masing-masing role, redirect ke dashboard sesuai role.
- Login gagal dengan kredensial salah menampilkan error.
- User non-owner tidak bisa mengakses `/owner/pricing` (redirect/403).

**`products.spec.ts`**
- Staff dapat menambah produk baru (tanpa field price editable).
- Staff mencoba mengubah harga produk → field disabled/hidden atau request ditolak.
- Owner dapat menambah, mengubah (termasuk harga), dan menonaktifkan produk.
- Produk yang di-nonaktifkan tidak muncul di pencarian POS.
- Stok produk berkurang otomatis setelah transaksi berhasil (integrasi dengan pos.spec.ts).

**`services-pricing.spec.ts`**
- Owner dapat CRUD layanan klinik termasuk harga.
- Dokter/staff hanya bisa melihat layanan (read-only), tidak ada tombol edit/harga.
- Perubahan harga oleh owner tercatat di `price_history` dan tampil di riwayat harga item tsb.

**`pos.spec.ts`**
- Staff menambah produk & layanan sekaligus ke satu keranjang.
- Saat menambah item layanan, sistem mewajibkan pemilihan pet terkait.
- Total dihitung benar (subtotal, diskon, total) untuk berbagai kombinasi.
- Checkout berhasil membuat `transaction_number` unik, mengurangi stok, dan menampilkan struk.
- Checkout dengan customer baru (quick-add) berhasil menyimpan data customer baru.
- Checkout tanpa data customer (anonim) tetap berhasil jika item hanya produk.

**`pets-monitoring.spec.ts`**
- Owner/staff dapat menambahkan pet baru untuk customer tertentu.
- Satu customer dengan lebih dari satu pet menampilkan seluruh pet di profil customer.
- Customer login hanya dapat melihat pet miliknya sendiri, tidak bisa melihat/akses pet customer lain (uji akses langsung via URL pet_id milik orang lain → harus ditolak).
- Halaman profil pet menampilkan riwayat visit terurut kronologis dan grafik berat badan.

**`clinic-visits.spec.ts`**
- Dokter dapat membuat entri visit baru untuk pet dengan status `ongoing`.
- Dokter dapat mengupdate entri visit yang `ongoing` (tambah catatan) tanpa membuat entri duplikat.
- Dokter mengubah status visit menjadi `completed` beserta rekomendasi kunjungan berikutnya.
- Staff tidak dapat membuat/mengubah entri visit (tombol tidak tersedia / request ditolak).

**`void-transaction.spec.ts`**
- Owner dapat void transaksi dengan alasan wajib diisi.
- Setelah void, stok produk pada transaksi tsb dikembalikan.
- Staff tidak melihat/tidak memiliki akses tombol void.
- Transaksi yang di-void tetap muncul di histori dengan label "void", tidak dihitung di laporan aktif.

**`rbac.spec.ts`** (uji matriks akses Bagian 3.1 secara menyeluruh)
- Setiap kombinasi role × halaman terlarang harus menghasilkan penolakan akses (redirect/403), dites secara tabel-driven (data-driven test) mengikuti matriks di Bagian 3.1.

#### 10.2.2 Test Workflow End-to-End (mengikuti Bagian 6)

**`w1-walkin-product-sale.spec.ts`**
- Login sebagai staff → buka POS → cari & tambah produk → quick-add customer baru by nama → pilih pembayaran cash → checkout → verifikasi stok berkurang, transaksi muncul di histori dengan data customer yang benar.

**`w2-boarding-treatment.spec.ts`**
- Login staff → daftarkan customer + pet baru.
- Login dokter → buat visit `ongoing` untuk pet tsb dengan diagnosis awal.
- Login staff → buat transaksi POS layanan "Rawat Inap" terkait pet tsb → verifikasi `visits.transaction_id` terisi.
- Login dokter → tambah catatan treatment, lalu ubah status ke `completed` dengan rekomendasi kunjungan berikutnya.
- Login customer (jika akun ada) → verifikasi riwayat visit pet tersebut tampil lengkap dan akurat.

**`w3-owner-price-change.spec.ts`**
- Login owner → ubah harga sebuah produk.
- Verifikasi `price_history` bertambah satu entri dengan old/new price benar.
- Login staff → buka POS → tambahkan produk tsb ke keranjang → verifikasi harga yang muncul adalah harga baru.
- Verifikasi transaksi lama (dibuat sebelum perubahan harga) tetap menampilkan harga lama saat dibuka kembali (snapshot tidak berubah).

**`w4-void-transaction.spec.ts`**
- Login staff → buat transaksi produk → checkout.
- Login owner → buka transaksi tsb → void dengan alasan → verifikasi stok kembali seperti semula dan status transaksi `void`.

**`w5-customer-view-pets.spec.ts`**
- Setup: satu customer dengan 2+ pet, masing-masing punya riwayat visit berbeda.
- Login sebagai customer tsb → verifikasi kedua pet tampil di dashboard.
- Buka masing-masing pet → verifikasi riwayat visit yang tampil sesuai/tidak tertukar antar pet.
- Coba akses pet milik customer lain via manipulasi URL → harus ditolak.

### 10.3 Kriteria Lulus Testing (Definition of Done per Fitur)
Sebuah fitur dianggap selesai HANYA jika:
1. Unit test logic bisnis terkait (jika ada kalkulasi/aturan) lulus.
2. Playwright test fitur terkait (Bagian 10.2.1) lulus.
3. Jika fitur bagian dari salah satu workflow W1–W5, Playwright test workflow terkait (Bagian 10.2.2) juga lulus.
4. Tidak ada pelanggaran matriks akses (Bagian 3.1) — dibuktikan lulus `rbac.spec.ts` untuk area terkait.

---

## 11. Roadmap Implementasi (MVP → Lanjutan)

**MVP (Wajib untuk go-live pertama):**
1. Auth + role + RLS dasar
2. Manajemen produk (F1) + kategori
3. Manajemen layanan & kontrol harga (F2.1, F5)
4. POS dasar (F3.1–F3.6)
5. Customer & Pet CRUD dasar (F4.1, F4.4)
6. Visits dasar (F2.2–F2.4)

**Fase 2 (setelah MVP stabil):**
- Cetak struk PDF (F3.7)
- Void transaksi (F3.8, F4)
- Grafik berat badan pet (F4.2 bagian grafik)
- Notifikasi stok minimum (F1.5)
- Laporan penjualan untuk owner

**Fase 3 (opsional/masa depan, di luar scope v1):**
- Booking online untuk customer
- Notifikasi WhatsApp/email otomatis
- Payment gateway online
- Multi-cabang (jika bisnis berkembang)

---

## 12. Glosarium
- **Snapshot harga**: nilai harga yang disalin ke transaksi pada saat item ditambahkan, agar tidak berubah meski harga master berubah kemudian.
- **Walk-in**: customer yang datang langsung tanpa perlu akun/login, cukup dicatat nama.
- **Ongoing visit**: entri rekam medis yang masih berjalan (mis. rawat inap), belum ditutup/diselesaikan.
- **RLS (Row Level Security)**: mekanisme Postgres/Supabase untuk membatasi akses baris data berdasarkan identitas/role user secara langsung di database.

---

*Dokumen ini adalah acuan mutlak. Setiap penambahan/pengubahan fitur wajib memperbarui dokumen ini terlebih dahulu (naikkan versi) sebelum diimplementasikan di kode.*
