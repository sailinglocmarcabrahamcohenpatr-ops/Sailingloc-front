import { STATS } from "@/shared/config";

export default function StatsStripe() {
  return (
    <section className="stats-stripe" aria-label="Chiffres clés SailingLoc">
      <div className="container">
        <div className="stats-row">
          {STATS.map((stat) => (
            <div key={stat.label} className="fade-in">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
