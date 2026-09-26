-- Publisher-sourced starter catalog. Sources are listed in docs/catalog-sources.md.
INSERT INTO manga(slug,title,alternate_title,author,description,status,genres,official_url) VALUES
('chainsaw-man','Chainsaw Man','チェンソーマン','Tatsuki Fujimoto','Denji wants a simple life. A debt, a devil and a desperate deal make that more complicated than it sounds. A jagged mix of horror, absurd comedy and loneliness.','ONGOING','Action, Horror, Supernatural','https://www.viz.com/chainsaw-man'),
('dandadan','Dandadan','ダンダダン','Yukinobu Tatsu','Momo believes in ghosts. Okarun believes in aliens. Neither expects to be right at the same time. Occult encounters and adolescent awkwardness collide at full speed.','ONGOING','Action, Comedy, Supernatural','https://www.viz.com/dandadan'),
('one-piece','One Piece','ワンピース','Eiichiro Oda','Monkey D. Luffy sets sail to find the One Piece and become King of the Pirates. An expanding world of impossible islands, found family and inherited dreams.','ONGOING','Adventure, Fantasy, Action','https://www.viz.com/one-piece'),
('fullmetal-alchemist','Fullmetal Alchemist','鋼の錬金術師','Hiromu Arakawa','Two brothers search for a way to restore their bodies after an alchemical experiment goes wrong. The cost of their search reaches far beyond their own lives.','COMPLETED','Adventure, Fantasy, Drama','https://www.viz.com/fullmetal-alchemist'),
('witch-hat-atelier','Witch Hat Atelier','とんがり帽子のアトリエ','Kamome Shirahama','Coco has always believed magic belongs to the gifted. A glimpse of a forbidden secret changes what she knows and sends her into an intricate world of ink and spells.','ONGOING','Fantasy, Adventure','https://kodansha.us/series/witch-hat-atelier/'),
('blue-period','Blue Period','ブルーピリオド','Tsubasa Yamaguchi','An aimless high school student discovers painting. Learning to see becomes inseparable from learning what he wants, and what he is willing to work for.','ONGOING','Drama, Slice of Life','https://kodansha.us/series/blue-period/'),
('death-note','Death Note','デスノート','Tsugumi Ohba / Takeshi Obata','Light Yagami finds a notebook that can kill anyone whose name is written inside. His use of it draws the attention of the detective L.','COMPLETED','Mystery, Supernatural, Drama','https://www.viz.com/death-note'),
('naruto','Naruto','ナルト','Masashi Kishimoto','Naruto Uzumaki trains as a ninja and pursues his goal of becoming the leader of his village.','COMPLETED','Action, Adventure','https://www.viz.com/naruto')
ON CONFLICT (slug) DO NOTHING;

-- Remove only the exact synthetic records created by the historical V2 seed.
-- Do not remove subsequently imported or edited chapter records.
DELETE FROM chapters c USING manga m
WHERE c.manga_id = m.id
  AND m.slug IN ('chainsaw-man','dandadan','one-piece','fullmetal-alchemist','witch-hat-atelier','blue-period')
  AND c.number BETWEEN 1 AND 12 AND c.number = trunc(c.number)
  AND c.title IS NULL AND c.official_url = m.official_url
  AND c.released_at = timestamptz '2024-01-01 12:00:00+00' + c.number * interval '7 days';
