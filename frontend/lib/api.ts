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
  const base =
    typeof window === "undefined"
      ? `${process.env.BACKEND_URL ?? "http://localhost:8080"}/api`
      : "/api";
  const response = await fetch(`${base}${path}`, {
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
