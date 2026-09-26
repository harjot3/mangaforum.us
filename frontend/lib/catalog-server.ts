import "server-only";
import catalog from "@/data/catalog.json";
import { ApiError, type Manga, type Results } from "./api";

type CatalogSource = "backend" | "bundled" | "fallback";
const pageSize = 12;

function parsePath(path: string) {
  // Only public catalog endpoints can reach the upstream service.
  if (
    path.length > 1400 ||
    !/^\/(manga(?:\/[a-z0-9-]{1,160}(?:\/chapters)?)?|chapters\/recent)$/.test(
      path.split("?")[0],
    )
  ) {
    throw new ApiError(404);
  }
  const url = new URL(path, "http://catalog.invalid");
  const detail = /^\/manga\/([a-z0-9-]+)(\/chapters)?$/.exec(url.pathname);
  const allowed =
    url.pathname === "/manga"
      ? ["q", "status", "genre", "page"]
      : detail?.[2]
        ? ["page"]
        : [];
  for (const key of url.searchParams.keys()) {
    if (!allowed.includes(key) || url.searchParams.getAll(key).length !== 1)
      throw new ApiError(400);
  }
  const q = url.searchParams.get("q") ?? "";
  const genre = url.searchParams.get("genre") ?? "";
  const status = url.searchParams.get("status") ?? "";
  const page = url.searchParams.get("page") ?? "0";
  if (
    q.length > 100 ||
    genre.length > 40 ||
    !["", "ONGOING", "COMPLETED", "HIATUS"].includes(status) ||
    !/^\d{1,5}$/.test(page) ||
    Number(page) > 10000
  ) {
    throw new ApiError(400);
  }
  return {
    url,
    detail,
    q: q.trim().toLowerCase(),
    genre: genre.trim().toLowerCase(),
    status,
    page: Number(page),
  };
}

function bundled(path: ReturnType<typeof parsePath>) {
  const { url, detail, q, genre, status, page } = path;
  if (url.pathname === "/chapters/recent") return [];
  if (detail) {
    const manga = catalog.find((m) => m.slug === detail[1]);
    if (!manga) throw new ApiError(404);
    return detail[2]
      ? { items: [], page, totalPages: 0, totalItems: 0 }
      : manga;
  }
  const matches = catalog
    .filter(
      (m) =>
        (!q ||
          m.title.toLowerCase().includes(q) ||
          m.alternateTitle?.toLowerCase().includes(q)) &&
        (!status || m.status === status) &&
        (!genre || m.genres.toLowerCase().includes(genre)),
    )
    .sort((a, b) => a.title.localeCompare(b.title));
  return {
    items: matches.slice(page * pageSize, (page + 1) * pageSize),
    page,
    totalPages: Math.ceil(matches.length / pageSize),
    totalItems: matches.length,
  } satisfies Results<Manga>;
}

export async function catalogRequest<T>(
  path: string,
): Promise<{ data: T; source: CatalogSource }> {
  const parsed = parsePath(path);
  const backend = process.env.BACKEND_URL;
  if (!backend) return { data: bundled(parsed) as T, source: "bundled" };
  const base = new URL(backend);
  if (
    !["http:", "https:"].includes(base.protocol) ||
    base.username ||
    base.password ||
    base.pathname !== "/" ||
    base.search ||
    base.hash
  ) {
    throw new Error(
      "BACKEND_URL must be an HTTP(S) origin without credentials or a path.",
    );
  }
  try {
    const response = await fetch(
      `${base.origin}/api${parsed.url.pathname}${parsed.url.search}`,
      {
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(2500),
      },
    );
    if (response.status >= 400 && response.status < 500)
      throw new ApiError(response.status);
    if (!response.ok) throw new Error("Catalog upstream unavailable");
    return { data: (await response.json()) as T, source: "backend" };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.warn(
      "Catalog backend unavailable; serving the bundled public catalog.",
    );
    // An outage must not turn a backend-only series into a false 404.
    if (parsed.detail && !catalog.some((m) => m.slug === parsed.detail![1]))
      throw new ApiError(503);
    return { data: bundled(parsed) as T, source: "fallback" };
  }
}

export async function api<T>(path: string): Promise<T> {
  return (await catalogRequest<T>(path)).data;
}
