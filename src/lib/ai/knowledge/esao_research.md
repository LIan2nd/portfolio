# Riset Akademik & Proyek: ESAO (Essay Analytic Online)

- **Platform URL:** https://esao.nurulfikri.ac.id
- **Author & Creator:** Akhmam Fahmi & Alfian Nur Usyaid (STT Terpadu Nurul Fikri)
- **Role Alfian:** Fullstack Developer & Lead AI Integrator (Feb 2025 - Jul 2025)

## Apa itu ESAO?
ESAO (Essay Analytic Online) adalah platform penilaian dan koreksi soal esai/uraian otomatis berbasis AI untuk dosen dan perguruan tinggi (saat ini masih dikhususkan untuk STT-NF). Platform ini dirancang untuk memecahkan masalah kelelahan dosen dalam mengoreksi puluhan jawaban ujian secara manual, meningkatkan konsistensi penilaian tanpa bias subjektif, serta menghemat hingga 80% waktu koreksi (30 esai selesai dalam < 2 menit).

## Arsitektur Teknis ESAO
1. **Frontend / Client-side:**
   - Dibangun menggunakan **Next.js (React)** dan TailwindCSS.
   - Menyediakan dashboard interaktif dosen untuk manajemen kelas, bank soal esai, monitor ujian real-time, dan ekspor nilai ke Excel dalam 1 klik.
   - PWA (Progressive Web App) dengan dukungan multi-bahasa (Indonesia, English, 日本語) dan Dark Mode.
2. **Backend & AI Pipeline:**
   - Dibangun menggunakan **Flask (Python)** dengan arsitektur **LangChain**.
   - Menjalankan scoring berbasis rubrik yang ditentukan oleh dosen.
   - Menggunakan Vision AI untuk penilaian multimodal (jawaban teks + lampiran diagram/gambar).
   - Menghasilkan feedback detail otomatis dan reasoning per butir soal untuk mahasiswa.
