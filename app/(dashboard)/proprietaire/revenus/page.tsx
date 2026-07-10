"use client";

import { useState, useEffect, useMemo } from "react";
import { boatsApi, reservationsApi, useAuth } from "@/shared/lib";
import type { BoatAPI, ReservationAPI } from "@/shared/lib";

const COMMISSION_RATE = 0.15;
const MONTHS_BACK = 6;

type BadgeKey = "confirmed" | "pending" | "cancelled" | "completed";

const STATUS_LABEL: Record<BadgeKey, { label: string; cls: string }> = {
  confirmed: { label: "Confirmée", cls: "green" },
  pending: { label: "En attente", cls: "orange" },
  cancelled: { label: "Annulée", cls: "red" },
  completed: { label: "Terminée", cls: "grey" },
};

function libelleToKey(libelle?: string): BadgeKey {
  if (!libelle) return "pending";
  const l = libelle.toLowerCase();
  if (l.includes("confirm")) return "confirmed";
  if (l.includes("attente")) return "pending";
  if (l.includes("annul")) return "cancelled";
  if (l.includes("termin")) return "completed";
  return "pending";
}

function renterName(r: ReservationAPI): string {
  const u = r.utilisateur;
  if (!u) return `Locataire #${r.idUtilisateur}`;
  return `${u.prenom} ${u.nom}`.trim();
}

function initials(r: ReservationAPI): string {
  const u = r.utilisateur;
  if (!u) return "?";
  return ((u.prenom?.[0] ?? "") + (u.nom?.[0] ?? "")).toUpperCase() || "?";
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

export default function OwnerRevenuePage() {
  const { user } = useAuth();
  const [boats, setBoats] = useState<BoatAPI[]>([]);
  const [reservations, setReservations] = useState<ReservationAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([boatsApi.getAll(), reservationsApi.getAll()])
      .then(([b, r]) => {
        setBoats(b);
        setReservations(r);
      })
      .catch(() => setError("Impossible de charger vos revenus."))
      .finally(() => setLoading(false));
  }, []);

  const ownedBoatIds = useMemo(
    () => new Set(boats.filter((b) => user?.id != null && b.id_utilisateur === user.id).map((b) => b.id)),
    [boats, user?.id]
  );
  const boatNameById = useMemo(() => new Map(boats.map((b) => [b.id, b.nomBateau])), [boats]);

  const myReservations = useMemo(
    () => reservations.filter((r) => ownedBoatIds.has(r.idBateau)),
    [reservations, ownedBoatIds]
  );

  const revenueReservations = useMemo(
    () => myReservations.filter((r) => libelleToKey(r.statutReservation?.libelle) !== "cancelled"),
    [myReservations]
  );

  const totalGross = revenueReservations.reduce((a, r) => a + r.montantTotal, 0);
  const totalCommission = Math.round(totalGross * COMMISSION_RATE);
  const totalNet = totalGross - totalCommission;
  const netPct = totalGross > 0 ? Math.round((totalNet / totalGross) * 100) : 0;
  const count = revenueReservations.length;
  const avgNet = count > 0 ? Math.round(totalNet / count) : 0;

  const monthly = useMemo(() => {
    const now = new Date();
    const buckets: { key: string; label: string; amount: number }[] = [];
    for (let i = MONTHS_BACK - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleDateString("fr-FR", { month: "short" }),
        amount: 0,
      });
    }
    const byKey = new Map(buckets.map((b) => [b.key, b]));
    for (const r of revenueReservations) {
      const d = new Date(r.dateDebut);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = byKey.get(key);
      if (bucket) bucket.amount += Math.round(r.montantTotal * (1 - COMMISSION_RATE));
    }
    return buckets;
  }, [revenueReservations]);

  const max = Math.max(1, ...monthly.map((m) => m.amount));
  let bestIndex = -1;
  let bestAmount = 0;
  monthly.forEach((m, i) => {
    if (m.amount > bestAmount) {
      bestAmount = m.amount;
      bestIndex = i;
    }
  });
  const prevAmount = bestIndex > 0 ? monthly[bestIndex - 1].amount : 0;
  const growthPct = bestIndex > 0 && prevAmount > 0 ? Math.round(((bestAmount - prevAmount) / prevAmount) * 100) : null;

  const recentTransactions = useMemo(
    () =>
      revenueReservations
        .slice()
        .sort((a, b) => new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime())
        .slice(0, 5),
    [revenueReservations]
  );

  if (loading)
    return (
      <div className="dash-page">
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-2)" }}>Chargement…</div>
      </div>
    );
  if (error)
    return (
      <div className="dash-page">
        <p style={{ color: "var(--red)", padding: "24px" }}>{error}</p>
      </div>
    );

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
          <div className="rv-stat-trend"><i className="fa-solid fa-arrow-trend-up" /> {ownedBoatIds.size} bateau{ownedBoatIds.size !== 1 ? "x" : ""}</div>
        </div>

        <div className="rv-stat-card">
          <div className="rv-stat-top">
            <div className="rv-stat-icon" style={{ background: "#F0FDF4", color: "#10B981" }}><i className="fa-solid fa-calendar-check" /></div>
            <div className="rv-stat-nav"><i className="fa-solid fa-arrow-right" /></div>
          </div>
          <div className="rv-stat-value">{count}</div>
          <div className="rv-stat-label">Locations réalisées</div>
          <div className="rv-stat-trend"><i className="fa-solid fa-arrow-trend-up" /> Hors annulées</div>
        </div>

        <div className="rv-stat-card">
          <div className="rv-stat-top">
            <div className="rv-stat-icon" style={{ background: "#FEF3C7", color: "#D97706" }}><i className="fa-solid fa-chart-line" /></div>
            <div className="rv-stat-nav"><i className="fa-solid fa-arrow-right" /></div>
          </div>
          <div className="rv-stat-value">{avgNet.toLocaleString("fr-FR")} €</div>
          <div className="rv-stat-label">Revenu moyen / location</div>
          <div className="rv-stat-trend"><i className="fa-solid fa-arrow-trend-up" /> Net de commission</div>
        </div>

        <div className="rv-stat-card">
          <div className="rv-stat-top">
            <div className="rv-stat-icon" style={{ background: "#F5F3FF", color: "#8B5CF6" }}><i className="fa-solid fa-percent" /></div>
            <div className="rv-stat-nav"><i className="fa-solid fa-arrow-right" /></div>
          </div>
          <div className="rv-stat-value">{Math.round(COMMISSION_RATE * 100)}%</div>
          <div className="rv-stat-label">Commission SailingLoc</div>
          <div className="rv-stat-trend"><i className="fa-solid fa-check" /> Taux fixe</div>
        </div>
      </div>

      <div className="rv-row rv-row-a">
        <div className="dash-card">
          <div className="dash-card-hd"><h3>Évolution des {MONTHS_BACK} derniers mois</h3></div>
          {count === 0 ? (
            <p style={{ color: "var(--text-2)", padding: "20px 0" }}>Aucune location enregistrée sur vos bateaux pour l'instant.</p>
          ) : (
            <div className="rv-chart">
              {monthly.map((m, i) => (
                <div key={m.key} className="rv-chart-col">
                  {i === bestIndex && growthPct !== null && (
                    <span className="rv-chart-badge">+{growthPct}%</span>
                  )}
                  <div
                    className={`rv-chart-bar ${m.amount > 0 ? "filled" : ""}`}
                    style={{ height: `${m.amount > 0 ? Math.max((m.amount / max) * 160, 6) : 6}px` }}
                    title={`${m.label} : ${m.amount.toLocaleString("fr-FR")} €`}
                  />
                  <span className="rv-chart-month">{m.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rv-dark-card">
          <div className="rv-dark-icon"><i className="fa-solid fa-wallet" /></div>
          <h4>Revenu net cumulé</h4>
          <div className="rv-dark-amount">{totalNet.toLocaleString("fr-FR")} €</div>
          <p>Sur {count} location{count !== 1 ? "s" : ""} au total</p>
          <button className="rv-dark-btn"><i className="fa-solid fa-arrow-right" /> Voir le détail</button>
        </div>
      </div>

      <div className="rv-row rv-row-b">
        <div className="dash-card">
          <div className="dash-card-hd"><h3>Transactions récentes</h3></div>
          {recentTransactions.length === 0 ? (
            <p style={{ color: "var(--text-2)" }}>Aucune transaction pour l'instant.</p>
          ) : (
            <div>
              {recentTransactions.map((r) => {
                const key = libelleToKey(r.statutReservation?.libelle);
                const st = STATUS_LABEL[key];
                const net = Math.round(r.montantTotal * (1 - COMMISSION_RATE));
                const boatName = r.bateau?.nomBateau ?? boatNameById.get(r.idBateau) ?? `Bateau #${r.idBateau}`;
                return (
                  <div key={r.id} className="rv-tx-row">
                    <div className="rv-tx-avatar">{initials(r)}</div>
                    <div className="rv-tx-info">
                      <strong>{renterName(r)}</strong>
                      <span>{boatName} · {fmtDate(r.dateDebut)} – {fmtDate(r.dateFin)}</span>
                    </div>
                    <span className={`badge-status ${st.cls}`}>{st.label}</span>
                    <div className="rv-tx-amount">
                      <strong>{net.toLocaleString("fr-FR")} €</strong>
                      <span>net</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
          <h4>Chiffre d'affaires brut</h4>
          <div className="rv-dark-amount">{totalGross.toLocaleString("fr-FR")} €</div>
          <p>Avant commission SailingLoc</p>
          <button className="rv-dark-btn"><i className="fa-solid fa-money-bill-transfer" /> Demander un virement</button>
        </div>
      </div>
    </div>
  );
}
