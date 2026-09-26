import Link from 'next/link';
export default function NotFound() { return <section className="empty"><p className="eyebrow">404 / Misfiled</p><h1>Nothing on this shelf.</h1><p>That page or manga title isn’t in our catalog.</p><Link href="/discover">Back to the manga index →</Link></section>; }
