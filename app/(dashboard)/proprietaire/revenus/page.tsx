import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mes revenus" };

const MONTHLY = [
  { month: "Janvier", amount: 0, forecast: false },
  { month: "Février", amount: 0, forecast: false },
  { month: "Mars", amount: 890, forecast: false },
  { month: "Avril", amount: 2670, forecast: false },
  { month: "Mai", amount: 5340, forecast: false },
  { month: "Juin", amount: 8900, forecast: false },
  { month: "Juillet", amount: 14240, forecast: true },
];

const max = Math.max(...MONTHLY.map((m) => m.amount));
const bestActual = MONTHLY.filter((m) => !m.forecast && m.amount > 0).reduce((a, b) => (b.amount > a.amount ? b : a));
const bestActualIndex = MONTHLY.indexOf(bestActual);
const prevActual = MONTHLY[bestActualIndex - 1];
const growthPct = prevActual && prevActual.amount > 0 ? Math.round(((bestActual.amount - prevActual.amount) / prevActual.amount) * 100) : null;

const TRANSACTIONS = [
  { id: "tx1", renter: "Sophie M.", boat: "Sun Odyssey 440", dates: "10–17 juill.", amount: 6230, commission: 430, net: 5800, status: "En attente" as const },
  { id: "tx2", renter: "Isabelle R.", boat: "Sun Odyssey 440", dates: "1–8 juin", amount: 6230, commission: 430, net: 5800, status: "Payé" as const },
  { id: "tx3", renter: "Pierre L.", boat: "Leopard 45", dates: "15–22 mai", amount: 11550, commission: 800, net: 10750, status: "Payé" as const },
];

const STATUS_BADGE: Record<string, string> = { "Payé": "green", "En attente": "orange" };

function initials(name: string) {
  return name.split(" ").map((w) => w[0] ?? "").join("").slice(0, 2).toUpperCase();
}

export default function OwnerRevenuePage() {
  const totalNet = TRANSACTIONS.reduce((a, t) => a + t.net, 0);
  const totalGross = TRANSACTIONS.reduce((a, t) => a + t.amount, 0);
  const totalCommission = totalGross - totalNet;
  const netPct = totalGross > 0 ? Math.round((totalNet / totalGross) * 100) : 0;

  return (
    <div className="rv-page">
      <div className="rv-header">
        <div>
          <h1>Revenus</h1>
          <p>Suivi de vos gains sur SailingLoc</p>
        </div>
        <button className="btn-rv-outline">
          <i className="fa-solid fa-download" /> Exporter PDF
        </button>
      </div>

      <div className="rv-stats-grid">
        <div className="rv-stat-card rv-hero">
          <div className="rv-stat-top">
            <div className="rv-stat-icon"><i className="fa-solid fa-sack-dollar" /></div>
            <div className="rv-stat-nav"><i className="fa-solid fa-arrow-right" /></div>
          </div>
          <div className="rv-stat-value">{totalNet.toLocaleString("fr-FR")} €</div>
          <div className="rv-stat-label">Revenus nets cumulés</div>
          <div className="rv-stat-trend"><i className="fa-solid fa-arrow-trend-up" /> En hausse ce mois</div>
        </div>

        <div className="rv-stat-card">
          <div className="rv-stat-top">
            <div className="rv-stat-icon" style={{ background: "#F0FDF4", color: "#10B981" }}><i className="fa-solid fa-calendar-check" /></div>
            <div className="rv-stat-nav"><i className="fa-solid fa-arrow-right" /></div>
          </div>
          <div className="rv-stat-value">{TRANSACTIONS.length}</div>
          <div className="rv-stat-label">Locations réalisées</div>
          <div className="rv-stat-trend"><i className="fa-solid fa-arrow-trend-up" /> +1 vs mois dernier</div>
        </div>

        <div className="rv-stat-card">
          <div className="rv-stat-top">
            <div className="rv-stat-icon" style={{ background: "#FEF3C7", color: "#D97706" }}><i className="fa-solid fa-chart-line" /></div>
            <div className="rv-stat-nav"><i className="fa-solid fa-arrow-right" /></div>
          </div>
          <div className="rv-stat-value">{Math.round(totalNet / TRANSACTIONS.length).toLocaleString("fr-FR")} €</div>
          <div className="rv-stat-label">Revenu moyen / location</div>
          <div className="rv-stat-trend"><i className="fa-solid fa-arrow-trend-up" /> Stable</div>
        </div>

        <div className="rv-stat-card">
          <div className="rv-stat-top">
            <div className="rv-stat-icon" style={{ background: "#F5F3FF", color: "#8B5CF6" }}><i className="fa-solid fa-percent" /></div>
            <div className="rv-stat-nav"><i className="fa-solid fa-arrow-right" /></div>
          </div>
          <div className="rv-stat-value">15%</div>
          <div className="rv-stat-label">Commission SailingLoc</div>
          <div className="rv-stat-trend"><i className="fa-solid fa-check" /> Taux fixe</div>
        </div>
      </div>

      <div className="rv-row rv-row-a">
        <div className="dash-card">
          <div className="dash-card-hd"><h3>Évolution mensuelle 2025</h3></div>
          <div className="rv-chart">
            {MONTHLY.map((m, i) => (
              <div key={m.month} className="rv-chart-col">
                {i === bestActualIndex && growthPct !== null && (
                  <span className="rv-chart-badge">+{growthPct}%</span>
                )}
                <div
                  className={`rv-chart-bar ${m.forecast ? "forecast" : m.amount > 0 ? "filled" : ""}`}
                  style={{ height: `${max > 0 ? Math.max((m.amount / max) * 160, 6) : 6}px` }}
                  title={`${m.month} : ${m.amount.toLocaleString("fr-FR")} €`}
                />
                <span className="rv-chart-month">{m.month.slice(0, 3)}{m.forecast ? " (prév.)" : ""}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rv-dark-card">
          <div className="rv-dark-icon"><i className="fa-solid fa-wallet" /></div>
          <h4>Prochain versement</h4>
          <div className="rv-dark-amount">5 800 €</div>
          <p>Prévu le 20 juillet 2025</p>
          <button className="rv-dark-btn"><i className="fa-solid fa-arrow-right" /> Voir le détail</button>
        </div>
      </div>

      <div className="rv-row rv-row-b">
        <div className="dash-card">
          <div className="dash-card-hd"><h3>Transactions récentes</h3></div>
          <div>
            {TRANSACTIONS.map((t) => (
              <div key={t.id} className="rv-tx-row">
                <div className="rv-tx-avatar">{initials(t.renter)}</div>
                <div className="rv-tx-info">
                  <strong>{t.renter}</strong>
                  <span>{t.boat} · {t.dates}</span>
                </div>
                <span className={`badge-status ${STATUS_BADGE[t.status]}`}>{t.status}</span>
                <div className="rv-tx-amount">
                  <strong>{t.net.toLocaleString("fr-FR")} €</strong>
                  <span>net</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-hd"><h3>Répartition</h3></div>
          <div className="rv-ring-wrap">
            <div
              className="rv-ring"
              style={{ background: `conic-gradient(var(--rv-500) 0% ${netPct}%, #EDEFEE ${netPct}% 100%)` }}
            >
              <span className="rv-ring-value">{netPct}%</span>
            </div>
            <div className="rv-ring-legend">
              <div className="rv-ring-legend-item">
                <span className="rv-ring-dot" style={{ background: "var(--rv-500)" }} />
                Revenu net <strong>{totalNet.toLocaleString("fr-FR")} €</strong>
              </div>
              <div className="rv-ring-legend-item">
                <span className="rv-ring-dot" style={{ background: "#EDEFEE" }} />
                Commission <strong>{totalCommission.toLocaleString("fr-FR")} €</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="rv-dark-card">
          <div className="rv-dark-icon"><i className="fa-solid fa-piggy-bank" /></div>
          <h4>Solde disponible</h4>
          <div className="rv-dark-amount">{totalNet.toLocaleString("fr-FR")} €</div>
          <p>Sur votre compte SailingLoc</p>
          <button className="rv-dark-btn"><i className="fa-solid fa-money-bill-transfer" /> Demander un virement</button>
        </div>
      </div>
    </div>
  );
}
