import { ALL_BOATS } from "@/entities/boat";
import type { Boat } from "@/entities/boat";
import BoatsMapCard from "./BoatsMapCard";

interface BoatsSidebarProps {
  boats?: Boat[];
}

export default function BoatsSidebar({ boats = ALL_BOATS }: BoatsSidebarProps) {
  return (
    <aside className="sidebar" aria-label="Informations complémentaires">
      <div className="weather-card" role="region" aria-label="Météo locale">
        <div className="weather-location">
          <i className="fa-solid fa-location-dot" aria-hidden="true" /> Marseille Sainte-Victoire
        </div>
        <div className="weather-main">
          <div>
            <div className="weather-temp">27<sup>°C</sup></div>
            <div className="weather-desc">Temps radieux</div>
          </div>
          <div className="weather-icon" aria-hidden="true">
            <i className="fa-solid fa-sun" />
          </div>
        </div>
        <div className="weather-grid">
          {[
            { label: "Vent", val: "18 km/h", sub: "8.4 nœuds" },
            { label: "Visibilité", val: "30 km", sub: "Excellente" },
            { label: "Température eau", val: "23°C", sub: "Agréable" },
            { label: "Houle", val: "0.6 m", sub: "Mer calme" },
          ].map((stat) => (
            <div key={stat.label} className="weather-stat">
              <div className="weather-stat-label">{stat.label}</div>
              <div className="weather-stat-val">{stat.val}</div>
              <div className="weather-stat-sub">{stat.sub}</div>
            </div>
          ))}
        </div>
        <div className="weather-rating">
          <div className="weather-rating-label">Conditions de navigation</div>
          <div className="weather-rating-val">Excellente <i className="fa-solid fa-star" aria-hidden="true" /></div>
        </div>
      </div>

      <BoatsMapCard boats={boats} />

      <div className="info-card" role="region" aria-label="Informations utiles">
        <h5>
          <i className="fa-solid fa-circle-info" style={{ color: "var(--primary)" }} aria-hidden="true" />{" "}
          Informations utiles
        </h5>
        {[
          { icon: "fa-shield-halved", label: "Assurance", value: "Incluse dans le prix", badge: "Incluse" },
          { icon: "fa-credit-card", label: "Paiement", value: "Sécurisé & garanti" },
          { icon: "fa-clock", label: "Réponse du propriétaire", value: "Sous 24h en moyenne" },
          { icon: "fa-headset", label: "Support", value: "Lun – Ven, 9h – 18h" },
        ].map((row) => (
          <div key={row.label} className="info-row">
            <div className="info-row-icon">
              <i className={`fa-solid ${row.icon}`} aria-hidden="true" />
            </div>
            <div className="info-row-text">
              <small>{row.label}</small>
              <strong>{row.value}</strong>
            </div>
            {row.badge && <div className="info-row-badge">{row.badge}</div>}
          </div>
        ))}
      </div>

    </aside>
  );
}
