import type { Metadata } from "next";

export const metadata: Metadata = { title: "Gestion des réservations" };

type ReservationStatus = "confirmed" | "pending" | "completed" | "cancelled";

type Reservation = { id: string; renter: string; renterInitial: string; boat: string; start: string; end: string; guests: number; days: number; total: number; status: ReservationStatus; message: string };

const RESERVATIONS: Reservation[] = [
  { id: "r1", renter: "Sophie M.", renterInitial: "SM", boat: "Sun Odyssey 440", start: "2025-07-10", end: "2025-07-17", guests: 4, days: 7, total: 6230, status: "confirmed", message: "Nous avons hâte ! Est-il possible d'embarquer à 16h ?" },
  { id: "r2", renter: "Julien B.", renterInitial: "JB", boat: "Leopard 45", start: "2025-07-20", end: "2025-07-27", guests: 6, days: 7, total: 11550, status: "pending", message: "Bonjour, groupe de 6 navigateurs expérimentés." },
  { id: "r3", renter: "Isabelle R.", renterInitial: "IR", boat: "Sun Odyssey 440", start: "2025-08-03", end: "2025-08-10", guests: 3, days: 7, total: 6230, status: "confirmed", message: "" },
  { id: "r4", renter: "Pierre L.", renterInitial: "PL", boat: "Leopard 45", start: "2025-08-15", end: "2025-08-22", guests: 8, days: 7, total: 11550, status: "pending", message: "Voyage de lune de miel, avez-vous une décoration possible ?" },
  { id: "r5", renter: "Marie T.", renterInitial: "MT", boat: "Sun Odyssey 440", start: "2025-06-01", end: "2025-06-08", guests: 4, days: 7, total: 6230, status: "completed", message: "" },
];

const STATUS = {
  confirmed: { label: "Confirmée", cls: "badge-status green" },
  pending: { label: "En attente", cls: "badge-status orange" },
  cancelled: { label: "Annulée", cls: "badge-status red" },
  completed: { label: "Terminée", cls: "badge-status grey" },
};

const fmt = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

export default function OwnerReservationsPage() {
  const pending = RESERVATIONS.filter((r) => r.status === "pending");
  const active = RESERVATIONS.filter((r) => r.status === "confirmed");
  const past = RESERVATIONS.filter((r) => r.status === "completed" || r.status === "cancelled");

  const Section = ({ title, items }: { title: string; items: typeof RESERVATIONS }) => (
    items.length > 0 ? (
      <div>
        <h3 className="dash-section-title">{title} <span>({items.length})</span></h3>
        <div className="reservations-list">
          {items.map((r) => (
            <div key={r.id} className="reservation-row">
              <div className="reservation-renter">
                <div className="reservation-avatar">{r.renterInitial}</div>
                <div>
                  <strong>{r.renter}</strong>
                  <span>{r.boat}</span>
                </div>
              </div>
              <div className="reservation-dates">
                <i className="fa-regular fa-calendar" />
                {fmt(r.start)} → {fmt(r.end)} · {r.days} jours · {r.guests} pers.
              </div>
              <div className="reservation-amount">
                <strong>{r.total.toLocaleString("fr-FR")} €</strong>
                <span className={STATUS[r.status].cls}>{STATUS[r.status].label}</span>
              </div>
              <div className="reservation-actions">
                {r.status === "pending" && (
                  <>
                    <button className="btn btn-primary btn-sm"><i className="fa-solid fa-check" /> Confirmer</button>
                    <button className="btn btn-outline btn-sm"><i className="fa-solid fa-xmark" /> Refuser</button>
                  </>
                )}
                {r.message && (
                  <button className="btn btn-ghost btn-sm">
                    <i className="fa-solid fa-envelope" /> Message
                  </button>
                )}
                {r.status === "confirmed" && (
                  <button className="btn btn-ghost btn-sm"><i className="fa-solid fa-ellipsis" /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : null
  );

  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div>
          <h1 className="dash-title">Réservations</h1>
          <p className="dash-sub">{RESERVATIONS.length} réservation{RESERVATIONS.length > 1 ? "s" : ""} au total</p>
        </div>
      </div>
      <Section title="En attente de confirmation" items={pending} />
      <Section title="Réservations confirmées" items={active} />
      <Section title="Historique" items={past} />
    </div>
  );
}
