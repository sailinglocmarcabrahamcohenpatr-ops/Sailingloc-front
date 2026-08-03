import type { Metadata } from "next";
import { getRequestLocale, getDictionary } from "@/shared/i18n/get-dictionary";
import "./paiements.css";

export const metadata: Metadata = { title: "Paiements — SailingLoc" };

const TRANSACTIONS = [
  { id: "t1", type: "debit" as const, label: "Location Sun Odyssey 440 · Marseille", date: "10 juill. 2025", amount: 6230, ref: "#R-2847" },
  { id: "t2", type: "refund" as const, label: "Remboursement annulation Bavaria 46", date: "3 juin 2025", amount: 2010, ref: "#R-2391" },
  { id: "t3", type: "debit" as const, label: "Location Bavaria 46 · Nice", date: "1 juin 2025", amount: 6020, ref: "#R-2388" },
  { id: "t4", type: "debit" as const, label: "Location Jeanneau 54 · La Ciotat", date: "10 sept. 2024", amount: 8680, ref: "#R-1944" },
];

export default async function PaiementsPage() {
  const t = getDictionary(await getRequestLocale()).paiementsPage;
  const totalSpent = TRANSACTIONS.filter((tr) => tr.type === "debit").reduce((a, tr) => a + tr.amount, 0);
  const totalRefunded = TRANSACTIONS.filter((tr) => tr.type === "refund").reduce((a, tr) => a + tr.amount, 0);

  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">{t.title}</h1>
          <p className="dash-sub">{t.sub}</p>
        </div>
      </div>

      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: "#EAF0F4", color: "#114B6B" }}>
            <i className="fa-solid fa-euro-sign" />
          </div>
          <div>
            <div className="dash-stat-value">{totalSpent.toLocaleString(t.intlLocale)} €</div>
            <div className="dash-stat-label">{t.totalSpent}</div>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: "#D1FAE5", color: "#10B981" }}>
            <i className="fa-solid fa-rotate-left" />
          </div>
          <div>
            <div className="dash-stat-value">{totalRefunded.toLocaleString(t.intlLocale)} €</div>
            <div className="dash-stat-label">{t.totalRefunded}</div>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: "#FEF3C7", color: "#D97706" }}>
            <i className="fa-solid fa-receipt" />
          </div>
          <div>
            <div className="dash-stat-value">{TRANSACTIONS.filter((tr) => tr.type === "debit").length}</div>
            <div className="dash-stat-label">{t.paidBookings}</div>
          </div>
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-card-hd"><h3>{t.paymentMethodsTitle}</h3></div>
        <div className="payment-items" style={{ marginBottom: "20px" }}>
          <div className="payment-method">
            <i className="fa-brands fa-cc-visa" style={{ fontSize: "1.75rem", color: "#1A1F71" }} />
            <div>
              <strong>Visa •••• 4242</strong>
              <span>Expire 09/2027 · {t.mainCard}</span>
            </div>
            <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
              <span className="badge-status green">{t.mainBadge}</span>
              <button className="btn btn-ghost btn-sm">{t.remove}</button>
            </div>
          </div>
          <div className="payment-method" style={{ marginTop: "12px" }}>
            <i className="fa-brands fa-cc-mastercard" style={{ fontSize: "1.75rem", color: "#EB001B" }} />
            <div>
              <strong>Mastercard •••• 8371</strong>
              <span>Expire 03/2026</span>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }}>{t.remove}</button>
          </div>
        </div>
        <button className="btn btn-outline btn-sm">
          <i className="fa-solid fa-plus" /> {t.addCard}
        </button>
      </div>

      <div className="dash-card">
        <div className="dash-card-hd">
          <h3>{t.historyTitle}</h3>
          <button className="btn btn-outline btn-sm">
            <i className="fa-solid fa-download" /> {t.export}
          </button>
        </div>
        <div className="transactions-list">
          <div className="transactions-head">
            <span>{t.colTransaction}</span>
            <span>{t.colReference}</span>
            <span>{t.colDate}</span>
            <span>{t.colAmount}</span>
          </div>
          {TRANSACTIONS.map((tr) => (
            <div key={tr.id} className="transaction-row">
              <div>
                <strong style={{ fontSize: ".875rem" }}>{tr.label}</strong>
              </div>
              <span style={{ fontSize: ".8125rem", color: "var(--text-2)" }}>{tr.ref}</span>
              <span style={{ fontSize: ".875rem", color: "var(--text-2)" }}>{tr.date}</span>
              <strong className={tr.type === "refund" ? "text-green" : "text-danger"} style={{ fontSize: ".9375rem" }}>
                {tr.type === "refund" ? "+" : "−"}{tr.amount.toLocaleString(t.intlLocale)} €
              </strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
