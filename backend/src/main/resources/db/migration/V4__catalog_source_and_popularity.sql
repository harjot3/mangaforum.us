ALTER TABLE manga ADD COLUMN source_id integer UNIQUE;
ALTER TABLE manga ADD COLUMN source_url varchar(500);
ALTER TABLE manga ADD COLUMN cover_url varchar(500);
ALTER TABLE manga ADD COLUMN popularity integer NOT NULL DEFAULT 0 CHECK (popularity >= 0);
CREATE INDEX manga_popularity_idx ON manga(status, popularity DESC, slug);
