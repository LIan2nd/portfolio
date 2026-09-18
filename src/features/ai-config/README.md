# Konfigurasi AI

Dashboard dan chatbot membaca dokumen `{ id: "ai_config" }` pada koleksi MongoDB `portfolio_settings`. Provider aktif serta model tidak lagi berasal dari cache memori per instance atau hasil tulis filesystem deployment. Environment menjadi default hanya ketika belum ada dokumen konfigurasi.

Penyimpanan menunggu operasi MongoDB selesai sebelum API melaporkan sukses. Request chatbot berikutnya membaca konfigurasi terbaru, termasuk setelah pindah instance atau redeploy. Jika koneksi MongoDB yang sudah dikonfigurasi gagal, API tidak melaporkan bahwa pengaturan berhasil tersimpan.

**Test Model Stream** menguji pilihan provider/model di form, menggunakan factory provider, prompt, batas output, dan decoder streaming yang sama dengan chatbot. Tes gagal jika gateway menolak streaming atau tidak mengirim teks. Tes tidak mengganti konfigurasi aktif; tekan **Save settings** untuk menerapkan pilihan yang diuji. Keberhasilan tes membuktikan request tersebut berhasil pada saat tes, bukan menjamin kuota atau ketersediaan layanan berikutnya.

API tetap memakai `DASHBOARD_API_TOKEN`; API key gateway hanya berada di environment Portfolio. Dokumen yang sudah tersimpan oleh versi sebelumnya langsung dibaca tanpa migrasi manual. Jika versi lama hanya sempat menyimpan di memori, simpan sekali lagi dari Dashboard setelah deployment terbaru siap.
