"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { boatsApi, reservationsApi, useAuth, generateOwnerRevenueReportPdf } from "@/shared/lib";
import type { BoatAPI, ReservationAPI } from "@/shared/lib";
import { useI18n } from "@/shared/i18n";
import "./revenue.css";

const COMMISSION_RATE = 0.15;
const MONTHS_BACK = 6;

type BadgeKey = "confirmed" | "pending" | "cancelled" | "completed";

function libelleToKey(libelle?: string): BadgeKey {
  if (!libelle) return "pending";
  const l = libelle.toLowerCase();
  if (l.includes("confirm")) return "confirmed";
  if (l.includes("attente")) return "pending";
  if (l.includes("annul")) return "cancelled";
  if (l.includes("termin")) return "completed";
  return "pending";
}

function initials(r: ReservationAPI): string {
  const u = r.utilisateur;
  if (!u) return "?";
  return ((u.prenom?.[0] ?? "") + (u.nom?.[0] ?? "")).toUpperCase() || "?";
}

const fmtDate = (d: string, locale: string) =>
  new Date(d).toLocaleDateString(locale, { day: "numeric", month: "short" });

const fmtDateLong = (d: string, locale: string) =>
  new Date(d).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });

export default function OwnerRevenuePage() {
  const { user } = useAuth();
  const t = useI18n().dict.ownerRevenuePage;

  const STATUS_LABEL: Record<BadgeKey, { label: string; cls: string }> = {
    confirmed: { label: t.statusConfirmed, cls: "green" },
    pending:   { label: t.statusPending,   cls: "orange" },
    cancelled: { label: t.statusCancelled, cls: "red" },
    completed: { label: t.statusCompleted, cls: "grey" },
  };

  function renterName(r: ReservationAPI): string {
    const u = r.utilisateur;
    if (!u) return t.reservationFallback.replace("{id}", String(r.id));
    return `${u.prenom} ${u.nom}`.trim();
  }
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
      .catch(() => setError(t.errLoad))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ownedBoatIds = useMemo(
    () =>
      new Set(
        boats
          .filter((b) => user?.email != null && (b.proprietaire?.email ?? b.utilisateur?.email) === user.email)
          .map((b) => b.id)
      ),
    [boats, user]
  );
  const boatNameById = useMemo(() => new Map(boats.map((b) => [b.id, b.nomBateau])), [boats]);

  const myReservations = useMemo(
    () => reservations.filter((r) => r.bateau?.id != null && ownedBoatIds.has(r.bateau.id)),
    [reservations, ownedBoatIds]
  );

  const revenueReservations = useMemo(
    () =>
      myReservations.filter((r) => {
        const key = libelleToKey(r.statutReservation);
        return key === "confirmed" || key === "completed";
      }),
    [myReservations]
  );

  const totalGross = revenueReservations.reduce((a, r) => a + Number(r.montantTotal), 0);
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
        label: d.toLocaleDateString(t.intlLocale, { month: "short" }),
        amount: 0,
      });
    }
    const byKey = new Map(buckets.map((b) => [b.key, b]));
    for (const r of revenueReservations) {
      const d = new Date(r.dateDebut);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = byKey.get(key);
      if (bucket) bucket.amount += Math.round(Number(r.montantTotal) * (1 - COMMISSION_RATE));
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

  const handleExportPdf = useCallback(() => {
    const sorted = revenueReservations
      .slice()
      .sort((a, b) => new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime());

    const rows = sorted.map((r) => {
      const key = libelleToKey(r.statutReservation);
      const boatName =
        r.bateau?.nomBateau ??
        (r.bateau?.id != null ? boatNameById.get(r.bateau.id) : undefined) ??
        t.boatFallback.replace("{id}", String(r.bateau?.id ?? r.id));
      const gross = Number(r.montantTotal);
      const commission = Math.round(gross * COMMISSION_RATE);
      const net = gross - commission;
      return {
        renterName: renterName(r),
        boatName,
        period: `${fmtDateLong(r.dateDebut, t.intlLocale)} - ${fmtDateLong(r.dateFin, t.intlLocale)}`,
        statusLabel: STATUS_LABEL[key].label,
        gross,
        commission,
        net,
      };
    });

    void generateOwnerRevenueReportPdf(
      rows,
      {
        totalNet,
        totalGross,
        totalCommission,
        commissionRatePct: Math.round(COMMISSION_RATE * 100),
        count,
        avgNet,
        boatsCount: ownedBoatIds.size,
      },
      { name: user?.name, email: user?.email }
    );
  }, [avgNet, boatNameById, count, ownedBoatIds.size, revenueReservations, totalCommission, totalGross, totalNet, user?.email, user?.name]);

  if (loading)
    return (
      <div className="dash-page">
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-2)" }}>{t.loading}</div>
      </div>
    );
  if (error)
    return (
      <div className="dash-page">
        <p style={{ color: "var(--red)", padding: "24px" }}>{error}</p>
      </div>
    );

  const boatCountLabel = ownedBoatIds.size === 1 ? t.boatSingular : t.boatPlural;
  const bookingsLabel = (count === 1 ? t.onBookingsSingular : t.onBookingsPlural).replace("{n}", String(count));

  return (
    <div className="rv-page">
      <div className="rv-header">
        <div>
          <h1>{t.title}</h1>
          <p>{t.sub}</p>
        </div>
        <button className="btn-rv-outline" onClick={handleExportPdf} disabled={count === 0}>
          <i className="fa-solid fa-download" /> {t.exportPdf}
        </button>
      </div>

      <div className="rv-stats-grid">
        <div className="rv-stat-card rv-hero">
          <div className="rv-stat-top">
            <div className="rv-stat-icon"><i className="fa-solid fa-sack-dollar" /></div>
            <div className="rv-stat-nav"><i className="fa-solid fa-arrow-right" /></div>
          </div>
          <div className="rv-stat-value">{totalNet.toLocaleString(t.intlLocale)} €</div>
          <div className="rv-stat-label">{t.statNetRevenue}</div>
          <div className="rv-stat-trend"><i className="fa-solid fa-arrow-trend-up" /> {ownedBoatIds.size} {boatCountLabel}</div>
        </div>

        <div className="rv-stat-card">
          <div className="rv-stat-top">
            <div className="rv-stat-icon" style={{ background: "#F0FDF4", color: "#10B981" }}><i className="fa-solid fa-calendar-check" /></div>
            <div className="rv-stat-nav"><i className="fa-solid fa-arrow-right" /></div>
          </div>
          <div className="rv-stat-value">{count}</div>
          <div className="rv-stat-label">{t.statBookingsDone}</div>
          <div className="rv-stat-trend"><i className="fa-solid fa-arrow-trend-up" /> {t.excludingCancelled}</div>
        </div>

        <div className="rv-stat-card">
          <div className="rv-stat-top">
            <div className="rv-stat-icon" style={{ background: "#FEF3C7", color: "#D97706" }}><i className="fa-solid fa-chart-line" /></div>
            <div className="rv-stat-nav"><i className="fa-solid fa-arrow-right" /></div>
          </div>
          <div className="rv-stat-value">{avgNet.toLocaleString(t.intlLocale)} €</div>
          <div className="rv-stat-label">{t.statAvgRevenue}</div>
          <div className="rv-stat-trend"><i className="fa-solid fa-arrow-trend-up" /> {t.netOfCommission}</div>
        </div>

        <div className="rv-stat-card">
          <div className="rv-stat-top">
            <div className="rv-stat-icon" style={{ background: "#F5F3FF", color: "#8B5CF6" }}><i className="fa-solid fa-percent" /></div>
            <div className="rv-stat-nav"><i className="fa-solid fa-arrow-right" /></div>
          </div>
          <div className="rv-stat-value">{Math.round(COMMISSION_RATE * 100)}%</div>
          <div className="rv-stat-label">{t.statCommission}</div>
          <div className="rv-stat-trend"><i className="fa-solid fa-check" /> {t.fixedRate}</div>
        </div>
      </div>

      <div className="rv-row rv-row-a">
        <div className="dash-card">
          <div className="dash-card-hd"><h3>{t.evolutionTitle.replace("{n}", String(MONTHS_BACK))}</h3></div>
          {count === 0 ? (
            <p style={{ color: "var(--text-2)", padding: "20px 0" }}>{t.noBookingsYet}</p>
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
                    title={`${m.label} : ${m.amount.toLocaleString(t.intlLocale)} €`}
                  />
                  <span className="rv-chart-month">{m.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rv-dark-card">
          <div className="rv-dark-icon"><i className="fa-solid fa-wallet" /></div>
          <h4>{t.netRevenueCumulated}</h4>
          <div className="rv-dark-amount">{totalNet.toLocaleString(t.intlLocale)} €</div>
          <p>{bookingsLabel}</p>
          <Link href="/proprietaire/reservations" className="rv-dark-btn">
            <i className="fa-solid fa-arrow-right" /> {t.seeDetail}
          </Link>
        </div>
      </div>

      <div className="rv-row rv-row-b">
        <div className="dash-card">
          <div className="dash-card-hd"><h3>{t.recentTransactions}</h3></div>
          {recentTransactions.length === 0 ? (
            <p style={{ color: "var(--text-2)" }}>{t.noTransactionsYet}</p>
          ) : (
            <div>
              {recentTransactions.map((r) => {
                const key = libelleToKey(r.statutReservation);
                const st = STATUS_LABEL[key];
                const net = Math.round(Number(r.montantTotal) * (1 - COMMISSION_RATE));
                const boatName = r.bateau?.nomBateau ?? (r.bateau?.id != null ? boatNameById.get(r.bateau.id) : undefined) ?? t.boatFallback.replace("{id}", String(r.bateau?.id ?? r.id));
                return (
                  <div key={r.id} className="rv-tx-row">
                    <div className="rv-tx-avatar">{initials(r)}</div>
                    <div className="rv-tx-info">
                      <strong>{renterName(r)}</strong>
                      <span>{boatName} · {fmtDate(r.dateDebut, t.intlLocale)} – {fmtDate(r.dateFin, t.intlLocale)}</span>
                    </div>
                    <span className={`badge-status ${st.cls}`}>{st.label}</span>
                    <div className="rv-tx-amount">
                      <strong>{net.toLocaleString(t.intlLocale)} €</strong>
                      <span>{t.net}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="dash-card">
          <div className="dash-card-hd"><h3>{t.breakdown}</h3></div>
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
                {t.netRevenue} <strong>{totalNet.toLocaleString(t.intlLocale)} €</strong>
              </div>
              <div className="rv-ring-legend-item">
                <span className="rv-ring-dot" style={{ background: "#EDEFEE" }} />
                {t.commission} <strong>{totalCommission.toLocaleString(t.intlLocale)} €</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="rv-dark-card">
          <div className="rv-dark-icon"><i className="fa-solid fa-piggy-bank" /></div>
          <h4>{t.grossRevenue}</h4>
          <div className="rv-dark-amount">{totalGross.toLocaleString(t.intlLocale)} €</div>
          <p>{t.beforeCommission}</p>
          <button className="rv-dark-btn"><i className="fa-solid fa-money-bill-transfer" /> {t.requestTransfer}</button>
        </div>
      </div>
    </div>
  );
}
