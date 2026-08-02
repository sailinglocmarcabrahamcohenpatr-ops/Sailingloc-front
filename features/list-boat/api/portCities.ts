/** Villes portuaires connues par pays (code ISO 3166-1 alpha-2), pour
 *  l'autocomplétion du champ Ville. Liste curatée plutôt qu'issue d'une
 *  recherche libre : les API de géocodage (Nominatim) ne permettent pas de
 *  lister « tous les ports d'un pays » de façon fiable — elles ne servent
 *  qu'à résoudre le code postal et les coordonnées d'une ville déjà connue
 *  (voir `resolvePortLocation`). */
export const PORT_CITIES: Record<string, string[]> = {
  FR: [
    "Cannes", "Nice", "Antibes", "Saint-Tropez", "Toulon", "Marseille",
    "Sète", "Port-Vendres", "Bandol", "Cassis", "Hyères", "La Grande-Motte",
    "Le Grau-du-Roi", "Menton", "Villefranche-sur-Mer",
    "Bastia", "Ajaccio", "Calvi", "Porto-Vecchio", "Bonifacio", "Propriano",
    "La Rochelle", "Les Sables-d'Olonne", "Saint-Nazaire", "La Trinité-sur-Mer",
    "Vannes", "Lorient", "Concarneau", "Brest", "Douarnenez",
    "Saint-Malo", "Dinard", "Cherbourg-en-Cotentin", "Le Havre",
    "Deauville", "Honfleur", "Dunkerque", "Boulogne-sur-Mer",
    "Arcachon", "Royan",
  ],
  ES: [
    "Barcelone", "Palma de Majorque", "Ibiza", "Valence", "Alicante",
    "Malaga", "Marbella", "Cadix", "Carthagène", "Denia", "Palamós",
    "Roses", "L'Escala", "Sitges", "Vigo", "La Corogne", "Santander",
    "Bilbao", "Saint-Sébastien", "Almería",
  ],
  IT: [
    "Gênes", "Portofino", "La Spezia", "Livourne", "Naples", "Palerme",
    "Cagliari", "Olbia", "Porto Cervo", "Venise", "Trieste", "Rimini",
    "Ancône", "Bari", "Tarente", "Messine", "Catane", "Sanremo",
    "Portoferraio", "Amalfi",
  ],
  GR: [
    "Le Pirée", "Athènes", "Corfou", "Rhodes", "Mykonos", "Santorin",
    "Héraklion", "La Canée", "Nauplie", "Patras", "Thessalonique",
    "Kos", "Paros", "Naxos", "Lefkada", "Zante", "Argostoli",
    "Volos", "Kavala", "Samos",
  ],
};
