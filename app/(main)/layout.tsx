import { Navbar } from "@/widgets/navbar";
import { Footer } from "@/widgets/footer";
import "./site-main.css";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="site-main">{children}</main>
      <Footer />
    </>
  );
}
