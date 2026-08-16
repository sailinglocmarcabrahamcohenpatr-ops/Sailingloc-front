"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useAuth, reservationsApi } from "@/shared/lib";
import { getToken } from "@/shared/lib/api-client";
import { formatPrice, calculateBookingTotal } from "@/shared/lib/utils";
import type { Boat } from "@/entities/boat";
import { getBoatImageUrl } from "@/entities/boat";
import StripePaymentForm from "./StripePaymentForm";
import "./reservation.css";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function daysBetween(start: string, end: string): number {
  const diff = Math.ceil(
    (new Date(end + "T00:00:00").getTime() - new Date(start + "T00:00:00").getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return Math.max(1, diff);
}

function formatDateFR(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const STEPS = [
  { num: 1, label: "Récapitulatif" },
  { num: 2, label: "Coordonnées" },
  { num: 3, label: "Paiement" },
];

interface Props {
  boat: Boat;
  initialStartDate: string;
  initialEndDate: string;
  initialGuests: number;
}

export default function ReservationTunnel({ boat, initialStartDate, initialEndDate, initialGuests }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [requests, setRequests] = useState("");

  const [agreed, setAgreed] = useState(false);

  // Stripe
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [intentLoading, setIntentLoading] = useState(false);
  const [intentError, setIntentError] = useState("");
  const [reservationId, setReservationId] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      const redirect = window.location.pathname + window.location.search;
      router.replace(`/connexion?redirect=${encodeURIComponent(redirect)}`);
    } else {
      const parts = user.name.split(" ");
      setFirstName(parts[0] ?? "");
      setLastName(parts.slice(1).join(" ") ?? "");
      setPhone("+33 6 12 34 56 78");
    }
  }, [mounted, user, router]);

  const days = daysBetween(initialStartDate, initialEndDate);
  const { subtotal, serviceFee, total } = calculateBookingTotal(boat.pricePerDay, days);
  const imgSrc = getBoatImageUrl(boat, 800, 500, "main");

  /** Appelé quand l'utilisateur clique "Continuer vers le paiement" à l'étape 2.
   *  Crée la réservation en DB, puis récupère le client_secret Stripe. */
  const handleProceedToPayment = async () => {
    if (!user?.id) {
      setIntentError("Votre profil n'est pas encore chargé. Rafraîchissez la page et réessayez.");
      return;
    }
    setIntentLoading(true);
    setIntentError("");
    try {
      // 1. Créer la réservation (le backend l'initialise à "en_attente" par défaut)
      const reservation = await reservationsApi.create({
        date_debut: initialStartDate,
        date_fin: initialEndDate,
        montant_total: total,
        id_bateau: Number(boat.id),
        id_utilisateur: user.id,
      });
      setReservationId(reservation.id);
      // 2. Créer le PaymentIntent Stripe
      const token = getToken();
      const res = await fetch("/api/paiements/stripe/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id_reservation: reservation.id }),
      });
      if (!res.ok) throw new Error("Impossible de créer l'intention de paiement");
      const { client_secret } = await res.json() as { client_secret: string };
      setClientSecret(client_secret);
      setStep(3);
    } catch (err) {
      setIntentError(
        err instanceof Error ? err.message : "Une erreur est survenue. Veuillez réessayer."
      );
    } finally {
      setIntentLoading(false);
    }
  };

  if (!mounted || !user) {
    return (
      <div className="res-loading">
        <i className="fa-solid fa-circle-notch fa-spin" aria-hidden="true" />
      </div>
    );
  }

  const canProceedStep2 = firstName.trim() !== "" && lastName.trim() !== "" && phone.trim() !== "";
  const step2Blockers = [
    !firstName.trim() && "Prénom",
    !lastName.trim() && "Nom",
    !phone.trim() && "Téléphone",
  ].filter(Boolean) as string[];
  return (
    <div className="res-page">
      <div className="container">
        <Link href={`/bateaux/${boat.id}`} className="res-back">
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          Retour au bateau
        </Link>

        <div className="res-steps" role="list" aria-label="Étapes de la réservation">
          {STEPS.map((s, idx) => (
            <Fragment key={s.num}>
              <div
                className={`res-step${step === s.num ? " active" : ""}${step > s.num ? " done" : ""}`}
                role="listitem"
                aria-current={step === s.num ? "step" : undefined}
              >
                <div className="res-step-num" aria-hidden="true">
                  {step > s.num ? <i className="fa-solid fa-check" /> : s.num}
                </div>
                <span className="res-step-label">{s.label}</span>
              </div>
              {idx < STEPS.length - 1 && <div className="res-step-sep" aria-hidden="true" />}
            </Fragment>
          ))}
        </div>

        <div className="res-layout">
          <div>
            {step === 1 && (
              <div className="res-card">
                <h1 className="res-card-title">Vérifiez votre réservation</h1>
                <p className="res-card-sub">Confirmez les détails avant de continuer</p>

                <div className="res-boat-recap">
                  <Image
                    src={imgSrc}
                    alt={boat.name}
                    width={80}
                    height={64}
                    unoptimized
                    className="res-boat-recap-img"
                  />
                  <div className="res-boat-recap-info">
                    <strong>{boat.name}</strong>
                    <span>
                      <i className="fa-solid fa-location-dot" aria-hidden="true" />
                      {boat.location}
                    </span>
                    <span>
                      <i className="fa-solid fa-star" aria-hidden="true" />
                      {boat.rating} · {boat.reviewCount} avis
                    </span>
                  </div>
                </div>

                <div className="res-dates-recap">
                  <div className="res-date-box">
                    <label>Arrivée</label>
                    <span>{formatDateFR(initialStartDate)}</span>
                  </div>
                  <div className="res-date-box">
                    <label>Départ</label>
                    <span>{formatDateFR(initialEndDate)}</span>
                  </div>
                </div>
                <div className="res-dates-recap" style={{ gridTemplateColumns: "1fr" }}>
                  <div className="res-date-box">
                    <label>Passagers &amp; durée</label>
                    <span>
                      {initialGuests} personne{initialGuests > 1 ? "s" : ""} · {days} nuit{days > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div className="res-info-box">
                  <i className="fa-solid fa-circle-info" aria-hidden="true" />
                  <span>
                    Vous ne serez débité qu&apos;après confirmation du propriétaire. En cas de refus, vous serez intégralement remboursé sous 3 à 5 jours ouvrés.
                  </span>
                </div>

                <div className="res-cta-row">
                  <span />
                  <button className="btn btn-primary btn-lg" onClick={() => setStep(2)}>
                    Continuer
                    <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="res-card">
                <h1 className="res-card-title">Vos coordonnées</h1>
                <p className="res-card-sub">Renseignez vos informations pour finaliser la réservation</p>

                <div className="res-form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="res-firstname">Prénom <span className="res-required">*</span></label>
                    <input
                      id="res-firstname"
                      type="text"
                      className="form-input"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Votre prénom"
                      autoComplete="given-name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="res-lastname">Nom <span className="res-required">*</span></label>
                    <input
                      id="res-lastname"
                      type="text"
                      className="form-input"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Votre nom"
                      autoComplete="family-name"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="res-email">Adresse e-mail</label>
                  <input
                    id="res-email"
                    type="email"
                    className="form-input res-input-readonly"
                    value={user.email}
                    readOnly
                    aria-readonly="true"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="res-phone">Téléphone <span className="res-required">*</span></label>
                  <input
                    id="res-phone"
                    type="tel"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                    autoComplete="tel"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="res-requests">
                    Demandes particulières{" "}
                    <span className="res-optional">(optionnel)</span>
                  </label>
                  <textarea
                    id="res-requests"
                    className="form-input"
                    rows={3}
                    value={requests}
                    onChange={(e) => setRequests(e.target.value)}
                    placeholder="Heure d'arrivée souhaitée, besoins spécifiques, allergies alimentaires…"
                    style={{ minHeight: "90px" }}
                    maxLength={500}
                  />
                </div>

                <div className="res-cta-row">
                  <button className="res-back-btn" type="button" onClick={() => setStep(1)}>
                    <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Retour
                  </button>
                  <button
                    className="btn btn-primary btn-lg"
                    type="button"
                    onClick={() => {
                      if (!canProceedStep2) {
                        setIntentError(`Champ(s) requis manquant(s) : ${step2Blockers.join(", ")}`);
                        return;
                      }
                      handleProceedToPayment();
                    }}
                    disabled={intentLoading}
                  >
                    {intentLoading ? (
                      <>
                        <i className="fa-solid fa-circle-notch fa-spin" aria-hidden="true" />
                        Préparation du paiement…
                      </>
                    ) : (
                      <>
                        Continuer vers le paiement
                        <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>
                {intentError && (
                  <div style={{ marginTop: "12px", padding: "12px 16px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", fontSize: ".8125rem", color: "#DC2626" }}>
                    <i className="fa-solid fa-circle-exclamation" style={{ marginRight: "7px" }} aria-hidden="true" />
                    {intentError}
                  </div>
                )}
              </div>
            )}

            {step === 3 && clientSecret && (
              <div className="res-card">
                <h1 className="res-card-title">Paiement sécurisé</h1>
                <p className="res-card-sub">Vos données bancaires sont chiffrées et protégées par Stripe</p>

                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: { theme: "stripe" },
                    locale: "fr",
                  }}
                >
                  <StripePaymentForm
                    total={total}
                    deposit={boat.deposit ?? 0}
                    returnUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/reservation/${boat.id}/confirmation?reservationId=${reservationId}&total=${total}&startDate=${initialStartDate}&endDate=${initialEndDate}&guests=${initialGuests}&boat=${encodeURIComponent(boat.name)}`}
                    agreed={agreed}
                    onAgreedChange={setAgreed}
                    onBack={() => setStep(2)}
                    formatPrice={formatPrice}
                  />
                </Elements>
              </div>
            )}
          </div>

          <aside>
            <div className="res-summary-card">
              <Image
                src={imgSrc}
                alt={boat.name}
                width={360}
                height={180}
                className="res-summary-img"
              />
              <div className="res-summary-body">
                <div className="res-summary-boat">{boat.name}</div>
                <div className="res-summary-loc">
                  <i className="fa-solid fa-location-dot" aria-hidden="true" />
                  {boat.location}
                </div>
                <div className="res-summary-rating">
                  <i className="fa-solid fa-star" aria-hidden="true" />
                  {boat.rating} · {boat.reviewCount} avis
                </div>
                <div className="res-summary-divider" />
                <div className="res-summary-row">
                  <span>Arrivée</span>
                  <strong>{formatDateFR(initialStartDate)}</strong>
                </div>
                <div className="res-summary-row">
                  <span>Départ</span>
                  <strong>{formatDateFR(initialEndDate)}</strong>
                </div>
                <div className="res-summary-row">
                  <span>Passagers</span>
                  <strong>
                    {initialGuests} personne{initialGuests > 1 ? "s" : ""}
                  </strong>
                </div>
                <div className="res-summary-divider" />
                <div className="res-summary-row">
                  <span>
                    {formatPrice(boat.pricePerDay)} × {days} nuit{days > 1 ? "s" : ""}
                  </span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>
                <div className="res-summary-row">
                  <span>Frais de service</span>
                  <strong>{formatPrice(serviceFee)}</strong>
                </div>
                <div className="res-summary-row">
                  <span>Assurance</span>
                  <strong className="res-free">Offerte</strong>
                </div>
                <div className="res-summary-total">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="res-summary-secure">
                  <i className="fa-solid fa-lock" aria-hidden="true" />
                  Paiement 100 % sécurisé
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
