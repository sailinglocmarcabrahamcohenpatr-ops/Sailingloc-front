import type { Boat } from "./types";

const STORAGE_KEY = "sailingloc_user_boats";

export const USER_BOATS_EVENT = "sailingloc:user-boats-changed";

export function getUserBoats(): Boat[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Boat[]) : [];
  } catch {
    return [];
  }
}

export function addUserBoat(boat: Boat): void {
  if (typeof window === "undefined") return;
  const boats = [...getUserBoats(), boat];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(boats));
  window.dispatchEvent(new Event(USER_BOATS_EVENT));
}
