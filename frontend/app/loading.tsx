import { CatalogSkeleton } from "@/components/catalog";
export default function Loading() {
  return (
    <>
      <p className="eyebrow">Opening the reading room</p>
      <CatalogSkeleton />
    </>
  );
}
