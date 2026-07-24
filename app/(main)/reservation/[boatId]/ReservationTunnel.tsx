"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth, reservationsApi, referentielsApi } from "@/shared/lib";
import { formatPrice, calculateBookingTotal } from "@/shared/lib/utils";
import type { Boat } from "@/entities/boat";
import { getBoatImageUrl } from "@/entities/boat";
import "./reservation.css";

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

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

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
    }
  }, [mounted, user, router]);

  const days = daysBetween(initialStartDate, initialEndDate);
  const { subtotal, serviceFee, total } = calculateBookingTotal(boat.pricePerDay, days);
  const imgSrc = getBoatImageUrl(boat, 800, 500, "main");

  const handlePay = async () => {
    if (!user?.id) {
      setPayError("Impossible d'identifier votre compte. Reconnectez-vous et réessayez.");
      return;
    }
    setPaying(true);
    setPayError("");
    const ref = "SL-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
      // Enregistre réellement la réservation côté API pour qu'elle apparaisse
      // dans les calendriers et tableaux de bord propriétaire/locataire.
      const statuts = await referentielsApi.getStatutsReservations();
      const pendingStatus =
        statuts.find((s) => s.libelle.toLowerCase().includes("attente")) ?? statuts[0];
      if (!pendingStatus) throw new Error("Statut de réservation indisponible");

      await reservationsApi.create({
        date_debut: initialStartDate,
        date_fin: initialEndDate,
        montant_total: total,
        id_bateau: Number(boat.id),
        id_utilisateur: user.id,
        id_statut_reservation: pendingStatus.id,
      });
    } catch {
      setPaying(false);
      setPayError("La réservation n'a pas pu être enregistrée. Réessayez dans un instant.");
      return;
    }

    // Envoi email de confirmation (fire-and-forget — ne bloque pas la redirection)
    fetch("/api/reservation/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user!.email,
        firstName,
        lastName,
        phone,
        boatName: boat.name,
        boatLocation: boat.location,
        startDate: initialStartDate,
        endDate: initialEndDate,
        guests: initialGuests,
        days,
        pricePerDay: boat.pricePerDay,
        subtotal,
        serviceFee,
        total,
        ref,
      }),
    }).catch(() => {});

    await new Promise((r) => setTimeout(r, 1200));
    router.push(
      `/reservation/${boat.id}/confirmation?ref=${ref}&total=${total}&startDate=${initialStartDate}&endDate=${initialEndDate}&guests=${initialGuests}&boat=${encodeURIComponent(boat.name)}`
    );
  };

  if (!mounted || !user) {
    return (
      <div className="res-loading">
        <i className="fa-solid fa-circle-notch fa-spin" aria-hidden="true" />
      </div>
    );
  }

  const canProceedStep2 = firstName.trim() !== "" && lastName.trim() !== "" && phone.trim() !== "";
  const canPay = agreed && cardNumber.trim() !== "" && expiry.trim() !== "" && cvv.trim() !== "" && cardName.trim() !== "";

  const payBlockers = [
    !cardName.trim() && "Titulaire de la carte",
    !cardNumber.trim() && "Numéro de carte",
    !expiry.trim() && "Date d'expiration",
    !cvv.trim() && "Code de sécurité",
    !agreed && "Acceptation des conditions générales",
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
                  />
                </div>

                <div className="res-cta-row">
                  <button className="res-back-btn" type="button" onClick={() => setStep(1)}>
                    <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Retour
                  </button>
                  <button
                    className="btn btn-primary btn-lg"
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!canProceedStep2}
                  >
                    Continuer vers le paiement
                    <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="res-card">
                <h1 className="res-card-title">Paiement sécurisé</h1>
                <p className="res-card-sub">Vos données bancaires sont chiffrées et protégées par SSL 256 bits</p>

                <div className="payment-cards" aria-label="Moyens de paiement acceptés">
                  <div className="payment-card-icon payment-card-visa">VISA</div>
                  <div className="payment-card-icon payment-card-mc">MC</div>
                  <div className="payment-card-icon">AMEX</div>
                  <div className="payment-card-icon">CB</div>
                  <div className="payment-card-icon">
                    <i className="fa-brands fa-apple-pay" aria-hidden="true" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="res-cardname">
                    Titulaire de la carte <span className="res-required">*</span>
                  </label>
                  <input
                    id="res-cardname"
                    type="text"
                    className="form-input"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="NOM PRÉNOM (tel qu'il apparaît sur la carte)"
                    autoComplete="cc-name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="res-cardnum">
                    Numéro de carte <span className="res-required">*</span>
                  </label>
                  <div className="res-card-number-wrap">
                    <input
                      id="res-cardnum"
                      type="text"
                      className="form-input"
                      value={cardNumber}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                        setCardNumber(v.replace(/(.{4})/g, "$1 ").trim());
                      }}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      autoComplete="cc-number"
                      inputMode="numeric"
                      required
                    />
                    <i className="fa-regular fa-credit-card card-brand-icon" aria-hidden="true" />
                  </div>
                </div>

                <div className="res-form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="res-expiry">
                      Date d&apos;expiration <span className="res-required">*</span>
                    </label>
                    <input
                      id="res-expiry"
                      type="text"
                      className="form-input"
                      value={expiry}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                        if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
                        setExpiry(v);
                      }}
                      placeholder="MM/AA"
                      maxLength={5}
                      autoComplete="cc-exp"
                      inputMode="numeric"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="res-cvv">
                      Code de sécurité <span className="res-required">*</span>{" "}
                      <span className="res-optional">CVV</span>
                    </label>
                    <input
                      id="res-cvv"
                      type="text"
                      className="form-input"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="•••"
                      maxLength={4}
                      autoComplete="cc-csc"
                      inputMode="numeric"
                      required
                    />
                  </div>
                </div>

                <div className="res-caution-box">
                  <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
                  <div>
                    <strong>Caution de 5 000 €</strong>
                    <span>
                      Une empreinte bancaire sera prise à titre de caution. Aucun montant ne sera débité si le bateau est rendu en bon état dans les délais convenus.
                    </span>
                  </div>
                </div>

                <label className="res-terms">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <span>
                    J&apos;ai lu et j&apos;accepte les{" "}
                    <a href="#" onClick={(e) => e.preventDefault()}>conditions générales de location</a>{" "}
                    et la{" "}
                    <a href="#" onClick={(e) => e.preventDefault()}>politique d&apos;annulation</a>{" "}
                    de SailingLoc.
                  </span>
                </label>

                <div className="res-cta-row">
                  <button className="res-back-btn" type="button" onClick={() => setStep(2)}>
                    <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Retour
                  </button>
                  <button
                    className="btn btn-primary btn-lg"
                    type="button"
                    onClick={handlePay}
                    disabled={paying || !canPay}
                    style={paying || !canPay ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
                  >
                    {paying ? (
                      <>
                        <i className="fa-solid fa-circle-notch fa-spin" aria-hidden="true" />
                        Traitement en cours…
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-lock" aria-hidden="true" />
                        Confirmer et payer {formatPrice(total)}
                      </>
                    )}
                  </button>
                </div>

                {!canPay && payBlockers.length > 0 && (
                  <div style={{ marginTop: "12px", padding: "12px 16px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", fontSize: ".8125rem", color: "#DC2626" }}>
                    <i className="fa-solid fa-circle-exclamation" style={{ marginRight: "7px" }} aria-hidden="true" />
                    Champ{payBlockers.length > 1 ? "s" : ""} manquant{payBlockers.length > 1 ? "s" : ""} : {payBlockers.join(", ")}
                  </div>
                )}

                {payError && (
                  <div style={{ marginTop: "12px", padding: "12px 16px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", fontSize: ".8125rem", color: "#DC2626" }}>
                    <i className="fa-solid fa-circle-exclamation" style={{ marginRight: "7px" }} aria-hidden="true" />
                    {payError}
                  </div>
                )}

                <p className="res-ssl-note">
                  <i className="fa-solid fa-shield-halved" aria-hidden="true" />
                  Paiement sécurisé par chiffrement SSL 256 bits
                </p>
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
