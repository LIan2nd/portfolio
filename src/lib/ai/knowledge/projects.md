# Proyek

## leath_notes — Leath Notes
- **Live app:** https://leath-note.my.id
- **Creator:** Alfian Nur Usyaid (LIand).
- **Kategori:** productivity / fullstack web application.
- **Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, tRPC v11, TanStack Query v5, Prisma 6, PostgreSQL, NextAuth.js v5, Vitest.

### Ringkasan, Fitur & Arsitektur
Notepad web skeuomorfik menyerupai buku catatan kulit di meja kayu, dengan pengalaman menulis tenang dan paper-first.
- CRUD catatan pribadi, autosave dengan debounce satu detik, folder, dan pengorganisasian drag-and-drop.
- Guest mode tanpa akun; autentikasi email dan Google OAuth opsional.
- AI assistant opsional mendukung Ollama, OpenAI, Gemini, Anthropic, dan OpenRouter.
- Sidebar responsif, mobile drawer, serta keyboard shortcuts.
- Next.js App Router menjadi fondasi fullstack; tRPC menyediakan API type-safe, TanStack Query mengelola server state, Prisma menyimpan data ke PostgreSQL, dan NextAuth.js mengamankan akses pengguna.

## roadsense — RoadSense
- **Repository:** https://github.com/LIan2nd/RoadSense
- **Status:** **sudah selesai**.
- **Lisensi:** MIT.
- **Kategori:** web-based GIS / smart road safety navigation.

### Ringkasan & Fitur
Platform keselamatan jalan partisipatif yang menggabungkan laporan kerusakan dari masyarakat dan analisis buffer spasial untuk merekomendasikan rute aman.
- Peta interaktif layar penuh dengan sebaran kerusakan real-time dan marker berwarna sesuai tingkat bahaya.
- Pengguna terautentikasi dapat melaporkan lokasi, foto, deskripsi, serta keparahan **Low / Medium / High / Critical**.
- Progres penanganan laporan: `Open` → `Verified` → `In Progress` → `Resolved`.
- Perencanaan origin / destination, deteksi perpotongan buffer rute dengan titik bahaya, peringatan visual bahaya tinggi, dan riwayat pencarian rute.
- Autentikasi email / password dan Google OAuth dengan proteksi route melalui middleware.

### Arsitektur
- **Frontend & app backend / T3:** Next.js 15 App Router, TypeScript, Tailwind CSS v4, shadcn/ui, tRPC, Prisma, PostgreSQL, Leaflet, Zustand, NextAuth.js v5.
- **Backend analitik spasial:** Flask / Python dan Shapely untuk kalkulasi geometri serta deteksi route-hazard collision.
- **Layanan eksternal:** OSRM untuk kalkulasi rute jalan tercepat dan OpenStreetMap untuk tile peta.

## digiarc — DigiArc
- **Live:** https://digiarc.vercel.app
- **Repository:** https://github.com/LIan2nd/digiarc
- **Status:** **sudah selesai**.
- **Stack:** Next.js, React, TypeScript, Tailwind CSS, Wagmi, Ethers.js, Solidity, IPFS, Web3.js.
- **Kategori:** Web3 / blockchain / decentralized file storage.

### Ringkasan, Fitur & Arsitektur
Penyimpanan berkas terdesentralisasi yang terinspirasi Google Drive, berfokus pada integritas data dan transparansi kepemilikan tanpa satu server penyimpanan pusat.
- Berkas disimpan di IPFS dan diakses melalui CID (Content Identifier) unik / immutable.
- Smart contract Solidity pada blockchain EVM memetakan metadata berkas ke wallet pemilik sebagai bukti integritas data / cryptographic proof-of-storage.
- Integrasi wallet melalui Wagmi, termasuk MetaMask, untuk mengelola, mengunggah, dan mengunduh berkas.
- UI responsif Next.js / Tailwind CSS dengan manajemen state transaksi blockchain.

## esao_research — ESAO (Essay Analytic Online)
- **Platform:** https://esao.nurulfikri.ac.id
- **Author & creator:** Akhmam Fahmi & Alfian Nur Usyaid.
- **Status:** **sudah selesai**.

### Ringkasan & Dampak
Platform AI untuk penilaian otomatis soal esai / uraian bagi dosen dan perguruan tinggi, saat ini dikhususkan untuk STT NF. Mengurangi beban koreksi manual, meningkatkan konsistensi penilaian, dan menghemat hingga **80% waktu koreksi**; **30 esai selesai dalam kurang dari dua menit**.

### Arsitektur & Fitur
- **Frontend:** Next.js / React dan Tailwind CSS; dashboard kelas, bank soal, monitor ujian real-time, dan ekspor nilai ke Excel dalam satu klik.
- **PWA:** mendukung Bahasa Indonesia, English, 日本語, serta dark mode.
- **Backend / AI:** Flask / Python dan LangChain dengan arsitektur decoupled; scoring mengikuti rubrik dosen.
- Vision AI menilai jawaban multimodal berupa teks dan lampiran diagram / gambar; menghasilkan feedback detail dan alasan penilaian per butir soal.

## chicken_yasaka — Chicken Yasaka
- **Repository:** https://github.com/MuhamadMudrikaRidho/web_chicken_yaska
- **Status:** **sudah selesai**.
- **Riwayat program & sertifikat:** [Pendidikan & Pengalaman](education_experience.md#program-kampus-merdeka-msib-batch-7).
- **Stack:** Python 3 / Flask, JavaScript / jQuery AJAX, Bootstrap 5, Jinja2, MongoDB / PyMongo.
- **Kategori:** fullstack e-commerce untuk pemesanan dan penjualan ayam potong / unggas segar.

### Fitur & Arsitektur
- Katalog produk menampilkan harga, berat / kemasan, dan stok.
- Keranjang AJAX untuk tambah produk, ubah jumlah, dan hitung total real-time tanpa reload; form checkout memvalidasi data pengiriman di client.
- Backend memisahkan route handler, business logic, dan rendering dengan MVC; endpoint REST menangani mutasi keranjang dan pemrosesan order.
- Template Jinja2 modular untuk navbar, kartu produk, modal keranjang, dan footer.
- MongoDB menyimpan produk dan riwayat transaksi; PyMongo menangani query katalog, pembuatan pesanan, serta pembaruan status.
- Dashboard admin untuk meninjau daftar / detail pesanan dan mencatat status transaksi.

## l_movie — L-Movie
- **Live:** https://lmovie.liand.web.id
- **Konteks:** proyek UTS mata kuliah Pemrograman Frontend di STT Terpadu Nurul Fikri.
- **Stack:** HTML5, CSS3, JavaScript / React, Fetch API, TMDB / Movie Database API.
- **Kategori:** frontend movie discovery / API data fetching.

### Fitur
- Mengambil katalog film secara asinkron melalui REST API: poster, rating, sinopsis, tanggal rilis, dan genre.
- Merender kartu film dari data JSON, mencari / memfilter judul, dan menampilkan detail film.
- Layout responsif untuk perangkat mobile dan desktop.

## hrd_api — HRD RESTful API
- **Repository:** https://github.com/LIan2nd/uas-pemrograman-backend
- **Konteks:** final project UAS Pemrograman Backend di STT Terpadu Nurul Fikri.
- **Stack:** Node.js, Express.js, MySQL / mysql2, Passport.js, Body-Parser, Dotenv.

### Arsitektur MVC & OOP
- `routes/api.js` memetakan endpoint ke controller; `EmployeeController` mengenkapsulasi validasi payload, HTTP response, serta pemanggilan model; `Employee` menangani persistensi / transaksi SQL dan parameterized queries. Pemisahan ini menerapkan Single Responsibility Principle.
- Class `EmployeeController` di `controllers/EmployeeController.js` memuat `index`, `store`, `find`, `update`, `destroy`, `search`, `active`, `inactive`, dan `terminated`.
- Class `Employee` di `models/Employee.js` mengabstraksi query melalui static methods `all`, `create`, `show`, `update`, `delete`, dan `search` dengan pola DAO / Active Record.
- Method model mengembalikan Promise dan dikonsumsi controller dengan `async/await` untuk I/O non-blocking.

### Endpoint RESTful
| Method | Endpoint | Fungsi |
| --- | --- | --- |
| GET | `/api/employees` | Daftar pegawai |
| POST | `/api/employees` | Validasi dan tambah pegawai; status 201 / 422 |
| GET | `/api/employees/:id` | Detail berdasarkan ID |
| PUT | `/api/employees/:id` | Update dengan validasi dinamis |
| DELETE | `/api/employees/:id` | Hapus pegawai |
| GET | `/api/employees/search/:name` | Pencarian nama parsial / spesifik |
| GET | `/api/employees/status/active` | Filter pegawai aktif |
| GET | `/api/employees/status/inactive` | Filter pegawai nonaktif |
| GET | `/api/employees/status/terminated` | Filter pegawai terminated |

## event_management — Event Management System
- **Repository:** https://github.com/LIan2nd/sistem-pendaftaran-event
- Platform pendaftaran acara berbasis Laravel / MVC dengan autentikasi aman, manajemen role, dan operasi CRUD.

## tetrisnt — Tetrisn't
- **Repository:** https://github.com/LIan2nd/Tetrisn-t
- Game puzzle strategis berbasis Unity / C# yang membalik mekanik Tetris: baris hanya terhapus jika menyisakan tepat satu celah; baris sempurna menjadi kegagalan.
