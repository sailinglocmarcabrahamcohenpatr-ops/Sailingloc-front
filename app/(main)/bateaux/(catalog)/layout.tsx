import { Suspense } from "react";
import { FiltersBar } from "@/features/filter-boats";
import { SearchBarCompact } from "@/features/search-boats";

export default function BateauxLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="catalog-filters-bar">
        <div className="container flex justify-center">
          <div className="boat-search-pill">
            <Suspense fallback={null}>
              <SearchBarCompact />
            </Suspense>
            <Suspense fallback={null}>
              <FiltersBar />
            </Suspense>
          </div>
        </div>
      </div>
      {children}
    </>
  );
}
