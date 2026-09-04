# Proyek: Leath Notes (Online Notepad & AI Note-Taking App)

- **Live App:** https://leath-note.my.id
- **Creator:** Alfian Nur Usyaid (Liand)
- **Kategori:** Productivity / Fullstack Web Application
- **Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, tRPC v11, TanStack Query v5, Prisma 6, PostgreSQL, NextAuth.js v5, Vitest

## Ringkasan Proyek

Leath Notes adalah aplikasi notepad berbasis web dengan tampilan skeuomorfik yang menyerupai buku catatan kulit di atas meja kayu. Pengalaman menulisnya dibuat tenang dan paper-first, sementara fitur tambahan tetap tersedia saat dibutuhkan.

## Fitur Utama

- Membuat, membaca, mengubah, dan menghapus catatan pribadi.
- Autosave dengan debounce satu detik.
- Folder dan pengorganisasian catatan dengan drag-and-drop.
- Guest mode untuk langsung mencoba tanpa akun.
- Autentikasi email serta Google OAuth opsional melalui NextAuth.js.
- AI assistant opsional dengan dukungan Ollama, OpenAI, Gemini, Anthropic, dan OpenRouter.
- Sidebar responsif, mobile drawer, dan keyboard shortcuts.

## Arsitektur

Leath Notes menggunakan Next.js App Router sebagai fondasi fullstack. API type-safe disediakan melalui tRPC, state server dikelola dengan TanStack Query, data persisten disimpan di PostgreSQL melalui Prisma, dan akses pengguna diamankan dengan NextAuth.js.
