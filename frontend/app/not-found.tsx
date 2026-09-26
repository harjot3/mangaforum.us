import Link from "next/link";
export default function NotFound() {
  return (
    <section className="empty">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p>That page or manga title isn’t in our catalog.</p>
      <Link href="/discover">Back to the manga index →</Link>
    </section>
  );
}
