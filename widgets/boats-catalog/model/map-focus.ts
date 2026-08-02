/** Port actuellement au centre de la zone visible sur la carte (vue "carte"). */
export interface MapFocusPort {
  name: string;
  lat: number;
  lng: number;
}

/** Diffusé par BoatsSplitMapView à chaque changement de port dominant dans le
 *  cadre visible, pour que BoatsSidebar (météo) puisse réagir sans lien direct
 *  entre les deux composants — même pattern que USER_BOATS_EVENT. */
export const MAP_FOCUS_EVENT = "sailingloc:map-focus-changed";

export function dispatchMapFocus(focus: MapFocusPort | null): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<MapFocusPort | null>(MAP_FOCUS_EVENT, { detail: focus }));
}
