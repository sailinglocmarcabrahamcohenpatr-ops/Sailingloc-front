import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Réservation confirmée — SailingLoc",
};

interface PageProps {
  searchParams: Promise<{
    ref?: string;
    total?: string;
    startDate?: string;
    endDate?: string;
    guests?: string;
    boat?: string;
  }>;
}

function formatDateFR(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatPrice(amount: number): string {
  return amount.toLocaleString("fr-FR") + " €";
}

export default async function ConfirmationPage({ searchParams }: PageProps) {
  const { ref, total, startDate, endDate, guests, boat } = await searchParams;

  const bookingRef = ref ?? "SL-XXXXXX";
  const boatName = boat ? decodeURIComponent(boat) : "votre bateau";
  const nbGuests = parseInt(guests ?? "1") || 1;
  const totalAmount = parseInt(total ?? "0") || 0;

  return (
    <div className="res-confirm-page">
      <div className="container">
        <div className="res-confirm-card">
          <div className="res-confirm-icon" aria-hidden="true">
            <i className="fa-solid fa-check" />
          </div>

          <h1 className="res-confirm-title">Demande envoyée !</h1>
          <p className="res-confirm-sub">
            Votre demande de réservation pour{" "}
            <strong>{boatName}</strong> a bien été reçue. Le propriétaire
            a 24 h pour confirmer. Vous serez notifié par e-mail.
          </p>

          <div className="res-confirm-ref">
            <span>Référence de réservation</span>
            <strong>{bookingRef}</strong>
          </div>

          <div className="res-confirm-details">
            {startDate && (
              <div className="res-confirm-detail-row">
                <i className="fa-solid fa-calendar-day" aria-hidden="true" />
                <span>
                  Du <strong>{formatDateFR(startDate)}</strong> au{" "}
                  <strong>{formatDateFR(endDate ?? "")}</strong>
                </span>
              </div>
            )}
            <div className="res-confirm-detail-row">
              <i className="fa-solid fa-users" aria-hidden="true" />
              <span>
                <strong>{nbGuests} passager{nbGuests > 1 ? "s" : ""}</strong>
              </span>
            </div>
            {totalAmount > 0 && (
              <div className="res-confirm-detail-row">
                <i className="fa-solid fa-receipt" aria-hidden="true" />
                <span>
                  Montant total : <strong>{formatPrice(totalAmount)}</strong>{" "}
                  (prélevé après confirmation du propriétaire)
                </span>
              </div>
            )}
          </div>

          <div className="res-confirm-next">
            <h2 className="res-confirm-next-title">Ce qui se passe maintenant</h2>
            <div className="res-confirm-step-item">
              <div className="res-confirm-step-num" aria-hidden="true">1</div>
              <span>
                Un e-mail de confirmation vous a été envoyé avec tous les détails
                de votre demande.
              </span>
            </div>
            <div className="res-confirm-step-item">
              <div className="res-confirm-step-num" aria-hidden="true">2</div>
              <span>
                Le propriétaire est notifié et confirmera votre demande sous 24 h.
                Votre paiement ne sera encaissé qu&apos;après sa validation.
              </span>
            </div>
            <div className="res-confirm-step-item">
              <div className="res-confirm-step-num" aria-hidden="true">3</div>
              <span>
                Une fois confirmé, vous recevrez les coordonnées exactes du port
                et les instructions de check-in avec le briefing skipper.
              </span>
            </div>
          </div>

          <div className="res-confirm-btns">
            <Link href="/profil/reservations" className="btn btn-primary btn-lg">
              <i className="fa-solid fa-calendar-check" aria-hidden="true" />
              Voir mes réservations
            </Link>
            <Link href="/bateaux" className="btn btn-outline btn-lg">
              <i className="fa-solid fa-sailboat" aria-hidden="true" />
              Explorer d&apos;autres bateaux
            </Link>
          </div>

          <div className="res-confirm-support">
            <i className="fa-solid fa-headset" aria-hidden="true" />
            Une question ?{" "}
            <Link href="/contact">Contactez notre support 7j/7</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
