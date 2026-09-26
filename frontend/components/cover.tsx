import type { Manga } from "@/lib/api";
export function Cover({
  manga,
  small = false,
}: {
  manga: Pick<Manga, "title" | "id">;
  small?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={`cover cover-${manga.id % 4} ${small ? "cover-small" : ""}`}
    >
      <span className="cover-label">
        MANGA / {String(manga.id).padStart(3, "0")}
      </span>
      <strong>{manga.title}</strong>
      <span className="cover-bottom">
        TITLE FILE
        <br />
        MANGAFORUM
      </span>
    </div>
  );
}
