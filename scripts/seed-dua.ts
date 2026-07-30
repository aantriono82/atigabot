// One-time seed script for the 20 daily du'as shown by /doa.
//
// Du'a 1-4 are scraped live from duaandazkar.com/chapter-4-daily-essential-duas
// (images + text). As of this rewrite, that page only publishes 4 of the
// original 20 du'as (the site was redesigned around a companion app and
// dropped the rest) — confirmed by fetching the page and finding only
// "Dua 1".."Dua 4" headings. Du'a 5-20 are therefore curated by hand below
// from well-known Hisnul Muslim (Fortress of the Muslim) references instead
// of scraped; they have no source image.
//
// Output:
//   seed/dua.sql          - INSERT statements for daily_dua
//   seed/images/dN.png    - downloaded images for du'a 1-4
//   seed/upload-images.sh - `wrangler r2 object put` commands for those images
import { mkdir, writeFile } from "node:fs/promises";
import * as cheerio from "cheerio";

const SOURCE_URL = "https://duaandazkar.com/chapter-4-daily-essential-duas/";

interface DuaRow {
  id: number;
  name: string;
  reference: string;
  pronunciation: string;
  translation: string;
  hadith: string;
  imageKey: string; // empty string if no image
}

function sqlEscape(value: string): string {
  return value.replace(/'/g, "''");
}

function between(text: string, start: string, end: string | null): string {
  const startIdx = text.indexOf(start);
  if (startIdx === -1) return "";
  const from = startIdx + start.length;
  const endIdx = end ? text.indexOf(end, from) : -1;
  const raw = endIdx === -1 ? text.slice(from) : text.slice(from, endIdx);
  return raw.replace(/\s+/g, " ").trim();
}

async function scrapeFirstFour(): Promise<DuaRow[]> {
  console.log(`Fetching ${SOURCE_URL} ...`);
  const res = await fetch(SOURCE_URL, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; AtigaBotSeed/1.0)" },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${SOURCE_URL}: ${res.status}`);
  const html = await res.text();

  const headingRe = /<span[^>]*>Dua (\d+)<\/span>/g;
  const marks: { n: number; index: number }[] = [];
  for (const m of html.matchAll(headingRe)) {
    marks.push({ n: Number(m[1]), index: m.index ?? 0 });
  }
  if (marks.length === 0) {
    throw new Error("No 'Dua N' headings found - page structure may have changed again.");
  }

  const rows: DuaRow[] = [];
  for (let i = 0; i < marks.length; i++) {
    const mark = marks[i]!;
    const chunkEnd = marks[i + 1]?.index ?? html.length;
    const chunkHtml = html.slice(mark.index, chunkEnd);

    // chunkHtml starts mid-element at "<span>Dua N</span>", so the enclosing
    // <h2> was already stripped off by slicing; recover the name (which may
    // or may not itself be wrapped in a <span>) from what follows up to </h2>.
    const nameMatch = /^<span[^>]*>Dua \d+<\/span>\s*<br\s*\/?>\s*(.*?)<\/h2>/s.exec(
      chunkHtml,
    );
    const name = nameMatch
      ? cheerio.load(nameMatch[1]).root().text().replace(/\s+/g, " ").trim()
      : "";

    const $ = cheerio.load(chunkHtml);
    const imgMatch = /src="([^"]+\/d(\d+)\.png)"/.exec(chunkHtml);
    const imageUrl = imgMatch?.[1];
    const imageKey = imgMatch ? `dua/d${imgMatch[2]}.png` : "";

    const text = $.root().text().replace(/\s+/g, " ").trim();
    const reference = between(text, "REFERENCE", "TRANSLITERATION");
    const pronunciation = between(text, "TRANSLITERATION", "TRANSLATION");
    const translation = between(text, "TRANSLATION", "BENEFIT AND VIRTUE");
    let hadith = between(text, "BENEFIT AND VIRTUE", null);
    hadith = hadith.split(/Show more/i)[0]?.trim() ?? "";

    if (imageUrl) {
      const imgRes = await fetch(imageUrl);
      if (imgRes.ok) {
        await mkdir("seed/images", { recursive: true });
        const buf = Buffer.from(await imgRes.arrayBuffer());
        await writeFile(`seed/images/d${mark.n}.png`, buf);
      } else {
        console.warn(`Could not download image for Dua ${mark.n}: ${imgRes.status}`);
      }
    }

    rows.push({
      id: mark.n,
      name,
      reference,
      pronunciation,
      translation,
      hadith,
      imageKey,
    });
  }
  return rows;
}

// Du'a 5-20: curated from Hisnul Muslim (Fortress of the Muslim) by Sa'id bin
// Ali bin Wahf Al-Qahtani and associated authentic hadith references, since
// duaandazkar.com no longer publishes these. No source image available.
const CURATED_DUAS: DuaRow[] = [
  {
    id: 5,
    name: "START OF WUDU",
    reference: "Sunan Abu Dawud 101, Sunan Ibn Majah 397",
    pronunciation: "Bismillah",
    translation: "In the name of Allah.",
    hadith: "The Prophet (peace be upon him) said there is no (complete) ablution for the one who does not mention the name of Allah over it.",
    imageKey: "",
  },
  {
    id: 6,
    name: "COMPLETION OF WUDU",
    reference: "Sahih Muslim 234, Jami at-Tirmidhi 55",
    pronunciation:
      "Ash-hadu al-la ilaha illallahu wahdahu la sharika lahu, wa ash-hadu anna Muhammadan 'abduhu wa rasuluh. Allahummaj-'alni minat-tawwabina waj-'alni minal-mutatahhirin.",
    translation:
      "I bear witness that none has the right to be worshipped but Allah alone, without any partner, and I bear witness that Muhammad is His slave and Messenger. O Allah, make me among those who repent and make me among those who purify themselves.",
    hadith: "Whoever performs ablution well and then says this, the eight gates of Paradise will be opened for him, and he may enter through whichever he wishes.",
    imageKey: "",
  },
  {
    id: 7,
    name: "ENTERING THE MOSQUE",
    reference: "Sahih Muslim 713",
    pronunciation: "Allahummaf-tah li abwaba rahmatik.",
    translation: "O Allah, open the gates of Your mercy for me.",
    hadith: "The Prophet (peace be upon him) taught this du'a to be said upon entering the mosque.",
    imageKey: "",
  },
  {
    id: 8,
    name: "LEAVING THE MOSQUE",
    reference: "Sahih Muslim 713",
    pronunciation: "Allahumma inni as'aluka min fadlik.",
    translation: "O Allah, I ask You from Your bounty.",
    hadith: "The Prophet (peace be upon him) taught this du'a to be said upon leaving the mosque.",
    imageKey: "",
  },
  {
    id: 9,
    name: "BEFORE THE MEALS",
    reference: "Sunan Abu Dawud 3767",
    pronunciation: "Bismillah",
    translation: "In the name of Allah.",
    hadith: "The Prophet (peace be upon him) instructed saying the name of Allah before eating.",
    imageKey: "",
  },
  {
    id: 10,
    name: "FORGETTING TO RECITE BISMILLAH",
    reference: "Sunan Abu Dawud 3767, Jami at-Tirmidhi 1858",
    pronunciation: "Bismillahi awwalahu wa akhirah.",
    translation: "In the name of Allah at its beginning and at its end.",
    hadith: "If one forgets to mention Allah's name at the start of the meal, this is said upon remembering.",
    imageKey: "",
  },
  {
    id: 11,
    name: "AFTER MEALS",
    reference: "Sunan Abu Dawud 4023, Jami at-Tirmidhi 3458, Sunan Ibn Majah 3285",
    pronunciation:
      "Al-hamdu lillahil-ladhi at'amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwah.",
    translation:
      "Praise be to Allah Who has fed me this and provided it for me without any might or power on my part.",
    hadith: "Whoever says this after eating, his past sins will be forgiven.",
    imageKey: "",
  },
  {
    id: 12,
    name: "AFTER MEALS (SECOND OPTION)",
    reference: "Sahih al-Bukhari 5459",
    pronunciation:
      "Al-hamdu lillahi hamdan kathiran tayyiban mubarakan fihi ghayra makfiyyin wa la muwadda'in wa la mustaghnan 'anhu Rabbana.",
    translation:
      "Praise be to Allah, praise in abundance, good and blessed, which is neither insufficient, nor forsaken, nor can it be dispensed with, O our Lord.",
    hadith: "A man said this after eating and the Prophet (peace be upon him) commented that angels compete to record such praise.",
    imageKey: "",
  },
  {
    id: 13,
    name: "LEAVING HOME",
    reference: "Sunan Abu Dawud 5095, Jami at-Tirmidhi 3426",
    pronunciation:
      "Bismillahi tawakkaltu 'alallah, wa la hawla wa la quwwata illa billah.",
    translation:
      "In the name of Allah, I place my trust in Allah, and there is no might nor power except with Allah.",
    hadith: "Whoever says this upon leaving his house will be told: you are guided, defended, and protected, and the devils will turn away from him.",
    imageKey: "",
  },
  {
    id: 14,
    name: "ENTERING HOME",
    reference: "Sunan Abu Dawud 5096",
    pronunciation: "Bismillahi walajna, wa bismillahi kharajna, wa 'ala Rabbina tawakkalna.",
    translation: "In the name of Allah we enter, and in the name of Allah we leave, and upon our Lord we place our trust.",
    hadith: "This is followed by greeting the household with salam upon entering.",
    imageKey: "",
  },
  {
    id: 15,
    name: "ON JOURNEY",
    reference: "Sahih Muslim 1342",
    pronunciation:
      "Allahu Akbar, Allahu Akbar, Allahu Akbar. Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin, wa inna ila Rabbina lamunqalibun.",
    translation:
      "Allah is the Greatest, Allah is the Greatest, Allah is the Greatest. Glory to Him Who has provided this for us though we could never have accomplished it by ourselves, and to our Lord we shall return.",
    hadith: "Said by the Prophet (peace be upon him) upon mounting his ride for travel.",
    imageKey: "",
  },
  {
    id: 16,
    name: "RETURN FROM JOURNEY",
    reference: "Sahih Muslim 1344, Sahih al-Bukhari 1797",
    pronunciation: "Ayibuna, ta'ibuna, 'abiduna, li Rabbina hamidun.",
    translation: "We return, repent, worship, and praise our Lord.",
    hadith: "Said (in addition to the travel du'a) upon returning from a journey.",
    imageKey: "",
  },
  {
    id: 17,
    name: "WHEN SNEEZING",
    reference: "Sahih al-Bukhari 6224",
    pronunciation: "Al-hamdu lillah.",
    translation: "All praise is due to Allah.",
    hadith: "The one who sneezes should say this, and it is a right upon every Muslim who hears it to respond with the reply below.",
    imageKey: "",
  },
  {
    id: 18,
    name: "HEARING SOMEONE SNEEZE",
    reference: "Sahih al-Bukhari 6224",
    pronunciation: "Yarhamukallah.",
    translation: "May Allah have mercy on you.",
    hadith: "Said to the one who sneezes and then says 'Al-hamdu lillah'.",
    imageKey: "",
  },
  {
    id: 19,
    name: "SNEEZER'S REPLY BACK",
    reference: "Sahih al-Bukhari 6224",
    pronunciation: "Yahdikumullahu wa yuslihu balakum.",
    translation: "May Allah guide you and rectify your condition.",
    hadith: "The one who sneezed replies with this to the one who said 'Yarhamukallah'.",
    imageKey: "",
  },
  {
    id: 20,
    name: "ENTERING THE MARKET",
    reference: "Jami at-Tirmidhi 3428, Sunan Ibn Majah 2235",
    pronunciation:
      "La ilaha illallahu wahdahu la sharika lahu, lahul-mulku wa lahul-hamdu, yuhyi wa yumitu wa huwa hayyun la yamutu biyadihil-khayru wa huwa 'ala kulli shay'in qadir.",
    translation:
      "None has the right to be worshipped but Allah alone, Who has no partner. His is the dominion and His is the praise. He gives life and causes death, and He is Living and does not die. In His hand is all good, and He is over all things Omnipotent.",
    hadith: "Whoever says this upon entering the market, Allah records for him a million good deeds and erases a million bad deeds.",
    imageKey: "",
  },
];

async function main() {
  const scraped = await scrapeFirstFour();
  const rows = [...scraped, ...CURATED_DUAS].sort((a, b) => a.id - b.id);

  const values = rows
    .map(
      (r) =>
        `(${r.id}, '${sqlEscape(r.name)}', '${sqlEscape(r.reference)}', '${sqlEscape(
          r.pronunciation,
        )}', '${sqlEscape(r.translation)}', '${sqlEscape(r.hadith)}', '${sqlEscape(r.imageKey)}')`,
    )
    .join(",\n");
  const sql = `INSERT INTO daily_dua (id, name, reference, pronunciation, translation, hadith, image_key) VALUES\n${values};\n`;

  await mkdir("seed", { recursive: true });
  await writeFile("seed/dua.sql", sql, "utf8");

  const uploadCommands = scraped
    .filter((r) => r.imageKey)
    .map((r) => {
      const n = r.imageKey.match(/d(\d+)\.png/)?.[1];
      return `wrangler r2 object put atigabot-assets/${r.imageKey} --file=seed/images/d${n}.png --content-type=image/png`;
    })
    .join("\n");
  await writeFile("seed/upload-images.sh", `#!/bin/sh\nset -e\n${uploadCommands}\n`, "utf8");

  console.log(`Wrote seed/dua.sql (${rows.length} du'a), seed/upload-images.sh (${scraped.length} images).`);
  console.log(`NOTE: only du'a ${scraped.map((r) => r.id).join(", ")} were scraped live; the rest are curated text without images.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
