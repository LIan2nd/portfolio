# AI Knowledge Portfolio

Dokumen Markdown di `src/lib/ai/knowledge` merupakan seed bawaan yang ikut dalam deployment. Seed menjaga chatbot tetap memiliki konteks dasar ketika MongoDB tidak tersedia.

Perubahan dari Dashboard disimpan sebagai dokumen pada koleksi MongoDB `ai_knowledge_documents`. Dokumen dengan ID yang sama menggantikan seed saat dibaca, sedangkan ID baru ditambahkan sebagai knowledge baru. File Markdown di deployment tidak ditulis oleh API karena filesystem Vercel tidak menyediakan penyimpanan permanen.

Alur pembaruan:

1. Dashboard mengirim `PUT /api/admin/v1/knowledge/:id` memakai bearer token integrasi.
2. Portfolio memvalidasi token dan payload, lalu melakukan `upsert` ke MongoDB.
3. Daftar knowledge menggabungkan seed dan dokumen MongoDB berdasarkan ID.
4. RAG chatbot membaca hasil gabungan pada request berikutnya, sehingga perubahan tidak memerlukan rebuild atau redeploy.

Variabel yang dibutuhkan di deployment Portfolio adalah `MONGODB_URI`, `MONGODB_DB`, dan `DASHBOARD_API_TOKEN`. Dashboard memakai `PORTFOLIO_API_BASE_URL` serta `PORTFOLIO_API_TOKEN` yang nilainya sama dengan token Portfolio.
