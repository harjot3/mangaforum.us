-- Local catalog fixtures, not a live release feed. No scans or fabricated activity.
INSERT INTO manga(slug,title,alternate_title,author,description,status,genres,official_url) VALUES
('chainsaw-man','Chainsaw Man','チェンソーマン','Tatsuki Fujimoto','Denji wants a simple life. A debt, a devil and a desperate deal make that more complicated than it sounds. A jagged mix of horror, absurd comedy and loneliness.','ONGOING','Action, Horror, Supernatural','https://www.viz.com/chainsaw-man'),
('dandadan','Dandadan','ダンダダン','Yukinobu Tatsu','Momo believes in ghosts. Okarun believes in aliens. Neither expects to be right at the same time. Occult encounters and adolescent awkwardness collide at full speed.','ONGOING','Action, Comedy, Supernatural','https://www.viz.com/dandadan'),
('one-piece','One Piece','ワンピース','Eiichiro Oda','Monkey D. Luffy sets sail to find the One Piece and become King of the Pirates. An expanding world of impossible islands, found family and inherited dreams.','ONGOING','Adventure, Fantasy, Action','https://www.viz.com/one-piece'),
('fullmetal-alchemist','Fullmetal Alchemist','鋼の錬金術師','Hiromu Arakawa','Two brothers search for a way to restore their bodies after an alchemical experiment goes wrong. The cost of their search reaches far beyond their own lives.','COMPLETED','Adventure, Fantasy, Drama','https://www.viz.com/fullmetal-alchemist'),
('witch-hat-atelier','Witch Hat Atelier','とんがり帽子のアトリエ','Kamome Shirahama','Coco has always believed magic belongs to the gifted. A glimpse of a forbidden secret changes what she knows and sends her into an intricate world of ink and spells.','ONGOING','Fantasy, Adventure','https://kodansha.us/series/witch-hat-atelier/'),
('blue-period','Blue Period','ブルーピリオド','Tsubasa Yamaguchi','An aimless high school student discovers painting. Learning to see becomes inseparable from learning what he wants, and what he is willing to work for.','ONGOING','Drama, Slice of Life','https://kodansha.us/series/blue-period/');
INSERT INTO chapters(manga_id,number,released_at,official_url)
SELECT id, n, timestamptz '2024-01-01 12:00:00+00' + (n * interval '7 days'), official_url
FROM manga CROSS JOIN generate_series(1,12) n;
