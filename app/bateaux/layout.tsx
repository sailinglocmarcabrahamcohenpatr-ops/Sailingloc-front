import { Navbar } from "@/widgets/navbar";
import { FiltersBar } from "@/features/filter-boats";
import { Footer } from "@/widgets/footer";

export default function BateauxLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="catalog-filters-bar">
        <div className="container">
          <FiltersBar />
        </div>
      </div>
      <main>{children}</main>
      <Footer />
    </>
  );
}
