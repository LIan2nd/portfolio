# AI Knowledge Portfolio

Knowledge AI memiliki lima dokumen utama. Edit suatu fakta hanya di kelompok pemiliknya; untuk konteks lintas kelompok, gunakan rujukan ke dokumen terkait.

| Kelompok               | ID dokumen             | Isi yang diedit                                                                      |
| ---------------------- | ---------------------- | ------------------------------------------------------------------------------------ |
| Profile                | `about_alfian`         | Identitas, kontak, skill, setup, bahasa, hobi, pasangan, dan fun fact                |
| Career & Activity      | `current_activity`     | Aktivitas terkini, fase belajar, kesiapan kerja, preferensi, gaji, dan tujuan karier |
| Education & Experience | `education_experience` | Pendidikan, pengalaman, publikasi, dan sertifikasi                                   |
| Projects               | `projects`             | Deskripsi, fitur, arsitektur, tautan, dan status setiap proyek                       |
| AI Behavior            | `ai-system-prompt`     | Persona, gaya jawaban, privasi, navigasi, dan aturan penggunaan fakta                |

Contoh: perubahan fase bootcamp cukup di Career & Activity; status RoadSense cukup di Projects; nama pasangan cukup di Profile. AI Behavior mengarahkan cara menjawab tanpa menyalin angka gaji, nilai akademik, atau biodata.

## Sumber dan penyimpanan

Empat file Markdown di `src/lib/ai/knowledge` dan `DEFAULT_AI_BEHAVIOR` di `src/lib/ai/knowledge.ts` menyediakan nilai bawaan. Perubahan dari Dashboard disimpan di koleksi MongoDB `ai_knowledge_documents` dan menjadi sumber utama untuk dokumen tersebut. Setelah tersimpan di Dashboard, perubahan seed tidak menimpa versi MongoDB. Gunakan Dashboard untuk mengubah knowledge live; file seed mengatur nilai bawaan deployment.

Konten halaman portofolio dari `data.ts` tetap dikelola oleh fitur halaman masing-masing. Konten tersebut tidak lagi disisipkan sebagai salinan fakta tersembunyi ke prompt AI. Perubahan knowledge AI tidak otomatis mengubah isi halaman portofolio.

Alur pembaruan:

1. Dashboard mengirim `PUT /api/admin/v1/knowledge/:id` memakai bearer token integrasi.
2. Portfolio memvalidasi token dan payload, lalu melakukan `upsert` ke MongoDB. Kategori lima dokumen utama tetap mengikuti kelompoknya; dokumen custom boleh memakai kategori sendiri.
3. Pembacaan menggabungkan nilai bawaan dengan perubahan tersimpan. File Markdown deployment tidak ditulis karena filesystem Vercel bukan penyimpanan permanen.
4. Setiap request chatbot membaca satu snapshot knowledge terbaru untuk menyusun aturan perilaku dan konteks fakta. Perubahan tidak memerlukan rebuild atau redeploy setelah versi aplikasi ini terpasang.

Jika MongoDB tidak tersedia, pembacaan kembali ke seed dan penyimpanan ditolak. Nilai seed merupakan cadangan; edit Dashboard tidak ditulis balik ke seed.

## Kompatibilitas dokumen lama

Pembacaan mengelompokkan dokumen lama seperti `another-about-me`, `campus_experience`, `thesis_and_education`, dan dokumen per proyek ke lima dokumen utama. Fingerprint versi lama membedakan isi bawaan dari perubahan pemilik. Bagian bawaan yang sama memakai seed ringkas; perubahan teridentifikasi dipindah atau digabung ke bagian pemiliknya, berurutan dari edit lama ke edit terbaru. Bagian tambahan yang tidak dikenal dipertahankan agar tidak hilang. Dokumen custom tetap tersedia.

Proses ini berjalan dalam memori dan tidak menghapus atau menulis ulang dokumen lama di MongoDB. Penyimpanan dokumen utama memberi penanda internal `knowledgeSchemaVersion: 2`; isinya kemudian menggantikan seluruh kelompok dan tidak digabung kembali dengan fragmen lama. Penanda ini tidak dikirim dalam respons API. Jika suatu catatan custom memang mengulangi fakta kelompok lain, pemilik masih perlu merapikan isi catatan tersebut.

`legacy-fingerprints.json` adalah identitas baseline migrasi, bukan sumber fakta yang perlu diedit. Jangan membuat ulang file ini dari seed yang sudah dikelompokkan.

## Pemakaian oleh chatbot

RAG memotong dokumen pada heading `##`: satu fakta tidak diindeks sebagai dokumen penuh sekaligus section terpisah. Projects memakai satu section per proyek. AI Behavior tidak masuk indeks fakta; versi tersimpannya dipakai langsung oleh provider, baik respons biasa maupun streaming.

Prompt dan jawaban cadangan tidak menyimpan salinan biodata atau jawaban tetap. Jika layanan AI gagal sebelum streaming dimulai, mode `simulated` mengutip bagian relevan dari knowledge saat ini dan memberi pemberitahuan bahwa AI tidak tersedia. Kutipan memakai bahasa aslinya; fallback tidak menerjemahkan atau menyusun jawaban baru. Header `X-AI-Mode` menunjukkan mode respons sebenarnya.

Variabel Portfolio: `MONGODB_URI`, `MONGODB_DB`, dan `DASHBOARD_API_TOKEN`. Dashboard memakai `PORTFOLIO_API_BASE_URL` dan `PORTFOLIO_API_TOKEN`, dengan token yang sama seperti Portfolio.
