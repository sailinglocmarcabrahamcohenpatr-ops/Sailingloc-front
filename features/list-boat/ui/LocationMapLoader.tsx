"use client";

import dynamic from "next/dynamic";

const LocationMap = dynamic(() => import("./LocationMap"), {
  ssr: false,
  loading: () => (
    <div className="location-map-loading">
      <i className="fa-solid fa-map-location-dot" aria-hidden="true" />
    </div>
  ),
});

export default LocationMap;
