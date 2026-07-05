import { Navbar } from "@/widgets/navbar";
import { FiltersBar } from "@/features/filter-boats";
import { SearchBarCompact } from "@/features/search-boats";
import { Footer } from "@/widgets/footer";

export default function BateauxLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="catalog-filters-bar">
        <div className="container">
          <div className="catalog-search-filter-row">
            <SearchBarCompact />
            <FiltersBar />
          </div>
        </div>
      </div>
      <main>{children}</main>
      <Footer />
    </>
  );
}
