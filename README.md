# AtigaBot

بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ

AtigaBot adalah bot Telegram yang menyediakan jadwal shalat, ayat Al-Qur'an,
pencarian ayat, catatan tafsir Depag, do'a harian, dan kiriman ayat pilihan
otomatis setiap hari. Ditulis dalam TypeScript dan berjalan di atas
[Cloudflare Workers](https://developers.cloudflare.com/workers/) —
fork dari [KayyisaBot](https://github.com/nasalsabila/KayyisaBot) (Python)
oleh Nikmatun Aliyah Salsabila, ditulis ulang untuk platform serverless.

- [Deskripsi](#deskripsi)
- [Cara Penggunaan Bot](#cara-penggunaan-bot)
- [Arsitektur](#arsitektur)
- [Instalasi & Deploy](#instalasi--deploy)
- [Pengembangan Lokal](#pengembangan-lokal)

## Deskripsi

AtigaBot memiliki fitur:
- **Jadwal shalat** — via [Aladhan API](https://aladhan.com/prayer-times-api), sesuai wilayah yang dimasukkan pengguna.
- **Al-Qur'an** — ayat, teks Arab, dan terjemahan, sumber [equran.id](https://equran.id) (Kemenag).
- **Pencarian ayat** — cari kata dalam terjemahan seluruh Al-Qur'an (full-text search).
- **Catatan tafsir Depag** — tafsir Kemenag per ayat.
- **Do'a harian** — 20 do'a sehari-hari (sumber: [duaandazkar.com](https://duaandazkar.com) untuk 4 do'a pertama beserta gambarnya; 16 lainnya dikurasi dari referensi Hisnul Muslim/Fortress of the Muslim karena situs sumber aslinya sudah tidak mempublikasikan sisanya).
- **Ayat harian otomatis** — dikirim ke semua subscriber setiap hari jam 06:00 WIB via Cloudflare Cron Trigger.

## Cara Penggunaan Bot

Cari bot Telegram-nya, lalu `/start`. Perintah yang tersedia:

- `/start` — informasi mengenai AtigaBot.
- `/shalat <alamat>` — jadwal shalat hari ini. Contoh: `/shalat Bekasi Utara`
- `/quran <surat:ayat>` — tampilkan ayat. Contoh: `/quran 2:255-256`
- `/cari <kata>` — cari kata dalam Al-Qur'an. Contoh: `/cari puasa`
- `/catatan <surat:ayat>` — catatan tafsir Depag untuk ayat tertentu. Contoh: `/catatan 2:255`
- `/doa <nomor 1-20>` — do'a harian. Contoh: `/doa 1`
- `/setdaily` — berlangganan ayat pilihan harian (jam 06:00 WIB).
- `/help` — bantuan.

> **Catatan perubahan dari KayyisaBot (Python):** `/catatan` sebelumnya
> memakai nomor catatan kaki Depag (1–1610) dari API `api.fathimah.ga`, yang
> kini sudah tidak aktif. Sekarang `/catatan` memakai format `surat:ayat`
> dan menampilkan tafsir Kemenag untuk ayat tersebut — sumber data equran.id
> justru punya tafsir per-ayat, lebih lengkap dibanding catatan kaki
> bernomor yang lama.

## Arsitektur

- **Runtime**: Cloudflare Workers (TypeScript), routing dengan [Hono](https://hono.dev).
- **Transport**: Telegram webhook (bukan polling), diverifikasi dengan secret token.
- **D1** (`atigabot-db`): korpus Al-Qur'an (ayat + terjemahan + tafsir, dengan indeks FTS5 untuk `/cari`), data do'a harian, dan daftar subscriber `/setdaily`.
- **R2** (`atigabot-assets`): gambar do'a, disajikan lewat route `/assets/:key`.
- **Cron Trigger** (`0 23 * * *` UTC = 06:00 WIB): mengirim ayat pilihan harian ke semua subscriber.

```
src/
  index.ts               Worker entry (Hono app: fetch + scheduled)
  telegram/               Telegram API client & webhook router
  commands/                Handler tiap perintah (/start, /shalat, dst.)
  services/                 D1/R2/Aladhan data access
  scheduled/                Cron handler ayat harian
migrations/               Skema D1
scripts/                    Script seed data (one-time, dijalankan lokal)
```

## Instalasi & Deploy

Butuh akun Cloudflare dan bot Telegram baru dari [@BotFather](https://t.me/BotFather).

```bash
npm install

# 1. Buat resource Cloudflare
npx wrangler d1 create atigabot-db          # salin database_id ke wrangler.jsonc
npx wrangler r2 bucket create atigabot-assets

# 2. Jalankan migrasi skema
npx wrangler d1 migrations apply atigabot-db --remote

# 3. Seed data (sekali saja; menghasilkan file di ./seed/)
npm run seed:quran   # fetch 114 surat dari equran.id -> seed/quran.sql
npm run seed:dua     # scrape duaandazkar.com + tulis 16 do'a kurasi -> seed/dua.sql, seed/images/
npx wrangler d1 execute atigabot-db --remote --file=seed/quran.sql
npx wrangler d1 execute atigabot-db --remote --file=seed/dua.sql
sh seed/upload-images.sh   # upload gambar do'a ke R2

# 4. Set secrets
npx wrangler secret put BOT_TOKEN                 # token dari @BotFather
npx wrangler secret put TELEGRAM_WEBHOOK_SECRET    # string acak buatanmu sendiri

# 5. Deploy
npx wrangler deploy

# 6. Daftarkan webhook ke Telegram (ganti <WORKER_URL> dan token/secret sesuai punyamu)
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -d "url=<WORKER_URL>/telegram/webhook" \
  -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

## Pengembangan Lokal

```bash
npm run typecheck
npx wrangler d1 migrations apply atigabot-db --local
npx wrangler d1 execute atigabot-db --local --file=seed/quran.sql
npx wrangler d1 execute atigabot-db --local --file=seed/dua.sql
npm run dev
```

Uji webhook secara lokal dengan mengirim payload Telegram `Update` palsu:

```bash
curl -X POST http://localhost:8787/telegram/webhook \
  -H "content-type: application/json" \
  -H "X-Telegram-Bot-Api-Secret-Token: <TELEGRAM_WEBHOOK_SECRET>" \
  -d '{"update_id":1,"message":{"message_id":1,"chat":{"id":123,"type":"private"},"from":{"id":123,"first_name":"Test","is_bot":false},"text":"/quran 2:255"}}'
```

Uji cron job harian secara lokal (Cron Trigger tidak otomatis berjalan saat `wrangler dev`):

```bash
curl "http://localhost:8787/cdn-cgi/handler/scheduled"
```

---

Fork dari [KayyisaBot](https://github.com/nasalsabila/KayyisaBot) oleh
Nikmatun Aliyah Salsabila (tugas akhir Pemrograman Python).
