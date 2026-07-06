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
          <div className="flex items-center gap-3  max-w-5xl mx-auto justify-center" >
            <div className="flex-1 min-w-0 justify-center ">
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
