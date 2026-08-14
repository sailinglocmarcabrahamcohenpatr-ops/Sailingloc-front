import type { MetadataRoute } from "next";
import { APP_URL } from "@/shared/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/_next/",
        // Espaces privés (nécessitent une session) : sans valeur pour le SEO,
        // et leur indexation exposerait des URLs propres à chaque utilisateur.
        "/profil/",
        "/proprietaire/dashboard",
        "/proprietaire/bateaux/",
        "/proprietaire/reservations",
        "/proprietaire/revenus",
        "/proprietaire/messages",
        "/proprietaire/profil",
        "/admin/",
        // Tunnel de réservation : contenu transactionnel propre à chaque session.
        "/reservation/",
      ],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
