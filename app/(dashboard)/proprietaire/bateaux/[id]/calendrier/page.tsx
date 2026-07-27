"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { boatsApi, disponibilitesApi } from "@/shared/lib";
import type { BoatAPI, DisponibiliteAPI, ReservationAPI } from "@/shared/lib";

function toDate(iso: string): Date {
  return new Date(iso);
}

function toIsoDay(d: Date): string {
  return d.toISOString().split("T")[0];
}

function fmtFR(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function isCancelled(libelle?: string): boolean {
  return (libelle ?? "").toLowerCase().includes("annul");
}

// Même mapping que dans "Mes bateaux" : un bateau encore en attente de validation
// n'est pas approuvé, le calendrier ne doit pas lui être accessible.
const PENDING_STATUTS = new Set(["en_attente", "en attente de validation"]);
function isPending(statut: string): boolean {
  return PENDING_STATUTS.has(statut);
}

export default function OwnerBoatCalendarPage() {
  const params = useParams<{ id: string }>();
  const boatId = params.id;

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
      .catch(() => setError("Impossible de charger le calendrier de ce bateau."))
      .finally(() => setLoading(false));
  }, [boatId]);

  useEffect(() => { load(); }, [load]);

  const bookedRanges = useMemo(
    () =>
      reservations
        .filter((r) => !isCancelled(r.statutReservation?.libelle))
        .map((r) => ({ from: toDate(r.dateDebut), to: toDate(r.dateFin) })),
    [reservations],
  );

  const openRanges = useMemo(
    () =>
      dispos.map((d) => ({ from: toDate(d.dateDebut), to: toDate(d.dateFin ?? d.dateDebut) })),
    [dispos],
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
      setActionError("Impossible d'ouvrir cette période. Réessayez.");
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
      setActionError("Impossible de retirer cette période. Réessayez.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dash-page">
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-2)" }}>Chargement…</div>
      </div>
    );
  }

  if (error || !boat) {
    return (
      <div className="dash-page">
        <p style={{ color: "var(--red)", padding: "24px" }}>{error || "Bateau introuvable."}</p>
      </div>
    );
  }

  if (isPending(boat.statut)) {
    return (
      <div className="dash-page">
        <div className="dash-page-hd">
          <div>
            <Link href="/proprietaire/bateaux" className="cal-back-link">
              <i className="fa-solid fa-arrow-left" /> Mes bateaux
            </Link>
            <h1 className="dash-title">Calendrier — {boat.nomBateau}</h1>
          </div>
        </div>
        <p style={{ color: "var(--text-2)", padding: "24px" }}>
          <i className="fa-solid fa-hourglass-half" /> Ce bateau est en attente de validation par
          l&apos;administrateur. Le calendrier de disponibilités sera accessible dès que votre
          annonce sera approuvée.
        </p>
      </div>
    );
  }

  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <Link href="/proprietaire/bateaux" className="cal-back-link">
            <i className="fa-solid fa-arrow-left" /> Mes bateaux
          </Link>
          <h1 className="dash-title">Calendrier — {boat.nomBateau}</h1>
          <p className="dash-sub">Choisissez les périodes où votre bateau est ouvert à la location.</p>
        </div>
        <Link href={`/bateaux/${boat.id}`} target="_blank" rel="noopener" className="btn btn-outline">
          <i className="fa-solid fa-eye" /> Voir l&apos;annonce
        </Link>
      </div>

      <div className="owner-calendar-layout">
        <div className="owner-calendar-main">
          <div className="cal-legend">
            <span><i className="cal-dot cal-dot-open" /> Ouvert à la location</span>
            <span><i className="cal-dot cal-dot-booked" /> Réservé</span>
            <span><i className="cal-dot cal-dot-closed" /> Fermé</span>
          </div>

          <Calendar
            mode="range"
            selected={pending}
            onSelect={setPending}
            numberOfMonths={2}
            disabled={{ before: today }}
            modifiers={{ open: openRanges, booked: bookedRanges }}
            modifiersClassNames={{ open: "rdp-day-open", booked: "rdp-day-booked" }}
          />

          <div className="cal-actions">
            {actionError && <p className="cal-action-error">{actionError}</p>}
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleOpenRange}
              disabled={!pending?.from || !pending?.to || saving}
            >
              {saving ? (
                <><i className="fa-solid fa-circle-notch fa-spin" /> Enregistrement…</>
              ) : (
                <><i className="fa-solid fa-lock-open" /> Ouvrir cette période à la location</>
              )}
            </button>
          </div>
        </div>

        <aside className="owner-calendar-side">
          <div className="cal-side-block">
            <h3>Périodes ouvertes ({dispos.length})</h3>
            {dispos.length === 0 ? (
              <p className="cal-empty">
                Aucune période ouverte pour l&apos;instant — le bateau n&apos;apparaît pas comme disponible
                auprès des locataires.
              </p>
            ) : (
              <ul className="cal-period-list">
                {dispos.map((d) => (
                  <li key={d.id}>
                    <span>
                      <i className="fa-solid fa-calendar-day" />
                      {fmtFR(d.dateDebut)}{d.dateFin ? ` → ${fmtFR(d.dateFin)}` : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemove(d.id)}
                      aria-label="Retirer cette période"
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
            <h3>Réservations ({reservations.length})</h3>
            {reservations.length === 0 ? (
              <p className="cal-empty">Aucune réservation pour ce bateau pour l&apos;instant.</p>
            ) : (
              <ul className="cal-period-list">
                {reservations.map((r) => (
                  <li key={r.id}>
                    <span>
                      <i className="fa-solid fa-user" />
                      {fmtFR(r.dateDebut)} → {fmtFR(r.dateFin)}
                      {r.statutReservation?.libelle ? ` · ${r.statutReservation.libelle}` : ""}
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
