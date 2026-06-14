import { Navbar } from "@/widgets/navbar";
import { Footer } from "@/widgets/footer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
