'use client';
export default function ErrorPage({ reset }: { reset: () => void }) { return <section className="empty" role="alert"><h1>The shelf is temporarily unavailable.</h1><p>We couldn’t reach the catalog. Please try again shortly.</p><button onClick={reset}>Try again</button></section>; }
