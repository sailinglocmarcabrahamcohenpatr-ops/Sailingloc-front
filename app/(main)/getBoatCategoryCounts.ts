import { boatsApi } from "@/shared/lib/boats-api";
import { normalizeText } from "@/shared/lib/destination-match";

const CATEGORY_SLUGS = ["voilier", "catamaran", "moteur", "semi-rigide", "habitable", "sans-permis"] as const;

/** Même logique de correspondance que le filtre catalogue (app/(main)/bateaux/(catalog)/page.tsx),
 *  dupliquée ici plutôt que partagée pour rester cohérente même si l'une évolue indépendamment —
 *  ce qui compte est que les compteurs de la home correspondent à ce que /bateaux?type=X affiche. */
function boatMatchesType(labelTypeBateau: string | undefined, slug: string): boolean {
  const label = normalizeText(labelTypeBateau ?? "").replace(/[^a-z0-9]+/g, " ");
  const needle = slug.replace(/-/g, " ");
  return label.includes(needle);
}

/** Compte les annonces disponibles par type de bateau, pour les cartes catégories de la home.
 *  0 partout si l'API est injoignable — la home reste utilisable, les cartes indiquent juste "0 annonce". */
export async function getBoatCategoryCounts(): Promise<Record<string, number>> {
  try {
    const boats = await boatsApi.getAll({ statut: "disponible", limit: "200" });
    const counts: Record<string, number> = {};
    for (const slug of CATEGORY_SLUGS) {
      counts[slug] = boats.filter((b) => boatMatchesType(b.typeBateau?.labelTypeBateau, slug)).length;
    }
    return counts;
  } catch {
    return Object.fromEntries(CATEGORY_SLUGS.map((s) => [s, 0]));
  }
}
