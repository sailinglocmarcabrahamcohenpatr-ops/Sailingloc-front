"use client";

import { useEffect, useState } from "react";
import { ownerRequestsApi } from "@/shared/lib";
import type { OwnerRequestAPI, OwnerType } from "@/shared/lib";
import { sendOwnerRequest } from "../api/request";

const STATUS_META: Record<OwnerRequestAPI["status"], { icon: string; title: string; text: string }> = {
  pending: {
    icon: "fa-clock",
    title: "Demande en cours d'examen",
    text: "Votre demande d'accès à l'espace propriétaire a bien été transmise. Notre équipe l'examine sous 48h ouvrées.",
  },
  approved: {
    icon: "fa-circle-check",
    title: "Demande approuvée !",
    text: "Votre compte a été promu propriétaire. Déconnectez-vous puis reconnectez-vous pour accéder à votre espace propriétaire.",
  },
  rejected: {
    icon: "fa-circle-xmark",
    title: "Demande refusée",
    text: "Votre demande n'a pas été retenue. Vous pouvez en soumettre une nouvelle ci-dessous.",
  },
};

const emptyForm = {
  ownerType: "particulier" as OwnerType,
  phone: "",
  address: "",
  city: "",
  postalCode: "",
  country: "France",
  companyName: "",
  siret: "",
  vatNumber: "",
};

export default function BecomeOwnerForm() {
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [lastRequest, setLastRequest] = useState<OwnerRequestAPI | null>(null);
  const [ownerType, setOwnerType] = useState<OwnerType>("particulier");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<OwnerRequestAPI | null>(null);

  useEffect(() => {
    ownerRequestsApi
      .getAll()
      .then((requests) => {
        const mostRecent = [...requests].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        setLastRequest(mostRecent ?? null);
      })
      .catch(() => setLastRequest(null))
      .finally(() => setLoadingStatus(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    const result = await sendOwnerRequest({
      ownerType,
      phone: data.get("phone") as string,
      address: data.get("address") as string,
      city: data.get("city") as string,
      postalCode: data.get("postalCode") as string,
      country: (data.get("country") as string) || "France",
      companyName: (data.get("companyName") as string) || undefined,
      siret: (data.get("siret") as string) || undefined,
      vatNumber: (data.get("vatNumber") as string) || undefined,
    });

    setLoading(false);

    if (result.success && result.request) {
      setSubmitted(result.request);
    } else {
      setError(result.error ?? "Une erreur est survenue.");
    }
  };

  if (loadingStatus) return null;

  const active = submitted ?? (lastRequest?.status === "pending" || lastRequest?.status === "approved" ? lastRequest : null);

  if (active) {
    const meta = STATUS_META[active.status];
    return (
      <div className="contact-form-card">
        <div className="form-success-body">
          <i className={`fa-solid ${meta.icon} form-success-icon`} aria-hidden="true" />
          <h3>{meta.title}</h3>
          <p className="form-success-text">{meta.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-form-card">
      <div className="contact-form-header">
        <h3>
          <i className="fa-solid fa-sailboat" aria-hidden="true" /> Devenir
          propriétaire sur SailingLoc
        </h3>
        <p>
          Renseignez vos informations : notre équipe étudie chaque demande
          avant d&apos;ouvrir l&apos;accès à l&apos;espace propriétaire.
        </p>
      </div>

      {lastRequest?.status === "rejected" && lastRequest.adminComment && (
        <div className="docs-info-banner" style={{ margin: "0 24px 20px" }}>
          <i className="fa-solid fa-circle-info" />
          <div>
            <strong>Votre précédente demande a été refusée</strong>
            <p>{lastRequest.adminComment}</p>
          </div>
        </div>
      )}

      <form className="contact-form-body" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <span className="contact-subject-label">Type de compte</span>
          <div className="contact-radios">
            {(["particulier", "professionnel"] as OwnerType[]).map((t) => (
              <div key={t} className={`contact-radio${ownerType === t ? " active" : ""}`}>
                <input
                  type="radio"
                  name="ownerType"
                  id={`owner-type-${t}`}
                  value={t}
                  checked={ownerType === t}
                  onChange={() => setOwnerType(t)}
                />
                <label htmlFor={`owner-type-${t}`}>
                  <i className={`fa-solid ${t === "particulier" ? "fa-user" : "fa-building"}`} aria-hidden="true" />{" "}
                  {t === "particulier" ? "Particulier" : "Professionnel"}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label req" htmlFor="phone">Téléphone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="form-input"
              defaultValue={emptyForm.phone}
              placeholder="06 12 34 56 78"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label req" htmlFor="city">Ville</label>
            <input type="text" id="city" name="city" className="form-input" placeholder="ex. Marseille" required />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label req" htmlFor="address">Adresse</label>
          <input type="text" id="address" name="address" className="form-input" placeholder="12 rue de la Mer" required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label req" htmlFor="postalCode">Code postal</label>
            <input type="text" id="postalCode" name="postalCode" className="form-input" placeholder="13001" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="country">Pays</label>
            <input type="text" id="country" name="country" className="form-input" defaultValue="France" />
          </div>
        </div>

        {ownerType === "professionnel" && (
          <>
            <div className="form-group">
              <label className="form-label req" htmlFor="companyName">Raison sociale</label>
              <input type="text" id="companyName" name="companyName" className="form-input" placeholder="Nom de l'entreprise" required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="siret">SIRET</label>
                <input type="text" id="siret" name="siret" className="form-input" placeholder="123 456 789 00012" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="vatNumber">N° TVA intracommunautaire</label>
                <input type="text" id="vatNumber" name="vatNumber" className="form-input" placeholder="FR12345678900" />
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="form-error" role="alert">
            <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />{" "}
            {error}
          </div>
        )}

        <div className="form-rgpd">
          <input type="checkbox" id="owner-terms" required className="form-rgpd-checkbox" />
          <label htmlFor="owner-terms" className="form-rgpd-label">
            J&apos;accepte les{" "}
            <a href="#" className="form-rgpd-link">conditions propriétaires</a>{" "}
            de SailingLoc et certifie que les informations fournies sont exactes.
          </label>
        </div>

        <button type="submit" className="btn btn-primary form-submit-btn" disabled={loading} aria-busy={loading}>
          {loading ? (
            <><i className="fa-solid fa-circle-notch fa-spin" aria-hidden="true" /> Envoi en cours…</>
          ) : (
            <><i className="fa-solid fa-paper-plane" aria-hidden="true" /> Envoyer ma demande</>
          )}
        </button>
      </form>
    </div>
  );
}
