import type { Metadata } from "next";
import ProfileContent from "./ProfileContent";

export const metadata: Metadata = { title: "Espace propriétaire" };

export default function ProfilePage() {
  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <h1 className="dash-title">Espace propriétaire</h1>
      </div>
      <ProfileContent />
    </div>
  );
}
