import type { Metadata } from "next";
import Link from "next/link";
import { Providers } from "@/components/providers";
import "./globals.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: {
    default: "MangaForum.us | Manga & chapter updates",
    template: "%s | MangaForum.us",
  },
  description: "Manga titles, authors, synopses, and official publisher links.",
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
                  placeholder="Search manga"
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
            <nav aria-label="Legal">
              <Link href="/terms">Terms of Service</Link>
              <Link href="/privacy">Privacy Policy</Link>
            </nav>
            <small>
              Series information from official publishers. Cover artwork belongs
              to its respective owners.
            </small>
          </footer>
        </div>
      </body>
    </html>
  );
}
