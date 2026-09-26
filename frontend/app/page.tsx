import Link from "next/link";
import { api, Manga, Results } from "@/lib/api";
import { Cover } from "@/components/cover";
export const dynamic = "force-dynamic";
export default async function Home() {
  const catalog = await api<Results<Manga>>("/manga");
  return (
    <>
      <div className="page-heading">
        <h1>Manga database</h1>
        <p>{catalog.totalItems} series</p>
      </div>
      <div className="home-columns">
        <section>
          <div className="section-heading">
            <h2>Browse manga</h2>
            <Link href="/discover">View all →</Link>
          </div>
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
                </div>
              </article>
            ))}
          </div>
          {!catalog.items.length && <p className="empty">No manga found.</p>}
        </section>
        <aside className="catalog-sidebar">
          <section>
            <div className="section-heading">
              <h2>Genres</h2>
            </div>
            <nav className="genre-links" aria-label="Browse genres">
              {[
                "Action",
                "Adventure",
                "Comedy",
                "Drama",
                "Fantasy",
                "Horror",
                "Mystery",
                "Slice of Life",
                "Supernatural",
              ].map((genre) => (
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
