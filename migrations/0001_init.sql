-- Qur'an corpus: one row per ayat, seeded once from equran.id (scripts/seed-quran.ts)
CREATE TABLE ayat (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  surah INTEGER NOT NULL,
  surah_name_latin TEXT NOT NULL,
  ayat INTEGER NOT NULL,
  arabic TEXT NOT NULL,
  translation TEXT NOT NULL,
  tafsir TEXT NOT NULL,
  UNIQUE (surah, ayat)
);

-- Full-text index over the Indonesian translation, backs /cari <kata>
CREATE VIRTUAL TABLE ayat_fts USING fts5(
  translation,
  content = 'ayat',
  content_rowid = 'id'
);

CREATE TRIGGER ayat_fts_ai AFTER INSERT ON ayat BEGIN
  INSERT INTO ayat_fts(rowid, translation) VALUES (new.id, new.translation);
END;

CREATE TRIGGER ayat_fts_ad AFTER DELETE ON ayat BEGIN
  INSERT INTO ayat_fts(ayat_fts, rowid, translation) VALUES ('delete', old.id, old.translation);
END;

CREATE TRIGGER ayat_fts_au AFTER UPDATE ON ayat BEGIN
  INSERT INTO ayat_fts(ayat_fts, rowid, translation) VALUES ('delete', old.id, old.translation);
  INSERT INTO ayat_fts(rowid, translation) VALUES (new.id, new.translation);
END;

-- Daily du'a (1-20), seeded once from duaandazkar.com (scripts/seed-dua.ts)
CREATE TABLE daily_dua (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  reference TEXT NOT NULL,
  pronunciation TEXT NOT NULL,
  translation TEXT NOT NULL,
  hadith TEXT NOT NULL,
  image_key TEXT NOT NULL
);

-- Chat IDs subscribed via /setdaily
CREATE TABLE daily_subscribers (
  chat_id INTEGER PRIMARY KEY,
  subscribed_at TEXT NOT NULL
);
