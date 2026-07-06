import { Navbar } from "@/widgets/navbar";
import { FiltersBar } from "@/features/filter-boats";
import { SearchBarCompact } from "@/features/search-boats";
import { Footer } from "@/widgets/footer";

export default function BateauxLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="catalog-filters-bar">
        <div className="container flex justify-center">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full max-w-5xl mx-auto">
            <div className="flex-1 min-w-0">
              <SearchBarCompact />
            </div>
            <FiltersBar />
          </div>
        </div>
      </div>
      <main>{children}</main>
      <Footer />
    </>
  );
}
