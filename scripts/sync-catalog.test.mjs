import { test } from "node:test";
import assert from "node:assert/strict";
import { fetchOngoing, normalize, catalogSql } from "./sync-catalog.mjs";

test("cursor import includes entries beyond the provider's 5,000-row offset limit", async () => {
  const entries = await fetchOngoing(async (_query, { page, excluded }) => {
    const start = excluded.length + (page - 1) * 50;
    return {
      Page: {
        pageInfo: { hasNextPage: start < 5000 },
        media: Array.from({ length: 50 }, (_, i) => ({
          id: start + i + 1,
          status: "RELEASING",
        })),
      },
    };
  });
  assert.equal(entries.size, 5050);
  assert.ok(entries.has(5050));
});

test("broken pagination fails instead of publishing a partial catalog", async () => {
  await assert.rejects(
    fetchOngoing(async () => ({
      Page: {
        pageInfo: { hasNextPage: true },
        media: [],
      },
    })),
    /Empty intermediate/,
  );
  await assert.rejects(
    fetchOngoing(async () => ({
      Page: {
        pageInfo: { hasNextPage: true },
        media: [{ id: 1, status: "RELEASING" }],
      },
    })),
    /cursor/,
  );
});

const entry = {
  id: 30013,
  title: { english: "One Piece", romaji: "ONE PIECE", native: "ワンピース" },
  status: "FINISHED",
  popularity: 234000,
  genres: ["Adventure"],
  staff: {
    edges: [{ role: "Story & Art", node: { name: { full: "Eiichiro Oda" } } }],
  },
  coverImage: {
    large:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/test.jpg",
  },
};
test("refresh preserves series identity and publisher metadata but updates status and popularity", () => {
  const manga = normalize(entry, {
    id: 3,
    slug: "one-piece",
    title: "One Piece",
    author: "Eiichiro Oda",
    description: "Original synopsis",
    officialUrl: "https://www.viz.com/one-piece",
    status: "ONGOING",
  });
  assert.equal(manga.id, 3);
  assert.equal(manga.slug, "one-piece");
  assert.equal(manga.status, "COMPLETED");
  assert.equal(manga.popularity, 234000);
  assert.equal(manga.description, "Original synopsis");
  assert.equal(manga.officialUrl, "https://www.viz.com/one-piece");
});
test("new titles get stable unique slugs; unsafe artwork URLs are discarded", () => {
  const manga = normalize({
    ...entry,
    coverImage: { large: "https://untrusted.test/image.jpg" },
  });
  assert.equal(manga.slug, "one-piece-30013");
  assert.equal(manga.coverUrl, null);
  assert.equal(manga.sourceUrl, "https://anilist.co/manga/30013");
});
test("SQL escapes text and upserts without replacing IDs or deleting relationships", () => {
  const sql = catalogSql([
    normalize({ ...entry, title: { english: "Reader's manga" } }),
  ]);
  assert.match(sql, /Reader''s manga/);
  assert.match(sql, /ON CONFLICT \(slug\) DO UPDATE/);
  assert.doesNotMatch(sql, /DELETE|TRUNCATE|SET\s+id\s*=/);
});
