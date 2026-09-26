import Link from 'next/link';
import { api, date, Manga, Release, Results } from '@/lib/api';
import { Cover } from '@/components/cover';
export const dynamic = 'force-dynamic';
export default async function Home() {
  const [catalog, releases] = await Promise.all([api<Results<Manga>>('/manga'), api<Release[]>('/chapters/recent')]);
  return <><div className="page-heading"><div><p className="eyebrow">The reading room / 01</p><h1>Between chapters.</h1></div><p>Browse a familiar shelf.<br/>Find something worth staying up for.</p></div>
    <div className="home-columns"><section><div className="section-heading"><h2>On the release ledger</h2><span>Latest recorded chapters</span></div>{releases.length ? <div className="release-list">{releases.map((r, i) => <Link className="release" key={r.id} href={`/manga/${r.mangaSlug}/chapters`}><span className="release-index">{String(i + 1).padStart(2, '0')}</span><div><h3>{r.mangaTitle}</h3><span className="metadata">Recorded {date(r.releasedAt)}</span></div><strong>CH. {r.number}</strong></Link>)}</div> : <div className="empty"><h3>The ledger is open.</h3><p>New chapters will appear here when release information is added.</p></div>}</section>
    <aside className="desk-note"><p className="eyebrow">From the desk</p><h2>Leave a little room<br/>for the next chapter.</h2><p>A manga’s title is an invitation. Its ending shouldn’t be the first thing you learn about it.</p><p>This reading room starts with the catalog. Chapter conversations and personal reading shelves are still being built.</p><div className="note-rule"/><span className="metadata">A small community, in the making.</span></aside></div>
    <section className="shelf"><div className="section-heading"><h2>The manga shelf</h2><Link href="/discover">Browse the index →</Link></div>{catalog.items.length ? <div className="shelf-items">{catalog.items.slice(0,6).map(m => <Link className="shelf-item" key={m.id} href={`/manga/${m.slug}`}><Cover manga={m}/><h3>{m.title}</h3><p>{m.author}</p></Link>)}</div> : <p className="empty">The catalog has no titles yet.</p>}</section>
    {process.env.CATALOG_DEMO === 'true' && <p className="fixture-note">LOCAL EDITION · Sample catalog. Chapter dates are development fixtures, not a live release schedule.</p>}
  </>;
}
