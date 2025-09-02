import type { CommentThread, JSONContent } from "./types";

// Simple in-memory store. Swap with API/DB easily.
let currentDoc: JSONContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Pekan terakhir bulan Agustus 2025 akan selamanya tercatat dalam sejarah modern Indonesia sebagai periode di mana api ketidakpuasan publik yang telah lama terpendam akhirnya meledak menjadi gejolak nasional. Latar belakang dari ledakan sosial ini bukanlah peristiwa tunggal, melainkan akumulasi dari berbagai persoalan ekonomi dan sosial yang dirasakan oleh mayoritas masyarakat. Kenaikan harga kebutuhan pokok yang tidak diimbangi dengan peningkatan pendapatan, sulitnya lapangan pekerjaan, serta melebarnya jurang kesenjangan ekonomi telah menciptakan fondasi frustrasi yang rapuh di seluruh negeri.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Di tengah kesulitan yang dirasakan rakyat, elite politik di Parlemen justru menampilkan potret yang kontras. Wacana mengenai usulan kenaikan tunjangan dan fasilitas bagi anggota Dewan Perwakilan Rakyat (DPR) menjadi perbincangan hangat di ruang publik. Isu ini, meskipun bukan yang pertama kali muncul, datang pada saat yang paling tidak tepat. Persepsi publik melihatnya sebagai sebuah tindakan yang tuli terhadap penderitaan rakyat, sebuah pengkhianatan terhadap amanat yang telah diberikan, dan menjadi simbol arogansi kekuasaan yang terpisah dari realitas kehidupan warganya.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Pada hari Senin, 25 Agustus 2025, api itu mulai menyala. Aksi unjuk rasa yang terorganisir pecah di depan kompleks Gedung DPR/MPR RI di Jakarta. Dimotori oleh aliansi mahasiswa dari berbagai kampus dan didukung oleh serikat buruh, ribuan orang turun ke jalan. Tuntutan mereka pada awalnya sangat spesifik dan terfokus: batalkan segera usulan kenaikan tunjangan anggota DPR. Spanduk dan orasi yang mereka sampaikan sarat dengan pesan tentang keadilan sosial dan prioritas anggaran negara yang seharusnya berpihak pada rakyat.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Secara serentak, gelombang protes serupa juga muncul di kota-kota lain, menunjukkan bahwa sentimen ini bersifat nasional. Di Medan, Sumatera Utara, ribuan pengemudi ojek online bergabung dengan mahasiswa dan pekerja, menambah dimensi baru dalam gerakan protes. Mereka tidak hanya menolak kenaikan tunjangan dewan, tetapi juga menyuarakan penolakan terhadap kebijakan pajak baru yang dianggap semakin memberatkan ekonomi mereka yang sudah rentan. Aksi di Medan dengan cepat memanas, diwarnai blokade jalan dan pembakaran ban sebagai bentuk perlawanan.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Demonstrasi terus berlanjut dan meluas selama beberapa hari berikutnya, namun titik baliknya terjadi pada malam hari Kamis, 28 Agustus 2025. Di tengah kekacauan dan bentrokan sporadis di sekitar Senayan, Jakarta, sebuah insiden tragis mengubah arah dan skala gerakan ini secara fundamental. Seorang pengemudi ojek online berusia 21 tahun, Affan Kurniawan, tewas mengenaskan setelah terlindas oleh kendaraan taktis (rantis) Brimob di kawasan Pejompongan.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Kabar kematian Affan menyebar dengan kecepatan kilat melalui media sosial dan aplikasi pesan instan. Foto dan video dari lokasi kejadian membangkitkan kengerian dan simpati yang luar biasa dari publik. Affan seketika menjadi martir, simbol dari rakyat kecil yang tak berdaya, yang menjadi korban dari brutalitas aparat dalam upayanya menyuarakan aspirasi. Kematiannya bukan lagi sekadar statistik, melainkan personifikasi dari ketidakadilan yang dirasakan oleh jutaan orang.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Amarah kolektif pun meledak. Demonstrasi yang tadinya berpusat pada isu kebijakan, kini bertransformasi menjadi sebuah gerakan yang menuntut keadilan atas nyawa yang hilang dan pertanggungjawaban mutlak dari negara. Solidaritas dari sesama pengemudi ojek online menjadi kekuatan penggerak yang masif, dengan ribuan dari mereka turun ke jalan tidak hanya untuk berduka, tetapi juga untuk menuntut perubahan yang mendasar.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Pada hari Jumat, 29 Agustus 2025, Indonesia terbangun dengan suasana duka dan amarah. Gelombang kerusuhan pecah di berbagai kota besar. Di Makassar, eskalasi mencapai puncaknya ketika massa yang marah membakar Gedung DPRD Provinsi Sulawesi Selatan, sebuah simbol kekuasaan yang mereka anggap korup dan tidak representatif. Di Solo, bentrokan antara massa dan aparat keamanan juga menelan korban jiwa dari warga sipil, memperdalam luka bangsa.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Di Jakarta, prosesi pemakaman Affan Kurniawan menjadi sebuah demonstrasi hening yang diikuti oleh lautan manusia. Ribuan rekan seprofesinya mengiringi jenazah, mengubah jalanan ibu kota menjadi sungai jaket hijau yang menyuarakan satu tuntutan: keadilan. Pemandangan ini menggetarkan hati banyak orang dan semakin memperkuat legitimasi gerakan di mata publik.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Situasi kritis juga terjadi di Yogyakarta pada hari Sabtu, 30 Agustus 2025. Massa yang mengepung Gedung DPRD DIY nyaris melakukan tindakan serupa seperti di Makassar. Namun, sebuah intervensi krusial dari Sri Sultan Hamengku Buwono X yang memilih untuk turun langsung dan berdialog dengan para demonstran berhasil meredakan situasi. Tindakan Sultan menjadi antitesis dari pendekatan represif yang diadopsi di banyak daerah lain, menunjukkan bahwa dialog masih memiliki tempat bahkan di tengah krisis.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Menghadapi gejolak yang semakin tak terkendali, pemerintah dan aparat keamanan merespons dengan pendekatan ganda. Di satu sisi, retorika keras ditampilkan untuk menunjukkan ketegasan. Presiden Prabowo Subianto dalam pidatonya menegaskan bahwa negara tidak akan tinggal diam dan tidak akan memberikan toleransi terhadap segala bentuk anarki dan perusakan fasilitas publik. Peringatan ini diikuti dengan pengerahan aparat keamanan dalam jumlah besar di titik-titik vital.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Di sisi lain, operasi penegakan hukum digelar secara masif. Ribuan orang diamankan di berbagai kota, dengan puluhan di antaranya dengan cepat ditetapkan sebagai tersangka atas tuduhan perusakan, provokasi, dan penyerangan terhadap petugas. Langkah ini dimaksudkan untuk memberikan efek jera, namun oleh para aktivis dianggap sebagai upaya kriminalisasi dan pembungkaman terhadap suara kritis rakyat.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Secara bersamaan, pemerintah juga berjanji akan melakukan investigasi menyeluruh terhadap insiden-insiden kekerasan, termasuk tragedi yang menimpa Affan Kurniawan. Juru bicara pemerintah menyatakan belasungkawa dan berjanji bahwa proses hukum akan berjalan secara transparan. Namun, janji ini disambut dengan skeptisisme oleh publik yang telah berkali-kali dikecewakan oleh proses hukum yang dianggap tumpul ke atas dan tajam ke bawah.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: 'Di tengah kekacauan, gerakan ini berhasil mengkonsolidasikan tuntutannya ke dalam sebuah platform yang terstruktur dan komprehensif, yang kemudian dikenal luas sebagai "Tuntutan 17+8". Formula ini tidak muncul begitu saja, melainkan merupakan hasil sintesis dari berbagai aspirasi yang disuarakan oleh aliansi mahasiswa, serikat buruh, kelompok masyarakat sipil, dan komunitas ojek online dari seluruh Indonesia.',
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: '"17 Tuntutan Reformasi Sistemik" menjadi inti dari agenda perubahan jangka panjang. Tuntutan ini menyasar akar persoalan yang dianggap sebagai biang keladi krisis. Beberapa poin utamanya meliputi: pembatalan permanen kenaikan tunjangan dan seluruh fasilitas pejabat yang tidak esensial, reformasi total di tubuh aparat keamanan untuk menghentikan kekerasan dan memastikan akuntabilitas, pembentukan komisi independen untuk memberantas korupsi di tingkat legislatif dan eksekutif, serta implementasi kebijakan pengendalian harga kebutuhan pokok.',
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Selain itu, tuntutan ini juga mencakup audit menyeluruh terhadap proyek-proyek strategis nasional yang dianggap sarat dengan kepentingan elite, peninjauan ulang undang-undang yang dinilai menindas kebebasan berekspresi, dan jaminan perlindungan sosial yang lebih adil bagi pekerja informal seperti pengemudi ojek online. Ke-17 tuntutan ini pada dasarnya adalah sebuah manifesto politik yang menuntut perombakan fundamental dalam tata kelola negara.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: '"8 Tuntutan Keadilan Segera" merupakan respons langsung terhadap eskalasi kekerasan yang terjadi selama sepekan. Tuntutan ini bersifat mendesak dan menjadi prasyarat sebelum dialog lebih lanjut dapat dilakukan. Poin-poin utamanya adalah: usut tuntas kematian Affan Kurniawan dan korban jiwa lainnya secara transparan dan adil, adili oknum aparat yang bertanggung jawab, serta bebaskan tanpa syarat seluruh aktivis dan demonstran yang ditangkap selama aksi.',
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Lebih lanjut, tuntutan ini juga mendesak pembentukan Tim Pencari Fakta Independen yang melibatkan tokoh masyarakat sipil untuk menginvestigasi seluruh rangkaian kekerasan, pencopotan pimpinan keamanan di tingkat regional dan nasional yang dianggap paling bertanggung jawab, serta pemberian kompensasi yang layak bagi keluarga korban dan mereka yang mengalami luka-luka. Delapan tuntutan ini adalah jeritan untuk keadilan dan penghentian impunitas.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Memasuki akhir pekan, pada Minggu, 31 Agustus 2025, intensitas demonstrasi di jalanan mulai menurun, namun ketegangan masih menggantung di udara. Jalanan mungkin telah bersih dari puing-puing, tetapi luka di hati masyarakat masih menganga. Total korban jiwa yang mencapai sembilan orang di berbagai kota menjadi pengingat yang menyakitkan akan mahalnya harga sebuah perubahan.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: 'Gejolak Agustus 2025 lebih dari sekadar rangkaian unjuk rasa. Ia adalah sebuah penanda zaman, sebuah momen di mana kesabaran kolektif rakyat mencapai batasnya. Dimulai dari penolakan kebijakan yang dianggap tidak adil, gerakan ini bermetamorfosis menjadi sebuah perjuangan untuk martabat, keadilan, dan akuntabilitas. Tuntutan "17+8" telah menjadi dokumen politik penting yang akan terus digaungkan. Pemerintah kini berada di persimpangan jalan: memilih untuk melakukan reformasi substantif sesuai aspirasi rakyat, atau kembali ke cara-cara lama yang hanya akan menunda ledakan sosial yang lebih besar di masa depan. Nasib bangsa bergantung pada pilihan tersebut.',
        },
      ],
    },
  ],
};

const threads = new Map<string, CommentThread>();

export function loadDocument(): JSONContent {
  return currentDoc;
}

export function saveDocument(doc: JSONContent): void {
  currentDoc = doc;
}

export function upsertThread(thread: CommentThread): void {
  threads.set(thread.id, thread);
}

export function deleteThread(id: string): void {
  threads.delete(id);
}

export function listThreads(): CommentThread[] {
  return Array.from(threads.values());
}
