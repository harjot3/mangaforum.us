import { CatalogSkeleton } from "@/components/catalog";
export default function Loading() {
  return (
    <>
      <p className="eyebrow">Loading manga</p>
      <CatalogSkeleton />
    </>
  );
}
