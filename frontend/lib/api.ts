export type Manga = {
  id: number;
  slug: string;
  title: string;
  alternateTitle: string | null;
  author: string;
  description: string;
  status: string;
  genres: string;
  officialUrl: string | null;
  sourceId?: number;
  sourceUrl?: string | null;
  coverUrl?: string | null;
  popularity?: number;
};
export type Chapter = {
  id: number;
  number: number;
  title: string | null;
  releasedAt: string;
  officialUrl: string | null;
};
export type Release = Chapter & { mangaTitle: string; mangaSlug: string };
export type Results<T> = {
  items: T[];
  page: number;
  totalPages: number;
  totalItems: number;
};
export class ApiError extends Error {
  constructor(public status: number) {
    super(
      status === 404
        ? "This manga is not in the catalog."
        : "The catalog could not be reached. Please try again.",
    );
  }
}
export async function api<T>(path: string): Promise<T> {
  const response = await fetch(`/api${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new ApiError(response.status);
  return response.json();
}
export function date(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export const genres = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Ecchi",
  "Fantasy",
  "Horror",
  "Mahou Shoujo",
  "Mecha",
  "Music",
  "Mystery",
  "Psychological",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Thriller",
];
