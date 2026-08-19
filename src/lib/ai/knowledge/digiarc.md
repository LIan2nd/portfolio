# Proyek Web3: DigiArc (Decentralized Cloud Storage)

- **Live URL:** https://digiarc.vercel.app
- **Repository GitHub:** https://github.com/LIan2nd/digiarc
- **Konteks:** Riset Bersama Dosen di STT Terpadu Nurul Fikri (Aug 2025 - Sept 2025)
- **Tech Stack:** Next.js, React, TypeScript, TailwindCSS, Wagmi, Ethers.js, Solidity, IPFS (InterPlanetary File System), Web3.js
- **Kategori:** Web3 / Blockchain & Decentralized File Storage

---

## 🛡️ Ringkasan Proyek
**DigiArc** adalah platform penyimpanan berkas terdesentralisasi berbasis Web3 yang terinspirasi oleh Google Drive. Sistem ini dirancang untuk memastikan integritas data dan transparansi kepemilikan file tanpa bergantung pada server penyimpanan terpusat (*single point of failure*).

---

## ✨ Fitur & Arsitektur Teknis
1. **Decentralized Storage (IPFS):** File pengguna diunggah ke jaringan IPFS (*InterPlanetary File System*) dan diakses menggunakan CID (*Content Identifier*) yang unik dan kekal (*immutable*).
2. **Smart Contract Verification (Solidity):** Menggunakan smart contract pada jaringan blockchain EVM untuk memetakan metadata file ke alamat wallet pemilik, memberikan bukti integritas data (*cryptographic proof-of-storage*).
3. **Web3 Wallet Integration (Wagmi):** Pengguna dapat menghubungkan dompet Web3 (seperti MetaMask) untuk mengelola, mengunggah, dan mengunduh berkas mereka secara aman.
4. **Modern UI/UX:** Antarmuka modern dan responsif menggunakan Next.js dan TailwindCSS dengan manajemen state transaksi blockchain yang halus.
