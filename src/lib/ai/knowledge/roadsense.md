# Proyek: RoadSense (Smart Road Safety Navigation System)

- **Repository GitHub:** https://github.com/LIan2nd/RoadSense
- **Status:** In Development / Active Project
- **Lisensi:** MIT License
- **Kategori:** Web-based Geographic Information System (GIS) & Smart Navigation

---

## 🌟 Ringkasan Proyek (Overview)
**RoadSense** adalah platform keselamatan jalan partisipatif berbasis GIS (Geographic Information System) yang memungkinkan masyarakat melaporkan titik-titik kerusakan jalan (*crowdsourced road hazard reporting*) dan menyediakan navigasi pintar untuk membantu pengemudi menghindari area rawan/berbahaya (*smart safety routing*).

Sistem ini menggabungkan data laporan masyarakat dengan analisis spasial (*spatial buffer analysis*) untuk menghitung dan merekomendasikan rute perjalanan teraman.

---

## ✨ Fitur-Fitur Utama

### 1. Fitur Core GIS & Crowdsourcing
- **Peta Interaktif Layar Penuh (Interactive Map):** Menampilkan sebaran kerusakan jalan secara real-time menggunakan Leaflet & OpenStreetMap tiles.
- **Pelaporan Kerusakan Jalan (Crowdsourced Reporting):** Pengguna terotentikasi dapat melaporkan titik kerusakan jalan lengkap dengan foto, deskripsi, dan tingkat keparahan (*Low / Medium / High / Critical*).
- **Visualisasi Berkode Warna (Data Visualization):** Marker peta memiliki indikator warna sesuai tingkat bahaya.
- **Pelacakan Status Laporan (Status Tracking):** Memantau progres penanganan jalan: `Open` → `Verified` → `In Progress` → `Resolved`.

### 2. Fitur Navigasi Pintar & Keselamatan (Smart Safety Routing)
- **Perencanaan Rute (Route Planning):** Menentukan titik awal (*origin*) dan titik tujuan (*destination*).
- **Analisis Spasial (Spatial Analysis):** Menggunakan operasi geometrik Shapely pada backend Flask untuk mendeteksi *route-hazard collision* (tabrakan buffer rute dengan titik bahaya).
- **Peringatan Keselamatan (Safety Warnings):** Memberikan notifikasi visual peringatan jika rute yang dilewati memiliki titik bahaya tinggi.
- **Riwayat Pencarian (Search History):** Menyimpan dan mengakses riwayat pencarian rute sebelumnya.

### 3. Otentikasi & Keamanan
- Autentikasi kredensial (Email/Password) dan One-Click Google OAuth menggunakan NextAuth.js v5 (Auth.js).
- Middleware-based route protection.

---

## 🏗️ Arsitektur Sistem (Hybrid Client-Server GIS Architecture)
RoadSense menggunakan arsitektur hybrid dengan dua backend terspesialisasi:
1. **Frontend & App Backend (T3 Stack):**
   - **Next.js 15 (App Router)** & **TypeScript**
   - **Tailwind CSS v4** & **Shadcn/ui**
   - **tRPC** (End-to-end typesafe APIs)
   - **Prisma ORM** & **PostgreSQL**
   - **Leaflet** (Map rendering) & **Zustand** (State management)
   - **NextAuth.js v5** (Authentication)
2. **Spatial Analytics Backend (Flask / Python):**
   - **Flask API** & **Shapely** untuk kalkulasi geometrik spasial berat dan deteksi tabrakan bahaya jalan.
3. **Routing Service Eksternal:**
   - **OSRM (Open Source Routing Machine)** untuk kalkulasi rute jalan tercepat.
   - **OpenStreetMap (OSM)** untuk tile peta.
