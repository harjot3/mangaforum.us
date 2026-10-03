import { CharacterIcon } from "@/components/character-icon";
import { api } from "@/lib/catalog-server";
import Link from "next/link";
import { genres, Manga, Results } from "@/lib/api";
import { Cover } from "@/components/cover";
export const dynamic = "force-dynamic";
export default async function Home() {
  const catalog = await api<Results<Manga>>(
    "/manga?status=ONGOING&sort=popular",
  );
  return (
    <>
      <div className="page-heading">
        <h1>Ongoing manga</h1>
        <div className="heading-tools">
          <span className="metadata">
            {catalog.totalItems.toLocaleString("en-US")} ongoing series
          </span>
          <CharacterIcon character="yatora" />
        </div>
      </div>
      <p className="home-intro">
        Find your next chapter conversation. Explore ongoing series, starting
        with the most popular among readers.
      </p>
      <div className="home-columns">
        <section>
          <div className="section-heading">
            <h2>Popular ongoing manga</h2>
            <Link href="/discover?status=ONGOING&sort=popular">
              Browse all ongoing →
            </Link>
          </div>
          <p className="metadata ranking-note">
            Ranked by AniList reader lists.
          </p>
          <div className="home-catalog">
            {catalog.items.map((manga) => (
              <article className="catalog-item" key={manga.id}>
                <Link
                  href={`/manga/${manga.slug}`}
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <Cover manga={manga} small />
                </Link>
                <div>
                  <h2>
                    <Link href={`/manga/${manga.slug}`}>{manga.title}</Link>
                  </h2>
                  <p className="byline">{manga.author}</p>
                  <p className="description">{manga.description}</p>
                  <span className="metadata">{manga.genres}</span>
                  <Link
                    className="text-link"
                    href={`/manga/${manga.slug}/chapters`}
                  >
                    View chapters →
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <p className="browse-more">
            <Link
              className="button"
              href="/discover?status=ONGOING&sort=popular"
            >
              Browse all {catalog.totalItems.toLocaleString("en-US")} ongoing
              series →
            </Link>
          </p>
          {!catalog.items.length && <p className="empty">No manga found.</p>}
        </section>
        <aside className="catalog-sidebar">
          <section>
            <div className="section-heading">
              <h2>Genres</h2>
              <CharacterIcon character="coco" />
            </div>
            <nav className="genre-links" aria-label="Browse genres">
              {genres.map((genre) => (
                <Link
                  key={genre}
                  href={`/discover?genre=${encodeURIComponent(genre)}`}
                >
                  {genre}
                </Link>
              ))}
            </nav>
          </section>
          <section>
            <div className="section-heading">
              <h2>Official publishers</h2>
              <CharacterIcon character="naruto" />
            </div>
            <div className="publisher-links">
              <a
                href="https://www.viz.com/manga-books"
                target="_blank"
                rel="noopener noreferrer"
              >
                VIZ Media ↗
              </a>
              <a
                href="https://kodansha.us/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Kodansha ↗
              </a>
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
