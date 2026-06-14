import type { Metadata } from "next";
import ProfileContent from "./ProfileContent";

export const metadata: Metadata = { title: "Mon profil" };

export default function ProfilePage() {
  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <h1 className="dash-title">Mon profil</h1>
      </div>
      <ProfileContent />
    </div>
  );
}
