import { boatsApi } from "@/shared/lib/boats-api";
import { avisApi } from "@/shared/lib";
import type { Testimonial } from "@/shared/types";

const MAX_TESTIMONIALS = 6;

/** Sélectionne les meilleurs avis réels (avec commentaire) pour la home. Vide si aucun avis en base. */
export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const boats = await boatsApi.getAll({ limit: "200" });
    const boatsWithAvis = boats.filter((b) => (b.nombreAvis ?? 0) > 0);
    if (boatsWithAvis.length === 0) return [];

    const avisByBoat = await Promise.all(
      boatsWithAvis.map((b) => avisApi.getByBateau(b.id).catch(() => []))
    );

    const testimonials: Testimonial[] = [];
    boatsWithAvis.forEach((boat, i) => {
      for (const avis of avisByBoat[i]) {
        if (!avis.commentaire?.trim()) continue;
        testimonials.push({
          id: `avis-${avis.id}`,
          author: avis.utilisateur
            ? `${avis.utilisateur.prenom} ${avis.utilisateur.nom.charAt(0)}.`
            : "Client SailingLoc",
          role: "Locataire",
          avatarSeed: avis.utilisateur ? `user-${avis.utilisateur.id}` : `avis-${avis.id}`,
          rating: avis.note,
          body: avis.commentaire,
          destination: boat.port?.ville ?? "",
          boatType: boat.typeBateau?.labelTypeBateau ?? "",
          noteProprietaire: avis.noteProprietaire,
          noteBateau: avis.noteBateau,
          noteLieu: avis.noteLieu,
        });
      }
    });

    return testimonials
      .sort((a, b) => b.rating - a.rating)
      .slice(0, MAX_TESTIMONIALS);
  } catch {
    return [];
  }
}
