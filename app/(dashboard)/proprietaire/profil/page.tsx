import type { Metadata } from "next";
import ProfilContent from "./ProfilContent";

export const metadata: Metadata = { title: "Mon profil · SailingLoc" };

export default function OwnerProfilPage() {
  return <ProfilContent />;
}
