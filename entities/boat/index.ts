export type { Boat, BoatType, BadgeVariant } from "./model/types";
export { FEATURED_BOATS, ALL_BOATS } from "./model/data";
export { getBoats, getBoatById, getFeaturedBoats, searchBoats } from "./api/index";
export { default as BoatCard } from "./ui/BoatCard";
