import Link from "next/link";
import { notFound } from "next/navigation";
import { api, ApiError, Manga, Chapter, Results, date } from "@/lib/api";
export const dynamic = "force-dynamic";
export default async function Chapters({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const search = await searchParams;
  const page = /^\d+$/.test(search.page ?? "")
    ? Math.min(10000, Number(search.page))
    : 0;
  let manga: Manga;
  try {
    manga = await api<Manga>(`/manga/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const chapters = await api<Results<Chapter>>(
    `/manga/${encodeURIComponent(slug)}/chapters?page=${page}`,
  );
  return (
    <>
      <p className="breadcrumb">
        <Link href="/discover">Manga index</Link> /{" "}
        <Link href={`/manga/${slug}`}>{manga.title}</Link>
      </p>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Chapters</p>
          <h1>{manga.title}</h1>
        </div>
        <p>
          {chapters.totalItems} recorded chapters
          <br />
          Newest chapter first
        </p>
      </div>
      <nav className="tabs" aria-label="Series sections">
        <Link href={`/manga/${slug}`}>Overview</Link>
        <Link aria-current="page" href={`/manga/${slug}/chapters`}>
          Chapters
        </Link>
      </nav>
      <p className="metadata">
        Release metadata only. Official series links may have regional
        availability restrictions.
      </p>
      {chapters.items.length ? (
        chapters.items.map((c) => (
          <div className="chapter-row" key={c.id}>
            <strong>Chapter {c.number}</strong>
            <span>{date(c.releasedAt)}</span>
            {c.officialUrl ? (
              <a href={c.officialUrl} target="_blank" rel="noopener noreferrer">
                Official series ↗
              </a>
            ) : (
              <span>Link unavailable</span>
            )}
          </div>
        ))
      ) : (
        <p className="empty">No chapters on this page.</p>
      )}
      <nav className="pagination" aria-label="Chapter pages">
        {page > 0 && <Link href={`?page=${page - 1}`}>Previous</Link>}
        <span>
          Page {page + 1} of {Math.max(1, chapters.totalPages)}
        </span>
        {page + 1 < chapters.totalPages && (
          <Link href={`?page=${page + 1}`}>Next</Link>
        )}
      </nav>
    </>
  );
}
