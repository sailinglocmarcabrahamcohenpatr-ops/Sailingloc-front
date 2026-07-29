import { Suspense } from "react";
import { FiltersBar } from "@/features/filter-boats";
import { SearchBarCompact } from "@/features/search-boats";

export default function BateauxLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="catalog-filters-bar">
        <div className="container flex justify-center">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full max-w-5xl mx-auto">
            <div className="flex-1 min-w-0">
              <Suspense fallback={null}>
                <SearchBarCompact />
              </Suspense>
            </div>
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
