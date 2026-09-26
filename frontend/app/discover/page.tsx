import { Suspense } from "react";
import { Catalog, CatalogSkeleton } from "@/components/catalog";
export const metadata = { title: "Manga index" };
export default function Discover() {
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">The catalog / A–Z</p>
          <h1>Manga index.</h1>
        </div>
        <p>
          Follow a title, an author, a curiosity.
          <br />
          There’s always another shelf.
        </p>
      </div>
      <Suspense fallback={<CatalogSkeleton />}>
        <Catalog />
      </Suspense>
    </>
  );
}
