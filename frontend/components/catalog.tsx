"use client";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, genres, Manga, Results } from "@/lib/api";
import { Cover } from "./cover";
export function Catalog() {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q") ?? "";
  const status = params.get("status") ?? "";
  const genre = params.get("genre") ?? "";
  const sort = params.get("sort") ?? "popular";
  const page = Math.max(0, Number(params.get("page")) || 0);
  const query = new URLSearchParams({
    q,
    status,
    genre,
    sort,
    page: String(page),
  });
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["manga", q, status, genre, sort, page],
    queryFn: () => api<Results<Manga>>(`/manga?${query}`),
  });
  function changePage(value: number) {
    query.set("page", String(value));
    router.push(`/discover?${query}`);
  }
  return (
    <>
      <form className="filters" action="/discover">
        <label>
          Find a title
          <input
            name="q"
            defaultValue={q}
            key={q}
            placeholder="Title or alternate title"
            maxLength={100}
          />
        </label>
        <label>
          Status
          <select name="status" defaultValue={status} key={status}>
            <option value="">All series</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
            <option value="HIATUS">On hiatus</option>
          </select>
        </label>
        <label>
          Genre
          <select name="genre" defaultValue={genre} key={genre}>
            <option value="">All genres</option>
            {genres.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Sort by
          <select name="sort" defaultValue={sort} key={sort}>
            <option value="popular">Most popular</option>
            <option value="title">Title A–Z</option>
          </select>
        </label>
        <button type="submit">Browse</button>
      </form>
      {isPending ? (
        <CatalogSkeleton />
      ) : isError ? (
        <div className="empty" role="alert">
          <h2>Catalog unavailable</h2>
          <p>We couldn’t load the manga catalog.</p>
          <button onClick={() => refetch()}>Try again</button>
        </div>
      ) : (
        <>
          <p className="metadata">{data.totalItems} titles found</p>
          {data.items.length === 0 ? (
            <div className="empty">
              <h2>No manga found.</h2>
              <p>Try a different title or remove a filter.</p>
              <Link href="/discover">Browse all manga</Link>
            </div>
          ) : (
            <div className="catalog-list">
              {data.items.map((manga) => (
                <article className="catalog-item" key={manga.id}>
                  <Link
                    tabIndex={-1}
                    aria-hidden="true"
                    href={`/manga/${manga.slug}`}
                  >
                    <Cover manga={manga} small />
                  </Link>
                  <div>
                    <p className="eyebrow">
                      {manga.status.toLowerCase()} /{" "}
                      {manga.genres.split(",")[0]}
                    </p>
                    <h2>
                      <Link href={`/manga/${manga.slug}`}>{manga.title}</Link>
                    </h2>
                    <p className="byline">{manga.author}</p>
                    <p className="description">{manga.description}</p>
                    <Link className="text-link" href={`/manga/${manga.slug}`}>
                      Open series →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
          {data.totalPages > 1 && (
            <nav className="pagination" aria-label="Catalog pages">
              <button
                disabled={page === 0}
                onClick={() => changePage(page - 1)}
              >
                Previous
              </button>
              <span>
                Page {page + 1} of {data.totalPages}
              </span>
              <button
                disabled={page + 1 >= data.totalPages}
                onClick={() => changePage(page + 1)}
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </>
  );
}
export function CatalogSkeleton() {
  return (
    <div className="catalog-list" role="status" aria-label="Loading manga">
      {[1, 2, 3, 4].map((n) => (
        <div className="catalog-item skeleton" key={n}>
          <div className="skeleton-cover" />
          <div className="skeleton-copy">
            <div />
            <div />
            <div />
          </div>
        </div>
      ))}
    </div>
  );
}
