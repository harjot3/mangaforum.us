import Link from "next/link";
import { notFound } from "next/navigation";
import { api, ApiError, Manga, Chapter, Results, date } from "@/lib/api";
import { Cover } from "@/components/cover";
export const dynamic = "force-dynamic";
export default async function MangaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let manga: Manga;
  try {
    manga = await api<Manga>(`/manga/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const chapters = await api<Results<Chapter>>(
    `/manga/${encodeURIComponent(slug)}/chapters`,
  );
  return (
    <>
      <p className="breadcrumb">
        <Link href="/discover">Manga index</Link> / {manga.title}
      </p>
      <div className="manga-intro">
        <Cover manga={manga} />
        <div>
          <p className="eyebrow">
            {manga.status.toLowerCase()} · {manga.genres}
          </p>
          <h1>{manga.title}</h1>
          <p className="alternate">{manga.alternateTitle}</p>
          <p className="byline">By {manga.author}</p>
          <p className="synopsis">{manga.description}</p>
          {manga.officialUrl && (
            <a
              className="button"
              href={manga.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Find the official edition ↗
            </a>
          )}
        </div>
      </div>
      <nav className="tabs" aria-label="Series sections">
        <Link aria-current="page" href={`/manga/${slug}`}>
          Overview
        </Link>
        <Link href={`/manga/${slug}/chapters`}>
          Chapters ({chapters.totalItems})
        </Link>
      </nav>
      <div className="series-chapters">
        <section>
          <div className="section-heading">
            <h2>Latest recorded chapters</h2>
            <Link href={`/manga/${slug}/chapters`}>View all →</Link>
          </div>
          {chapters.items.length ? (
            chapters.items.slice(0, 5).map((c) => (
              <div className="chapter-row" key={c.id}>
                <strong>Chapter {c.number}</strong>
                <span>{date(c.releasedAt)}</span>
                {c.officialUrl && (
                  <a
                    href={c.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Official series ↗
                  </a>
                )}
              </div>
            ))
          ) : (
            <p className="empty">
              Chapter data has not been added for this series. See the official
              publisher for available chapters.
            </p>
          )}
        </section>
      </div>
    </>
  );
}
