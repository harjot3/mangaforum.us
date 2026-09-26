import Image from "next/image";
import Link from "next/link";

const characters = {
  yatora: {
    name: "Yatora Yaguchi",
    series: "blue-period",
    image: "blue-period.webp",
  },
  coco: {
    name: "Coco",
    series: "witch-hat-atelier",
    image: "witch-hat-atelier.webp",
  },
  naruto: { name: "Naruto Uzumaki", series: "naruto", image: "naruto.jpg" },
};

export function CharacterIcon({
  character,
}: {
  character: keyof typeof characters;
}) {
  const entry = characters[character];
  return (
    <Link
      className={`character-icon character-${character}`}
      href={`/manga/${entry.series}`}
      aria-label={`${entry.name} — view series`}
      title={entry.name}
    >
      <Image
        src={`/covers/${entry.image}`}
        alt=""
        width={36}
        height={36}
        unoptimized
      />
    </Link>
  );
}
