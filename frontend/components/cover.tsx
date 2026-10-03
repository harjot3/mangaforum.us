import Image from "next/image";
import type { Manga } from "@/lib/api";
export function Cover({
  manga,
  small = false,
}: {
  manga: Pick<Manga, "title" | "id" | "slug" | "coverUrl">;
  small?: boolean;
}) {
  const covers: Record<string, string> = {
    "chainsaw-man": "jpg",
    dandadan: "jpg",
    "one-piece": "jpg",
    "fullmetal-alchemist": "jpg",
    "death-note": "jpg",
    naruto: "jpg",
    "blue-period": "webp",
    "witch-hat-atelier": "webp",
  };
  const remoteCover = manga.coverUrl?.startsWith(
    "https://s4.anilist.co/file/anilistcdn/media/manga/",
  )
    ? manga.coverUrl
    : undefined;
  const src = covers[manga.slug]
    ? `/covers/${manga.slug}.${covers[manga.slug]}`
    : remoteCover;
  if (src) {
    return (
      <div className="manga-cover">
        <Image
          src={src}
          alt={`${manga.title} cover`}
          unoptimized
          width={200}
          height={300}
          sizes={small ? "95px" : "(max-width: 450px) 140px, 175px"}
        />
      </div>
    );
  }
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
