# API admin: Chat History v1

API baca saja untuk LIand Dashboard. Portfolio tetap menjadi pemilik MongoDB dan aturan pasangan pertanyaan–jawaban. Dashboard tidak mengakses database secara langsung.

## Konfigurasi

Tambahkan `DASHBOARD_API_TOKEN` acak minimal 32 karakter pada `.env.local`. Nilainya sama dengan `PORTFOLIO_API_TOKEN` di server dashboard. `npm run setup:local` dari `../dashboard` menyiapkan pasangan token untuk development tanpa menampilkan nilainya. Konfigurasi MongoDB tetap menggunakan `MONGODB_URI` dan `MONGODB_DB` milik Portfolio.

Semua endpoint memerlukan `Authorization: Bearer <token>`. Gunakan HTTPS pada deployment. Token ini hanya memberi akses baca history; tidak memberi akses pengelolaan konten atau API AI. Token kosong/pendek menonaktifkan integrasi (503), token salah ditolak (401) sebelum database dibaca. Tidak ada CORS lintas origin karena pemanggilnya server dashboard.

## Kontrak

| Method dan route                          | Respons sukses                                          |
| ----------------------------------------- | ------------------------------------------------------- |
| `GET /api/admin/v1/chat-history`          | `{ items: ChatExchange[], nextCursor: string \| null }` |
| `GET /api/admin/v1/chat-history/summary`  | `{ total: number, answered: number }`                   |
| `GET /api/admin/v1/chat-history/:queryId` | `ChatExchange`                                          |

Filter list: `q` (maksimal 200 karakter, pencarian literal pada pertanyaan, jawaban terakhir, dan anonymousId), `status=answered|missing`, `date=YYYY-MM-DD` (tanggal pertanyaan dalam Asia/Jakarta), `limit` (1–50, default 25), `cursor` (gunakan nilai `nextCursor` tanpa mengubahnya). Hapus cursor ketika filter berubah. Urutan `createdAt DESC, _id DESC` menjaga pagination saat timestamp sama. Record baru yang masuk setelah halaman pertama terlihat ketika kembali ke halaman pertama; pagination bukan snapshot database yang dibekukan.

```ts
interface ChatExchange {
  queryId: string;
  question: string;
  anonymousId: string;
  createdAt: string; // ISO UTC
  response: {
    queryId: string;
    content: string;
    durationMs: number;
    createdAt: string;
  } | null;
}
```

Pertanyaan berasal dari `user_queries`. `_id` dipasangkan dengan `bot_responses.queryId`. Jika ada beberapa jawaban, gunakan yang terbaru berdasarkan `createdAt` lalu `_id`. Jawaban orphan tidak dihitung sebagai pertanyaan. Jawaban yang tidak ada tetap `null`. AnonymousId bukan identitas manusia ataupun conversation/session ID. Proyeksi respons hanya berisi field kontrak di atas; provider, IP, konfigurasi, dan field internal lain tidak diekspos.

Respons error: `{ error: { code, message } }`. Status: 400 filter/ID tidak valid, 401 token salah, 404 pertanyaan tidak ditemukan, 503 konfigurasi/database tidak tersedia. Semua respons menetapkan `Cache-Control: private, no-store`. Metode mutasi tidak disediakan; Next.js menolak metode yang tidak didukung. Query MongoDB dibatasi `maxTimeMS: 4000`.

## Struktur

`domain/types.ts` mendefinisikan kontrak kecil; `application` memvalidasi input dan mengatur penggunaan repository; `infrastructure` mengurus query MongoDB; `api/handlers.ts` mengurus autentikasi dan respons HTTP. `index.ts` menyusun dependensi. File pada `src/app/api/admin/v1/chat-history` hanya memetakan route.

Untuk data besar, siapkan indeks berikut lewat proses administrasi database yang kamu gunakan. Endpoint tidak membuat indeks atau mengubah data secara otomatis:

```js
db.user_queries.createIndex({ createdAt: -1, _id: -1 });
db.bot_responses.createIndex({ queryId: 1, createdAt: -1, _id: -1 });
```

Pencarian substring dan perhitungan ringkasan masih membaca banyak record; saat volume meningkat, ukur query sebelum menambahkan indeks pencarian atau summary materialized. Pagination membatasi hasil respons, bukan jumlah record yang mungkin dibaca oleh pencarian.

## Verifikasi

```bash
npm ci
npm test
npx tsc --noEmit
npm run build
```

Pengujian repository memakai `mongodb-memory-server` dengan database sementara berisi data sintetis. Binary MongoDB diunduh pada run pertama. Jika direktori cache default tidak dapat ditulis, tetapkan `MONGOMS_DOWNLOAD_DIR=/tmp/liand-mongodb-test-cache`. Tes tidak memakai `MONGODB_URI` atau database Portfolio asli. Tes meliputi penolakan sebelum query, validasi, error tanpa detail rahasia, pasangan jawaban terbaru, cursor, filter, batas tanggal Jakarta, dan ringkasan.

Next.js tetap pada major 15. Patch dependensi keamanan diperbarui; override PostCSS memakai versi direct dependency yang sudah diperbaiki karena Next.js 15 mematok versi transitive yang lama. Tinjau kembali override saat memperbarui Next.js.
