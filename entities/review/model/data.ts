import type { Review } from "@/shared/types";

export const PRODUCT_REVIEWS: Review[] = [
  {
    id: "r1",
    author: "Sophie & Tancrède",
    initial: "S",
    date: "Juillet 2025",
    rating: 5,
    body: "Bateau exceptionnel ! Marc est un propriétaire très à l'écoute qui nous a parfaitement briefés. Le Sun Odyssey 440 est en parfait état, très bien équipé. Nous avons fait un merveilleux tour des calanques puis rejoint l'île de Porquerolles. Expérience inoubliable, on reviendra sans hésiter.",
    images: [
      { src: "https://picsum.photos/seed/review-calanque/160/120", alt: "Photo de voyage" },
      { src: "https://picsum.photos/seed/review-sunset/160/120", alt: "Coucher de soleil" },
    ],
  },
  {
    id: "r2",
    author: "Thomas & Clara",
    initial: "T",
    date: "Juin 2025",
    rating: 4,
    body: "Très belle expérience avec ce voilier. Le bateau est superbe et Marc répond très rapidement. Quelques petits équipements à améliorer (barbecue en fin de vie) mais l'ensemble est vraiment au niveau. La navigation en Méditerranée depuis Marseille est fantastique avec ce bateau.",
  },
  {
    id: "r3",
    author: "Antoine B.",
    initial: "A",
    date: "Mai 2025",
    rating: 5,
    body: "Cinquième location avec SailingLoc et toujours aussi satisfait ! Ce Sun Odyssey est vraiment l'un des meilleurs bateaux de la flotte. Excellent rapport qualité-prix pour ce niveau de confort.",
  },
];
