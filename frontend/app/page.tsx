import Link from "next/link";
import { api, date, Manga, Release, Results } from "@/lib/api";
import { Cover } from "@/components/cover";
export const dynamic = "force-dynamic";
export default async function Home() {
  const [catalog, releases] = await Promise.all([
    api<Results<Manga>>("/manga"),
    api<Release[]>("/chapters/recent"),
  ]);
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Your manga corner of the internet</p>
          <h1>Welcome to MangaForum</h1>
        </div>
        <p>
          Find a series. Catch up on chapters.
          <br />
          Stay for the next obsession.
        </p>
      </div>
      <div className="home-columns">
        <section>
          <div className="section-heading">
            <h2>Latest chapter updates</h2>
            <span>Latest recorded chapters</span>
          </div>
          {releases.length ? (
            <div className="release-list">
              {releases.map((r, i) => (
                <Link
                  className="release"
                  key={r.id}
                  href={`/manga/${r.mangaSlug}/chapters`}
                >
                  <span className="release-index">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{r.mangaTitle}</h3>
                    <span className="metadata">
                      Recorded {date(r.releasedAt)}
                    </span>
                  </div>
                  <strong>CH. {r.number}</strong>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty">
              <h3>No chapter updates yet.</h3>
              <p>
                New chapters will appear here when release information is added.
              </p>
            </div>
          )}
        </section>
        <aside className="desk-note">
          <p className="eyebrow">Community notice</p>
          <h2>A home for manga fans.</h2>
          <p>
            Discover manga, check chapter updates, and find links to official
            editions.
          </p>
          <p>
            The catalog is open. Chapter discussions and personal reading lists
            are coming next.
          </p>
          <div className="note-rule" />
          <span className="metadata">A small community, in the making.</span>
        </aside>
      </div>
      <section className="shelf">
        <div className="section-heading">
          <h2>Explore manga</h2>
          <Link href="/discover">View all manga →</Link>
        </div>
        {catalog.items.length ? (
          <div className="shelf-items">
            {catalog.items.slice(0, 6).map((m) => (
              <Link className="shelf-item" key={m.id} href={`/manga/${m.slug}`}>
                <Cover manga={m} />
                <h3>{m.title}</h3>
                <p>{m.author}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="empty">The catalog has no titles yet.</p>
        )}
      </section>
      {process.env.CATALOG_DEMO === "true" && (
        <p className="fixture-note">
          LOCAL EDITION · Sample catalog. Chapter dates are development
          fixtures, not a live release schedule.
        </p>
      )}
    </>
  );
}
