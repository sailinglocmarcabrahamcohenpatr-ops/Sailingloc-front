import type { Metadata } from "next";

export const metadata: Metadata = { title: "Paiements — SailingLoc" };

const TRANSACTIONS = [
  { id: "t1", type: "debit" as const, label: "Location Sun Odyssey 440 · Marseille", date: "10 juill. 2025", amount: 6230, ref: "#R-2847" },
  { id: "t2", type: "refund" as const, label: "Remboursement annulation Bavaria 46", date: "3 juin 2025", amount: 2010, ref: "#R-2391" },
  { id: "t3", type: "debit" as const, label: "Location Bavaria 46 · Nice", date: "1 juin 2025", amount: 6020, ref: "#R-2388" },
  { id: "t4", type: "debit" as const, label: "Location Jeanneau 54 · La Ciotat", date: "10 sept. 2024", amount: 8680, ref: "#R-1944" },
];

export default function PaiementsPage() {
  const totalSpent = TRANSACTIONS.filter((t) => t.type === "debit").reduce((a, t) => a + t.amount, 0);
  const totalRefunded = TRANSACTIONS.filter((t) => t.type === "refund").reduce((a, t) => a + t.amount, 0);

  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">Paiements</h1>
          <p className="dash-sub">Vos moyens de paiement et historique de transactions</p>
        </div>
      </div>

      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: "#EEF3FE", color: "#1866F2" }}>
            <i className="fa-solid fa-euro-sign" />
          </div>
          <div>
            <div className="dash-stat-value">{totalSpent.toLocaleString("fr-FR")} €</div>
            <div className="dash-stat-label">Total dépensé</div>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: "#D1FAE5", color: "#10B981" }}>
            <i className="fa-solid fa-rotate-left" />
          </div>
          <div>
            <div className="dash-stat-value">{totalRefunded.toLocaleString("fr-FR")} €</div>
            <div className="dash-stat-label">Remboursements reçus</div>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: "#FEF3C7", color: "#D97706" }}>
            <i className="fa-solid fa-receipt" />
          </div>
          <div>
            <div className="dash-stat-value">{TRANSACTIONS.filter((t) => t.type === "debit").length}</div>
            <div className="dash-stat-label">Locations payées</div>
          </div>
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-card-hd"><h3>Moyens de paiement</h3></div>
        <div className="payment-items" style={{ marginBottom: "20px" }}>
          <div className="payment-method">
            <i className="fa-brands fa-cc-visa" style={{ fontSize: "1.75rem", color: "#1A1F71" }} />
            <div>
              <strong>Visa •••• 4242</strong>
              <span>Expire 09/2027 · Carte principale</span>
            </div>
            <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
              <span className="badge-status green">Principale</span>
              <button className="btn btn-ghost btn-sm">Supprimer</button>
            </div>
          </div>
          <div className="payment-method" style={{ marginTop: "12px" }}>
            <i className="fa-brands fa-cc-mastercard" style={{ fontSize: "1.75rem", color: "#EB001B" }} />
            <div>
              <strong>Mastercard •••• 8371</strong>
              <span>Expire 03/2026</span>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }}>Supprimer</button>
          </div>
        </div>
        <button className="btn btn-outline btn-sm">
          <i className="fa-solid fa-plus" /> Ajouter une carte
        </button>
      </div>

      <div className="dash-card">
        <div className="dash-card-hd">
          <h3>Historique des transactions</h3>
          <button className="btn btn-outline btn-sm">
            <i className="fa-solid fa-download" /> Exporter
          </button>
        </div>
        <div className="transactions-list">
          <div className="transactions-head">
            <span>Transaction</span>
            <span>Référence</span>
            <span>Date</span>
            <span>Montant</span>
          </div>
          {TRANSACTIONS.map((t) => (
            <div key={t.id} className="transaction-row">
              <div>
                <strong style={{ fontSize: ".875rem" }}>{t.label}</strong>
              </div>
              <span style={{ fontSize: ".8125rem", color: "var(--text-2)" }}>{t.ref}</span>
              <span style={{ fontSize: ".875rem", color: "var(--text-2)" }}>{t.date}</span>
              <strong className={t.type === "refund" ? "text-green" : "text-danger"} style={{ fontSize: ".9375rem" }}>
                {t.type === "refund" ? "+" : "−"}{t.amount.toLocaleString("fr-FR")} €
              </strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
