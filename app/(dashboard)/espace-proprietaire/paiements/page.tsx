import type { Metadata } from "next";

export const metadata: Metadata = { title: "Paiements — SailingLoc" };

const MONTHLY = [
  { month: "Février", amount: 0 },
  { month: "Mars", amount: 890 },
  { month: "Avril", amount: 2670 },
  { month: "Mai", amount: 5340 },
  { month: "Juin", amount: 8900 },
  { month: "Juillet", amount: 12030 },
];

const max = Math.max(...MONTHLY.map((m) => m.amount));

const PAIEMENTS = [
  { id: "p1", renter: "Sophie M.", boat: "Sun Odyssey 440 · Marseille", date: "10 juill. 2025", gross: 6230, commission: 430, net: 5800, status: "verse" as const },
  { id: "p2", renter: "Karim B.", boat: "Bavaria 46 · Nice", date: "1 juin 2025", gross: 6020, commission: 400, net: 5620, status: "verse" as const },
  { id: "p3", renter: "Isabelle R.", boat: "Sun Odyssey 440 · Marseille", date: "3 juin 2025", gross: 2010, commission: 140, net: 1870, status: "attente" as const },
  { id: "p4", renter: "Pierre L.", boat: "Jeanneau 54 · La Ciotat", date: "10 sept. 2024", gross: 8680, commission: 610, net: 8070, status: "verse" as const },
];

function statusBadge(status: "verse" | "attente") {
  return status === "verse"
    ? <span className="badge-status green">Versé</span>
    : <span className="badge-status orange">En attente</span>;
}

export default function PaiementsPage() {
  const totalNet = PAIEMENTS.reduce((a, t) => a + t.net, 0);
  const versedNet = PAIEMENTS.filter((t) => t.status === "verse").reduce((a, t) => a + t.net, 0);
  const pendingNet = PAIEMENTS.filter((t) => t.status === "attente").reduce((a, t) => a + t.net, 0);
  const avgCommissionPct = Math.round(
    (PAIEMENTS.reduce((a, t) => a + t.commission, 0) / PAIEMENTS.reduce((a, t) => a + t.gross, 0)) * 100
  );
  const versedPct = Math.round((versedNet / totalNet) * 100);

  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">Paiements</h1>
          <p className="dash-sub">Les paiements reçus de vos locataires et vos revenus générés</p>
        </div>
        <button className="btn btn-outline btn-sm">
          <i className="fa-solid fa-download" /> Exporter
        </button>
      </div>

      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: "#EEF3FE", color: "#1866F2" }}>
            <i className="fa-solid fa-euro-sign" />
          </div>
          <div>
            <div className="dash-stat-value">{totalNet.toLocaleString("fr-FR")} €</div>
            <div className="dash-stat-label">Total reçu (net)</div>
            <div className="dash-stat-trend up"><i className="fa-solid fa-arrow-trend-up" /> +26% vs mois dernier</div>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: "#FEF3C7", color: "#D97706" }}>
            <i className="fa-solid fa-money-bill-transfer" />
          </div>
          <div>
            <div className="dash-stat-value">{pendingNet.toLocaleString("fr-FR")} €</div>
            <div className="dash-stat-label">Prochain versement · 15 juil.</div>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: "#D1FAE5", color: "#10B981" }}>
            <i className="fa-solid fa-calendar-check" />
          </div>
          <div>
            <div className="dash-stat-value">{PAIEMENTS.length}</div>
            <div className="dash-stat-label">Locations payées</div>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: "#F5F3FF", color: "#8B5CF6" }}>
            <i className="fa-solid fa-percent" />
          </div>
          <div>
            <div className="dash-stat-value">{avgCommissionPct}%</div>
            <div className="dash-stat-label">Commission SailingLoc</div>
          </div>
        </div>
      </div>

      <div className="dash-grid-2">
        <div className="dash-card">
          <div className="dash-card-hd"><h3>Évolution des paiements reçus</h3></div>
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
          <div className="dash-card-hd"><h3>Répartition des paiements</h3></div>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: "50%",
                flexShrink: 0,
                background: `conic-gradient(var(--green) 0% ${versedPct}%, var(--star) ${versedPct}% 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: "var(--white)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <strong style={{ fontSize: "1.5rem" }}>{versedPct}%</strong>
                <span style={{ fontSize: ".75rem", color: "var(--text-2)" }}>Versé</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--green)" }} />
                <span style={{ fontSize: ".875rem" }}>Versé</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--star)" }} />
                <span style={{ fontSize: ".875rem" }}>En attente</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-card-hd"><h3>Compte de versement</h3></div>
        <div className="payment-items" style={{ marginBottom: "20px" }}>
          <div className="payment-method">
            <i className="fa-solid fa-building-columns" style={{ fontSize: "1.75rem", color: "var(--primary)" }} />
            <div>
              <strong>IBAN •••• 4821</strong>
              <span>Société Générale · Compte principal</span>
            </div>
            <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
              <span className="badge-status green">Principal</span>
              <button className="btn btn-ghost btn-sm">Modifier</button>
            </div>
          </div>
        </div>
        <button className="btn btn-outline btn-sm">
          <i className="fa-solid fa-plus" /> Ajouter un compte
        </button>
      </div>

      <div className="dash-card">
        <div className="dash-card-hd">
          <h3>Paiements reçus</h3>
        </div>
        <div className="transactions-list">
          <div className="transactions-head">
            <span>Locataire / Bateau</span>
            <span>Montant brut</span>
            <span>Commission</span>
            <span>Revenu net</span>
          </div>
          {PAIEMENTS.map((t) => (
            <div key={t.id} className="transaction-row">
              <div>
                <strong>{t.renter}</strong>
                <span>{t.boat} · {t.date}</span>
              </div>
              <span>{t.gross.toLocaleString("fr-FR")} €</span>
              <span className="text-danger">−{t.commission.toLocaleString("fr-FR")} €</span>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <strong className="text-green">{t.net.toLocaleString("fr-FR")} €</strong>
                {statusBadge(t.status)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
