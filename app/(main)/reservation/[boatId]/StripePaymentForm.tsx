"use client";

import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

interface Props {
  total: number;
  returnUrl: string;
  agreed: boolean;
  onAgreedChange: (v: boolean) => void;
  onBack: () => void;
  formatPrice: (n: number) => string;
}

export default function StripePaymentForm({
  total,
  returnUrl,
  agreed,
  onAgreedChange,
  onBack,
  formatPrice,
}: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !agreed) return;

    setPaying(true);
    setPayError("");

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
    });

    // confirmPayment redirige automatiquement en cas de succès —
    // on n'arrive ici qu'en cas d'erreur.
    if (error) {
      setPayError(error.message ?? "Le paiement a échoué. Veuillez réessayer.");
    }
    setPaying(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement
        options={{
          layout: "tabs",
          fields: { billingDetails: { name: "auto" } },
        }}
      />

      <div className="res-caution-box" style={{ marginTop: "20px" }}>
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
          onChange={(e) => onAgreedChange(e.target.checked)}
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
        <button className="res-back-btn" type="button" onClick={onBack} disabled={paying}>
          <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Retour
        </button>
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={!stripe || !elements || paying || !agreed}
          style={!stripe || !agreed || paying ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
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

      {payError && (
        <div style={{ marginTop: "12px", padding: "12px 16px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", fontSize: ".8125rem", color: "#DC2626" }}>
          <i className="fa-solid fa-circle-exclamation" style={{ marginRight: "7px" }} aria-hidden="true" />
          {payError}
        </div>
      )}

      <p className="res-ssl-note">
        <i className="fa-solid fa-shield-halved" aria-hidden="true" />
        Paiement sécurisé par Stripe · SSL 256 bits
      </p>
    </form>
  );
}
