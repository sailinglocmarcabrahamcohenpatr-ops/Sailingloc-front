"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DevLogin() {
  const router = useRouter();

  useEffect(() => {
    const user = {
      name: "Florian Marc",
      email: "florian.marc@test.com",
      initials: "FM",
      role: "locataire",
    };
    localStorage.setItem("sailingloc_user", JSON.stringify(user));
    router.push("/espace-proprietaire");
  }, [router]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "sans-serif", color: "#637083" }}>
      Connexion de test en cours…
    </div>
  );
}
