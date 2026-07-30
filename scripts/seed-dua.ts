// One-time seed script for the 20 daily du'as shown by /doa.
//
// All 20 du'as are curated by hand below (Arabic text, Latin transliteration,
// and Indonesian translation/name/hadith), sourced from well-known Hisnul
// Muslim (Fortress of the Muslim) references. Since Telegram text messages
// cannot render a custom font, the Arabic text is also rendered to a PNG
// card in the Amiri font (see render-arabic.ts) and sent as a photo.
//
// Output:
//   seed/dua.sql             - INSERT statements for daily_dua
//   seed/images/arabic/dN.png - rendered Amiri-font Arabic card per du'a
//   seed/upload-images.sh    - `wrangler r2 object put` commands for those images
import { mkdir, writeFile } from "node:fs/promises";
import { renderArabicCard } from "./render-arabic";

interface DuaRow {
  id: number;
  name: string;
  arabic: string;
  reference: string;
  pronunciation: string;
  translation: string;
  hadith: string;
  imageKey: string; // empty string if no image
}

function sqlEscape(value: string): string {
  return value.replace(/'/g, "''");
}

// Du'a 1-20: curated from Hisnul Muslim (Fortress of the Muslim) by Sa'id bin
// Ali bin Wahf Al-Qahtani and associated authentic hadith references.
const CURATED_DUAS: DuaRow[] = [
  {
    id: 1,
    name: "SEBELUM TIDUR",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    reference: "Sahih Muslim 4/2083 | Fathul Bari 11/113",
    pronunciation: "Bismika Allahumma amuutu wa ahyaa.",
    translation: "Dengan nama-Mu ya Allah, aku mati dan aku hidup.",
    hadith:
      "Hudzaifah radhiyallahu 'anhu meriwayatkan: \"Ketika Nabi shallallahu 'alaihi wa sallam hendak tidur, beliau membaca do'a ini.\" (Al-Bukhari 8/75/326)",
    imageKey: "",
  },
  {
    id: 2,
    name: "BANGUN TIDUR",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    reference: "Sahih Muslim 4/2083 | Fathul Bari 11/113",
    pronunciation:
      "Alhamdu lillahil-ladzi ahyaanaa ba'da maa amaatanaa wa ilaihin-nusyuur.",
    translation:
      "Segala puji bagi Allah yang telah menghidupkan kami setelah mematikan kami (tidur), dan hanya kepada-Nya kami dibangkitkan.",
    hadith:
      "Hudzaifah radhiyallahu 'anhu meriwayatkan: \"Ketika Nabi shallallahu 'alaihi wa sallam bangun tidur, beliau membaca do'a ini.\" (Al-Bukhari 8/75/326)",
    imageKey: "",
  },
  {
    id: 3,
    name: "MASUK WC",
    arabic: "بِسْمِ اللَّهِ اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ",
    reference: "Al-Bukhari 1/45 | Sahih Muslim 1/283",
    pronunciation:
      "Bismillah. Allahumma innii a'uudzu bika minal khubutsi wal khabaa'its.",
    translation:
      "Dengan nama Allah. Ya Allah, sesungguhnya aku berlindung kepada-Mu dari setan laki-laki dan setan perempuan.",
    hadith:
      "Anas bin Malik radhiyallahu 'anhu meriwayatkan: \"Setiap kali Nabi shallallahu 'alaihi wa sallam hendak masuk ke tempat buang hajat, beliau membaca do'a ini.\" (Al-Bukhari 1/45; Sahih Muslim 1/283). Zaid bin Arqam radhiyallahu 'anhu meriwayatkan, Nabi shallallahu 'alaihi wa sallam bersabda: \"Tempat-tempat buang hajat ini didatangi setan, maka bila salah seorang dari kalian hendak masuk, bacalah do'a ini.\" (Abu Dawud 6). Masuklah dengan kaki kiri terlebih dahulu.",
    imageKey: "",
  },
  {
    id: 4,
    name: "KELUAR WC",
    arabic: "غُفْرَانَكَ. الْحَمْدُ لِلَّهِ الَّذِي أَذْهَبَ عَنِّي الْأَذَى وَعَافَانِي",
    reference: "Abu Dawud | Ibnu Majah | At-Tirmidzi",
    pronunciation: "Pilihan 1: Ghufraanak. Pilihan 2: Alhamdu lillahil-ladzi adzhaba 'annil-adzaa wa 'aafaanii.",
    translation:
      "Aku memohon ampunan-Mu. Segala puji bagi Allah yang telah menghilangkan gangguan dariku dan menyehatkanku.",
    hadith:
      "Aisyah radhiyallahu 'anha meriwayatkan: \"Ketika Nabi shallallahu 'alaihi wa sallam keluar dari tempat buang hajat, beliau mengucapkan Ghufraanak.\" (At-Tirmidzi). Keluarlah dengan kaki kanan terlebih dahulu.",
    imageKey: "",
  },
  {
    id: 5,
    name: "AWAL WUDU",
    arabic: "بِسْمِ اللَّهِ",
    reference: "Sunan Abu Dawud 101, Sunan Ibnu Majah 397",
    pronunciation: "Bismillah.",
    translation: "Dengan nama Allah.",
    hadith:
      "Nabi shallallahu 'alaihi wa sallam bersabda bahwa tidak sempurna wudu seseorang yang tidak menyebut nama Allah atasnya.",
    imageKey: "",
  },
  {
    id: 6,
    name: "SELESAI WUDU",
    arabic:
      "أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ، اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ",
    reference: "Sahih Muslim 234, Jami' at-Tirmidzi 55",
    pronunciation:
      "Asy-hadu al-laa ilaaha illallaahu wahdahu laa syariika lahu, wa asy-hadu anna Muhammadan 'abduhu wa rasuuluh. Allahummaj-'alnii minat-tawwaabiina waj-'alnii minal-mutathahhiriin.",
    translation:
      "Aku bersaksi bahwa tiada Tuhan yang berhak disembah selain Allah semata, tidak ada sekutu bagi-Nya, dan aku bersaksi bahwa Muhammad adalah hamba dan utusan-Nya. Ya Allah, jadikanlah aku termasuk orang-orang yang bertaubat dan jadikanlah aku termasuk orang-orang yang mensucikan diri.",
    hadith:
      "Barangsiapa berwudu dengan sempurna lalu mengucapkan do'a ini, maka akan dibukakan baginya delapan pintu surga, dan ia boleh masuk dari pintu mana saja yang ia kehendaki.",
    imageKey: "",
  },
  {
    id: 7,
    name: "MASUK MASJID",
    arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    reference: "Sahih Muslim 713",
    pronunciation: "Allahummaf-tah lii abwaaba rahmatik.",
    translation: "Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu.",
    hadith:
      "Nabi shallallahu 'alaihi wa sallam mengajarkan do'a ini untuk dibaca ketika memasuki masjid.",
    imageKey: "",
  },
  {
    id: 8,
    name: "KELUAR MASJID",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
    reference: "Sahih Muslim 713",
    pronunciation: "Allahumma innii as'aluka min fadhlik.",
    translation: "Ya Allah, sesungguhnya aku memohon kepada-Mu dari karunia-Mu.",
    hadith:
      "Nabi shallallahu 'alaihi wa sallam mengajarkan do'a ini untuk dibaca ketika keluar dari masjid.",
    imageKey: "",
  },
  {
    id: 9,
    name: "SEBELUM MAKAN",
    arabic: "بِسْمِ اللَّهِ",
    reference: "Sunan Abu Dawud 3767",
    pronunciation: "Bismillah.",
    translation: "Dengan nama Allah.",
    hadith:
      "Nabi shallallahu 'alaihi wa sallam memerintahkan untuk menyebut nama Allah sebelum makan.",
    imageKey: "",
  },
  {
    id: 10,
    name: "LUPA MEMBACA BISMILLAH",
    arabic: "بِسْمِ اللَّهِ أَوَّلَهُ وَآخِرَهُ",
    reference: "Sunan Abu Dawud 3767, Jami' at-Tirmidzi 1858",
    pronunciation: "Bismillahi awwalahu wa aakhirah.",
    translation: "Dengan nama Allah pada awal dan akhirnya.",
    hadith:
      "Jika seseorang lupa menyebut nama Allah di awal makan, do'a ini dibaca ketika ia teringat.",
    imageKey: "",
  },
  {
    id: 11,
    name: "SETELAH MAKAN",
    arabic:
      "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
    reference: "Sunan Abu Dawud 4023, Jami' at-Tirmidzi 3458, Sunan Ibnu Majah 3285",
    pronunciation:
      "Alhamdu lillahil-ladzi ath'amanii hadzaa wa razaqaniihi min ghairi haulin minnii wa laa quwwah.",
    translation:
      "Segala puji bagi Allah yang telah memberiku makan ini dan memberikan rezeki ini kepadaku tanpa daya dan kekuatan dariku.",
    hadith:
      "Barangsiapa mengucapkan do'a ini setelah makan, maka dosa-dosanya yang telah lalu akan diampuni.",
    imageKey: "",
  },
  {
    id: 12,
    name: "SETELAH MAKAN (PILIHAN KEDUA)",
    arabic:
      "الْحَمْدُ لِلَّهِ حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ غَيْرَ مَكْفِيٍّ وَلَا مُوَدَّعٍ وَلَا مُسْتَغْنًى عَنْهُ رَبَّنَا",
    reference: "Sahih al-Bukhari 5459",
    pronunciation:
      "Alhamdu lillahi hamdan katsiiran thayyiban mubaarakan fiihi ghaira makfiyyin wa laa muwadda'in wa laa mustaghnan 'anhu Rabbanaa.",
    translation:
      "Segala puji bagi Allah, pujian yang banyak, baik, dan penuh berkah, yang tidak cukup, tidak ditinggalkan, dan tidak dapat digantikan, wahai Rabb kami.",
    hadith:
      "Seorang laki-laki mengucapkan do'a ini setelah makan, dan Nabi shallallahu 'alaihi wa sallam bersabda bahwa para malaikat berlomba-lomba mencatat pujian tersebut.",
    imageKey: "",
  },
  {
    id: 13,
    name: "KELUAR RUMAH",
    arabic:
      "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    reference: "Sunan Abu Dawud 5095, Jami' at-Tirmidzi 3426",
    pronunciation:
      "Bismillahi tawakkaltu 'alallaah, wa laa haula wa laa quwwata illaa billaah.",
    translation:
      "Dengan nama Allah, aku bertawakal kepada Allah, dan tiada daya serta kekuatan kecuali dengan (pertolongan) Allah.",
    hadith:
      "Barangsiapa mengucapkan do'a ini ketika keluar rumah, akan dikatakan kepadanya: \"Engkau telah diberi petunjuk, dicukupi, dan dilindungi\", dan setan-setan akan menjauh darinya.",
    imageKey: "",
  },
  {
    id: 14,
    name: "MASUK RUMAH",
    arabic: "بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى رَبِّنَا تَوَكَّلْنَا",
    reference: "Sunan Abu Dawud 5096",
    pronunciation:
      "Bismillahi walajnaa, wa bismillahi kharajnaa, wa 'alaa Rabbinaa tawakkalnaa.",
    translation:
      "Dengan nama Allah kami masuk, dan dengan nama Allah kami keluar, dan hanya kepada Rabb kami, kami bertawakal.",
    hadith: "Do'a ini diikuti dengan mengucapkan salam kepada keluarga ketika masuk rumah.",
    imageKey: "",
  },
  {
    id: 15,
    name: "DALAM PERJALANAN",
    arabic:
      "اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
    reference: "Sahih Muslim 1342",
    pronunciation:
      "Allahu Akbar, Allahu Akbar, Allahu Akbar. Subhaanal-ladzii sakhkhara lanaa hadzaa wa maa kunnaa lahu muqriniin, wa innaa ilaa Rabbinaa lamunqalibuun.",
    translation:
      "Allah Maha Besar, Allah Maha Besar, Allah Maha Besar. Maha Suci Dzat yang telah menundukkan ini untuk kami, padahal kami sebelumnya tidak mampu menguasainya. Dan sesungguhnya kami akan kembali kepada Rabb kami.",
    hadith: "Diucapkan oleh Nabi shallallahu 'alaihi wa sallam ketika menaiki kendaraan untuk bepergian.",
    imageKey: "",
  },
  {
    id: 16,
    name: "PULANG DARI PERJALANAN",
    arabic: "آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ",
    reference: "Sahih Muslim 1344, Sahih al-Bukhari 1797",
    pronunciation: "Aayibuuna, taa'ibuuna, 'aabiduuna, li Rabbinaa haamiduun.",
    translation: "Kami kembali, bertaubat, beribadah, dan memuji Rabb kami.",
    hadith:
      "Diucapkan (selain do'a perjalanan di atas) ketika kembali dari sebuah perjalanan.",
    imageKey: "",
  },
  {
    id: 17,
    name: "KETIKA BERSIN",
    arabic: "الْحَمْدُ لِلَّهِ",
    reference: "Sahih al-Bukhari 6224",
    pronunciation: "Alhamdulillah.",
    translation: "Segala puji bagi Allah.",
    hadith:
      "Orang yang bersin hendaknya mengucapkan do'a ini, dan menjadi kewajiban bagi setiap muslim yang mendengarnya untuk membalas dengan do'a berikut.",
    imageKey: "",
  },
  {
    id: 18,
    name: "MENDENGAR ORANG BERSIN",
    arabic: "يَرْحَمُكَ اللَّهُ",
    reference: "Sahih al-Bukhari 6224",
    pronunciation: "Yarhamukallah.",
    translation: "Semoga Allah merahmatimu.",
    hadith: "Diucapkan kepada orang yang bersin setelah ia mengucapkan 'Alhamdulillah'.",
    imageKey: "",
  },
  {
    id: 19,
    name: "BALASAN DARI ORANG YANG BERSIN",
    arabic: "يَهْدِيكُمُ اللَّهُ وَيُصْلِحُ بَالَكُمْ",
    reference: "Sahih al-Bukhari 6224",
    pronunciation: "Yahdiikumullaahu wa yushlihu baalakum.",
    translation: "Semoga Allah memberi petunjuk kepada kalian dan memperbaiki keadaan kalian.",
    hadith:
      "Orang yang bersin membalas dengan do'a ini kepada orang yang mengucapkan 'Yarhamukallah'.",
    imageKey: "",
  },
  {
    id: 20,
    name: "MASUK PASAR",
    arabic:
      "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ حَيٌّ لَا يَمُوتُ بِيَدِهِ الْخَيْرُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    reference: "Jami' at-Tirmidzi 3428, Sunan Ibnu Majah 2235",
    pronunciation:
      "Laa ilaaha illallaahu wahdahu laa syariika lah, lahul-mulku wa lahul-hamdu yuhyii wa yumiitu wa huwa hayyun laa yamuutu biyadihil-khair, wa huwa 'alaa kulli syai'in qadiir.",
    translation:
      "Tiada Tuhan yang berhak disembah selain Allah semata, tidak ada sekutu bagi-Nya. Milik-Nya kerajaan dan pujian, Dia menghidupkan dan mematikan, Dia Maha Hidup dan tidak akan mati, di tangan-Nya segala kebaikan, dan Dia Maha Kuasa atas segala sesuatu.",
    hadith:
      "Barangsiapa mengucapkan do'a ini ketika memasuki pasar, Allah mencatat baginya sejuta kebaikan dan menghapus sejuta keburukan.",
    imageKey: "",
  },
];

async function main() {
  await mkdir("seed/images/arabic", { recursive: true });

  const rows = CURATED_DUAS.map((r) => {
    const imageKey = `dua/arabic/d${r.id}.png`;
    const png = renderArabicCard(r.arabic);
    return { ...r, imageKey, png };
  });

  for (const r of rows) {
    await writeFile(`seed/images/arabic/d${r.id}.png`, r.png);
  }

  const values = rows
    .map(
      (r) =>
        `(${r.id}, '${sqlEscape(r.name)}', '${sqlEscape(r.arabic)}', '${sqlEscape(
          r.reference,
        )}', '${sqlEscape(r.pronunciation)}', '${sqlEscape(r.translation)}', '${sqlEscape(
          r.hadith,
        )}', '${sqlEscape(r.imageKey)}')`,
    )
    .join(",\n");
  const sql = `INSERT INTO daily_dua (id, name, arabic, reference, pronunciation, translation, hadith, image_key) VALUES\n${values};\n`;

  await mkdir("seed", { recursive: true });
  await writeFile("seed/dua.sql", sql, "utf8");

  const uploadCommands = rows
    .map(
      (r) =>
        `wrangler r2 object put atigabot-assets/${r.imageKey} --file=seed/images/arabic/d${r.id}.png --content-type=image/png --remote`,
    )
    .join("\n");
  await writeFile("seed/upload-images.sh", `#!/bin/sh\nset -e\n${uploadCommands}\n`, "utf8");

  console.log(`Wrote seed/dua.sql (${rows.length} du'a), seed/upload-images.sh (${rows.length} images).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
