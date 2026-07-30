-- Add Arabic script column to daily_dua; existing name/translation/hadith
-- content is being switched from English to Indonesian in the seed data.
ALTER TABLE daily_dua ADD COLUMN arabic TEXT NOT NULL DEFAULT '';
