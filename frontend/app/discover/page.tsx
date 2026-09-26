import { Suspense } from "react";
import { Catalog, CatalogSkeleton } from "@/components/catalog";
export const metadata = { title: "Manga index" };
export default function Discover() {
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Manga database</h1>
        </div>
      </div>
      <Suspense fallback={<CatalogSkeleton />}>
        <Catalog />
      </Suspense>
    </>
  );
}
