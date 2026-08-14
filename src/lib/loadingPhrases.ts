/**
 * Kumpulan 90+ frasa loading yang lucu, kreatif, dan bervariasi untuk AI Assistant
 */
export const LOADING_PHRASES: string[] = [
  // 1. Berpikir & Memasak
  "Sedang berpikir keras... 🤔",
  "Lagi memasak jawaban lezat... 🍳",
  "Mencari di memori otak Alfian... 🧠",
  "Mengompilasi kata-kata... ⚡",
  "Bentar, lagi ngeracik jawaban... ✍️",
  "Scanning portofolio & proyek... 🔍",
  "Menyeduh kopi sebentar... ☕",
  "Memanggil neuron digital... ✨",
  "Merebus ide sampai matang... 🍲",
  "Mengocok algoritma terbaik... 🥣",
  "Memanggang insight baru... 🥐",
  "Menyiapkan bumbu-bumbu retorika... 🧂",
  "Meracik ramuan kecerdasan... 🧪",
  "Menumis data mentah... 🥘",
  "Mencicipi rasa jawaban... 🍽️",

  // 2. Developer & Coding Humor
  "Lagi nyari titik koma yang hilang... 🐛",
  "Memperbaiki merge conflict di pikiran... 🔀",
  "Konsultasi kilat ke Stack Overflow... 📚",
  "Menghapus console.log di otak... 🧹",
  "Pushing knowledge to main branch... 🚀",
  "Menghindari infinite loop... 🔄",
  "Mengoptimasi Big-O jawaban... ⏱️",
  "Ngobrol sama rubber duck dulu... 🦆",
  "Lagi nulis clean code buat respon... 🧼",
  "Resolving internal promise... 🤝",
  "Git stash keraguan, git pop kepastian... 📦",
  "Mendengarkan bisikan compiler... 👂",
  "Memeriksa dependensi jawaban... 📦",
  "Parsing request dengan regex ajaib... 🪄",
  "Restart server localhost otak... 🔌",
  "Menghindari NullPointerException... 🛡️",
  "Dockerizing kontainer pikiran... 🐳",
  "Menyiapkan query SQL tercepat... ⚡",
  "De-indexing memori masa lalu... 🗂️",
  "Membaca dokumentasi kehidupan... 📖",

  // 3. AI & Data Science
  "Menghitung cosine similarity kata-kata... 📐",
  "Tokenizing pikiran Alfian... 🎟️",
  "Fine-tuning model di background... 🎛️",
  "Menghalau halusinasi AI... 🧘",
  "Mengakses vector database rahasia... 💾",
  "Memfilter noise dari sinyal... 📡",
  "Menyinkronkan bobot neural network... 🕸️",
  "Mengaktifkan mode penalaran cerdas... 💡",
  "Menjalankan inferensi kilat... 🏎️",
  "Embedding semantic context... 🧩",

  // 4. Kopi & Nongkrong
  "Grinding biji kopi robusta... 🫘",
  "Bikin latte art bentuk kurung kurawal... ☕",
  "Ngopi santai biar coding lancar... 🍵",
  "Menyeruput teh hangat inspirasi... 🫖",
  "Lagi nongkrong di terminal Linux... 🐧",
  "Menikmati aroma syntax highlight... 🎨",
  "Refill kafein ke sirkuit... 🔋",

  // 5. Gaming & Pop Culture
  "Loading screen tips: Jangan lupa minum air! 💧",
  "Farming EXP buat naikin akurasi... 🎮",
  "Casting spell jawaban level 99... 🧙‍♂️",
  "Rolling gacha kata-kata bijak... 🎲",
  "Buffing status kecerdasan... 🛡️",
  "Respawn di checkpoint ide... 🚩",
  "Menghindari boss bug di tahap akhir... 👾",
  "Critical hit insight incoming! 💥",
  "Menjelajahi open-world pengetahuan... 🗺️",
  "Side quest: mencari kalimat puitis... 🏹",

  // 6. Sarkas & Santai Ala Kloningan Alfian
  "Sabar ya, hal bagus butuh waktu... ⏳",
  "Otw diketik nih, santai bro... ⌨️",
  "Bentar, jangan dispam dulu yaa... 🛑",
  "Menyusun kalimat biar ga keliatan kaku... 😎",
  "Memastikan jawaban berbobot dan bernutrisi... 🥦",
  "Mengingat-ingat kenangan skripsi... 🎓",
  "Mengecek apakah ini ditanya gebetan... 👀",
  "Memilah kata-kata paling estetik... 💅",
  "Menahan tawa membaca pertanyaan... 🤭",
  "Bentar bos, kuota berpikir lagi running... 🏃‍♂️",
  "Mengaktifkan mode jenius 3000... 🤖",
  "Lagi flexing skill di balik layar... 💪",
  "Mempercantik formatting markdown... 📝",
  "Jawaban sedang dalam perjalanan via kurir... 🚚",
  "Mengecek ramalan cuaca di server... ⛅",

  // 7. Filosofis & Eksploratif
  "Merenungi misteri alam semesta koding... 🌌",
  "Mencari inspirasi di bawah pohon biner... 🌳",
  "Menyelami samudra data yang luas... 🌊",
  "Menghubungkan titik-titik logika... 🔗",
  "Menerjemahkan ide abstrak jadi teks... 💭",
  "Menyusun puzzle argumen... 🧩",
  "Menyalakan lentera pemahaman... 🏮",
  "Melompat antar dimensi paradigma... 🚀",
  "Menimbang bobot setiap suku kata... ⚖️",
  "Menenun benang-benang solusi... 🧶",

  // 8. Tambahan Seru
  "Tunggu bentar, AI Clone lagi pemanasan... 🤸",
  "Memeriksa koneksi ke satelit ide... 🛰️",
  "Menghidupkan mesin pengolah kata... ⚙️",
  "Mengumpulkan energi bola semangat... 🔮",
  "Membuka lembaran buku portofolio... 📚",
  "Hampir siap... 99.9% loading! 📶",
  "Sedikit lagi selesai dimasak... 🛎️",
];

/**
 * Mengambil satu frasa loading secara acak
 */
export function getRandomLoadingPhrase(): string {
  const randomIndex = Math.floor(Math.random() * LOADING_PHRASES.length);
  return LOADING_PHRASES[randomIndex];
}

/**
 * Mengambil index acak dari daftar frasa loading
 */
export function getRandomLoadingIndex(): number {
  return Math.floor(Math.random() * LOADING_PHRASES.length);
}
