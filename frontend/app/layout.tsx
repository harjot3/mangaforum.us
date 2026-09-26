import type { Metadata } from "next";
import Link from "next/link";
import { Providers } from "@/components/providers";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "MangaForum.us | Manga & chapter updates",
    template: "%s | MangaForum.us",
  },
  description:
    "A place for manga, chapter by chapter. Browse series, find official editions, and keep the next chapter in sight.",
};
export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <div className="site">
          <header>
            <div className="masthead">
              <Link className="wordmark" href="/">
                Manga<span>Forum</span>
                <small>.us</small>
              </Link>
              <p>Manga. Chapters. Late nights.</p>
              <span className="edition">
                MANGA FANS, WELCOME
                <br />
                EST. 2026
              </span>
            </div>
            <nav className="main-nav" aria-label="Main navigation">
              <Link href="/">Home</Link>
              <Link href="/discover">Manga database</Link>
              <form action="/discover" role="search">
                <label className="sr-only" htmlFor="nav-search">
                  Search manga
                </label>
                <input
                  id="nav-search"
                  name="q"
                  placeholder="Find your next read"
                  maxLength={100}
                />
                <button>Search</button>
              </form>
            </nav>
          </header>
          <Providers>
            <main id="main">{children}</main>
          </Providers>
          <footer>
            <Link className="footer-brand" href="/">
              MangaForum.us
            </Link>
            <p>For the readers who stay after the last page.</p>
            <nav aria-label="Legal">
              <Link href="/terms">Terms of Service</Link>
              <Link href="/privacy">Privacy Policy</Link>
            </nav>
            <small>Metadata and discussion. No manga scans.</small>
          </footer>
        </div>
      </body>
    </html>
  );
}
