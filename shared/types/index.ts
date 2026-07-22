export type BoatType =
  | "tous"
  | "voilier"
  | "catamaran"
  | "moteur"
  | "habitable"
  | "semi-rigide"
  | "sans-permis"
  | "ponton";

export type BadgeVariant = "default" | "red" | "green";
export type AccountType = "locataire" | "proprietaire";
export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Destination {
  name: string;
  boatCount: number;
  imageSeed: string;
}

export interface Country {
  name: string;
  flag: string;
  boatCount: number;
  imageSeed: string;
}

export interface Review {
  id: string;
  author: string;
  initial: string;
  date: string;
  rating: number;
  body: string;
  images?: { src: string; alt: string }[];
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  avatarSeed: string;
  rating: number;
  body: string;
  destination: string;
  boatType: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface FilterItem {
  label: string;
  icon?: string;
  /** Maps to URL ?type= param (triggers API refetch) */
  typeParam?: string;
  /** Maps to a URL param for client-side filtering */
  urlParam?: string;
  urlValue?: string;
}

export interface ContactSubject {
  id: string;
  label: string;
  icon: string;
}

export interface BookingGuarantee {
  icon: string;
  color: string;
  title: string;
  desc: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FullDestination {
  slug: string;
  name: string;
  country: string;
  flag: string;
  region: string;
  tagline: string;
  description: string;
  boatCount: number;
  imageSeed: string;
  heroSeed: string;
  heroImage?: string;
  bestPeriod: string;
  avgTemp: string;
  avgWind: string;
  priceFrom: number;
  activities: string[];
  highlights: { title: string; desc: string; icon: string }[];
  tags: string[];
  gallerySeeds: string[];
  galleryImages?: string[];
  center: { lat: number; lng: number };
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  accountType: AccountType;
  avatarSeed: string;
  joinedAt: string;
  verifiedId: boolean;
  bio?: string;
  location?: string;
}

export interface Reservation {
  id: string;
  boatId: string;
  boatName: string;
  boatImageSeed: string;
  location: string;
  startDate: string;
  endDate: string;
  guests: number;
  days: number;
  pricePerDay: number;
  totalPrice: number;
  status: ReservationStatus;
  ownerName?: string;
  renterName?: string;
  renterAvatarSeed?: string;
  message?: string;
}

export interface Message {
  id: string;
  from: string;
  fromAvatarSeed?: string;
  subject: string;
  preview: string;
  date: string;
  read: boolean;
  boatName?: string;
  reservationId?: string;
}
