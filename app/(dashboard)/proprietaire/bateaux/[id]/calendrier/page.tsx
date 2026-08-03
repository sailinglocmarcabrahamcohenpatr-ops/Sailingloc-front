"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { boatsApi, disponibilitesApi } from "@/shared/lib";
import type { BoatAPI, DisponibiliteAPI, ReservationAPI } from "@/shared/lib";
import { toLocalIsoDate } from "@/shared/lib/utils";
import { useI18n } from "@/shared/i18n";

function toDate(iso: string): Date {
  return new Date(iso);
}

const toIsoDay = toLocalIsoDate;

function fmtFR(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" });
}

function isCancelled(libelle?: string): boolean {
  return (libelle ?? "").toLowerCase().includes("annul");
}

// Même mapping que dans "Mes bateaux" : un bateau qui n'a jamais été approuvé
// (encore en attente, ou refusé par l'admin) n'a pas accès au calendrier.
const PENDING_STATUTS = new Set(["en_attente", "en attente de validation"]);
const REFUSED_STATUTS = new Set(["refusé"]);
function isPending(statut: string): boolean {
  return PENDING_STATUTS.has(statut);
}
function isRefused(statut: string): boolean {
  return REFUSED_STATUTS.has(statut);
}

export default function OwnerBoatCalendarPage() {
  const params = useParams<{ id: string }>();
  const boatId = params.id;
  const t = useI18n().dict.ownerCalendarPage;

  const [boat, setBoat] = useState<BoatAPI | null>(null);
  const [dispos, setDispos] = useState<DisponibiliteAPI[]>([]);
  const [reservations, setReservations] = useState<ReservationAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [pending, setPending] = useState<DateRange | undefined>();
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const load = useCallback(() => {
    // Le sous-endpoint /disponibilites renvoie une sérialisation incomplète
    // côté backend (pas de dateFin) — on lit plutôt le tableau `disponibilites`
    // embarqué dans la fiche bateau, qui est complet.
    Promise.all([boatsApi.getOne(boatId), boatsApi.getReservations(boatId)])
      .then(([b, r]) => {
        setBoat(b);
        setDispos(b.disponibilites ?? []);
        setReservations(r);
      })
      .catch(() => setError(t.errLoad))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boatId]);

  useEffect(() => { load(); }, [load]);

  const bookedRanges = useMemo(
    () =>
      reservations
        .filter((r) => !isCancelled(r.statutReservation))
        .map((r) => ({ from: toDate(r.dateDebut), to: toDate(r.dateFin) })),
    [reservations],
  );

  // Une disponibilité au statut "bloque" est une période que le propriétaire a
  // volontairement fermée (ex. maintenance) — distincte des périodes ouvertes
  // à la location (statut par défaut "disponible").
  const openDispos = useMemo(() => dispos.filter((d) => d.statut !== "bloque"), [dispos]);
  const blockedDispos = useMemo(() => dispos.filter((d) => d.statut === "bloque"), [dispos]);

  const openRanges = useMemo(
    () =>
      openDispos.map((d) => ({ from: toDate(d.dateDebut), to: toDate(d.dateFin ?? d.dateDebut) })),
    [openDispos],
  );

  const blockedRanges = useMemo(
    () =>
      blockedDispos.map((d) => ({ from: toDate(d.dateDebut), to: toDate(d.dateFin ?? d.dateDebut) })),
    [blockedDispos],
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleOpenRange = async () => {
    if (!pending?.from || !pending?.to || !boat) return;
    setSaving(true);
    setActionError("");
    try {
      await disponibilitesApi.create({
        date_debut: toIsoDay(pending.from),
        date_fin: toIsoDay(pending.to),
        id_bateau: boat.id,
      });
      setPending(undefined);
      load();
    } catch {
      setActionError(t.errOpen);
    } finally {
      setSaving(false);
    }
  };

  const handleBlockRange = async () => {
    if (!pending?.from || !pending?.to || !boat) return;
    setSaving(true);
    setActionError("");
    try {
      await disponibilitesApi.create({
        date_debut: toIsoDay(pending.from),
        date_fin: toIsoDay(pending.to),
        id_bateau: boat.id,
        statut: "bloque",
      });
      setPending(undefined);
      load();
    } catch {
      setActionError(t.errBlock);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (dispoId: number) => {
    setSaving(true);
    setActionError("");
    try {
      await disponibilitesApi.delete(dispoId);
      load();
    } catch {
      setActionError(t.errRemove);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dash-page">
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-2)" }}>{t.loading}</div>
      </div>
    );
  }

  if (error || !boat) {
    return (
      <div className="dash-page">
        <p style={{ color: "var(--red)", padding: "24px" }}>{error || t.notFound}</p>
      </div>
    );
  }

  if (isPending(boat.statut) || isRefused(boat.statut)) {
    return (
      <div className="dash-page">
        <div className="dash-page-hd">
          <div>
            <Link href="/proprietaire/bateaux" className="cal-back-link">
              <i className="fa-solid fa-arrow-left" /> {t.backLink}
            </Link>
            <h1 className="dash-title">{t.titlePrefix}{boat.nomBateau}</h1>
          </div>
        </div>
        <p style={{ color: "var(--text-2)", padding: "24px" }}>
          <i className={`fa-solid ${isRefused(boat.statut) ? "fa-circle-xmark" : "fa-hourglass-half"}`} />{" "}
          {isRefused(boat.statut) ? t.refusedText : t.pendingText}
        </p>
      </div>
    );
  }

  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <Link href="/proprietaire/bateaux" className="cal-back-link">
            <i className="fa-solid fa-arrow-left" /> {t.backLink}
          </Link>
          <h1 className="dash-title">{t.titlePrefix}{boat.nomBateau}</h1>
          <p className="dash-sub">{t.sub}</p>
        </div>
        <Link href={`/bateaux/${boat.id}`} target="_blank" rel="noopener" className="btn btn-outline">
          <i className="fa-solid fa-eye" /> {t.viewListing}
        </Link>
      </div>

      <div className="owner-calendar-layout">
        <div className="owner-calendar-main">
          <div className="cal-legend">
            <span><i className="cal-dot cal-dot-open" /> {t.legendOpen}</span>
            <span><i className="cal-dot cal-dot-booked" /> {t.legendBooked}</span>
            <span><i className="cal-dot cal-dot-closed" /> {t.legendClosed}</span>
          </div>

          <Calendar
            mode="range"
            selected={pending}
            onSelect={setPending}
            numberOfMonths={2}
            disabled={{ before: today }}
            modifiers={{ open: openRanges, booked: bookedRanges, blocked: blockedRanges }}
            modifiersClassNames={{ open: "rdp-day-open", booked: "rdp-day-booked", blocked: "rdp-day-blocked" }}
          />

          <div className="cal-actions">
            {actionError && <p className="cal-action-error">{actionError}</p>}
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleBlockRange}
              disabled={!pending?.from || !pending?.to || saving}
            >
              {saving ? (
                <><i className="fa-solid fa-circle-notch fa-spin" /> {t.saving}</>
              ) : (
                <><i className="fa-solid fa-ban" /> {t.blockForMaintenance}</>
              )}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleOpenRange}
              disabled={!pending?.from || !pending?.to || saving}
            >
              {saving ? (
                <><i className="fa-solid fa-circle-notch fa-spin" /> {t.saving}</>
              ) : (
                <><i className="fa-solid fa-lock-open" /> {t.openPeriod}</>
              )}
            </button>
          </div>
        </div>

        <aside className="owner-calendar-side">
          <div className="cal-side-block">
            <h3>{t.openPeriodsTitle.replace("{n}", String(openDispos.length))}</h3>
            {openDispos.length === 0 ? (
              <p className="cal-empty">{t.openPeriodsEmpty}</p>
            ) : (
              <ul className="cal-period-list">
                {openDispos.map((d) => (
                  <li key={d.id}>
                    <span>
                      <i className="fa-solid fa-calendar-day" />
                      {fmtFR(d.dateDebut, t.intlLocale)}{d.dateFin ? ` → ${fmtFR(d.dateFin, t.intlLocale)}` : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemove(d.id)}
                      aria-label={t.removePeriodAria}
                      disabled={saving}
                    >
                      <i className="fa-solid fa-xmark" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="cal-side-block">
            <h3>{t.blockedPeriodsTitle.replace("{n}", String(blockedDispos.length))}</h3>
            {blockedDispos.length === 0 ? (
              <p className="cal-empty">{t.blockedPeriodsEmpty}</p>
            ) : (
              <ul className="cal-period-list">
                {blockedDispos.map((d) => (
                  <li key={d.id}>
                    <span>
                      <i className="fa-solid fa-ban" />
                      {fmtFR(d.dateDebut, t.intlLocale)}{d.dateFin ? ` → ${fmtFR(d.dateFin, t.intlLocale)}` : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemove(d.id)}
                      aria-label={t.unblockPeriodAria}
                      disabled={saving}
                    >
                      <i className="fa-solid fa-xmark" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="cal-side-block">
            <h3>{t.reservationsTitle.replace("{n}", String(reservations.length))}</h3>
            {reservations.length === 0 ? (
              <p className="cal-empty">{t.reservationsEmpty}</p>
            ) : (
              <ul className="cal-period-list">
                {reservations.map((r) => (
                  <li key={r.id}>
                    <span>
                      <i className="fa-solid fa-user" />
                      {fmtFR(r.dateDebut, t.intlLocale)} → {fmtFR(r.dateFin, t.intlLocale)}
                      {r.statutReservation ? ` · ${r.statutReservation}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
