import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mes revenus" };

const MONTHLY = [
  { month: "Janvier", amount: 0, reservations: 0 },
  { month: "Février", amount: 0, reservations: 0 },
  { month: "Mars", amount: 890, reservations: 1 },
  { month: "Avril", amount: 2670, reservations: 3 },
  { month: "Mai", amount: 5340, reservations: 6 },
  { month: "Juin", amount: 8900, reservations: 10 },
  { month: "Juillet (prévu)", amount: 14240, reservations: 16 },
];

const max = Math.max(...MONTHLY.map((m) => m.amount));

const TRANSACTIONS = [
  { id: "tx1", renter: "Sophie M.", boat: "Sun Odyssey 440", dates: "10–17 juill.", amount: 6230, commission: 430, net: 5800, date: "2025-07-10" },
  { id: "tx2", renter: "Isabelle R.", boat: "Sun Odyssey 440", dates: "1–8 juin", amount: 6230, commission: 430, net: 5800, date: "2025-06-01" },
  { id: "tx3", renter: "Pierre L.", boat: "Leopard 45", dates: "15–22 mai", amount: 11550, commission: 800, net: 10750, date: "2025-05-15" },
];

export default function OwnerRevenuePage() {
  const totalNet = TRANSACTIONS.reduce((a, t) => a + t.net, 0);
  const totalGross = TRANSACTIONS.reduce((a, t) => a + t.amount, 0);

  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">Revenus</h1>
          <p className="dash-sub">Suivi de vos gains sur SailingLoc</p>
        </div>
        <button className="btn btn-outline btn-sm">
          <i className="fa-solid fa-download" /> Exporter PDF
        </button>
      </div>

      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: "#EEF3FE", color: "#1866F2" }}>
            <i className="fa-solid fa-euro-sign" />
          </div>
          <div>
            <div className="dash-stat-value">{totalNet.toLocaleString("fr-FR")} €</div>
            <div className="dash-stat-label">Revenus nets cumulés</div>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: "#F0FDF4", color: "#10B981" }}>
            <i className="fa-solid fa-calendar-check" />
          </div>
          <div>
            <div className="dash-stat-value">{TRANSACTIONS.length}</div>
            <div className="dash-stat-label">Locations réalisées</div>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: "#FEF3C7", color: "#D97706" }}>
            <i className="fa-solid fa-chart-line" />
          </div>
          <div>
            <div className="dash-stat-value">{Math.round(totalNet / TRANSACTIONS.length).toLocaleString("fr-FR")} €</div>
            <div className="dash-stat-label">Revenu moyen / location</div>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: "#F5F3FF", color: "#8B5CF6" }}>
            <i className="fa-solid fa-percent" />
          </div>
          <div>
            <div className="dash-stat-value">15%</div>
            <div className="dash-stat-label">Commission SailingLoc</div>
          </div>
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-card-hd"><h3>Évolution mensuelle 2025</h3></div>
        <div className="revenue-chart">
          {MONTHLY.map((m) => (
            <div key={m.month} className="revenue-bar-col">
              <span className="revenue-bar-amount">{m.amount > 0 ? `${(m.amount / 1000).toFixed(1)}k` : ""}</span>
              <div
                className="revenue-bar"
                style={{ height: `${max > 0 ? (m.amount / max) * 160 : 4}px` }}
                title={`${m.month} : ${m.amount.toLocaleString("fr-FR")} €`}
              />
              <span className="revenue-bar-month">{m.month.slice(0, 3)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-card-hd"><h3>Transactions récentes</h3></div>
        <div className="transactions-list">
          <div className="transactions-head">
            <span>Locataire / Bateau</span><span>Montant brut</span><span>Commission</span><span>Revenu net</span>
          </div>
          {TRANSACTIONS.map((t) => (
            <div key={t.id} className="transaction-row">
              <div>
                <strong>{t.renter}</strong>
                <span>{t.boat} · {t.dates}</span>
              </div>
              <span>{t.amount.toLocaleString("fr-FR")} €</span>
              <span className="text-danger">−{t.commission.toLocaleString("fr-FR")} €</span>
              <strong className="text-green">{t.net.toLocaleString("fr-FR")} €</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
