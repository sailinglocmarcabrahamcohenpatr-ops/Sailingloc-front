"use client";

import { useState } from "react";
import { CONTACT_SUBJECTS } from "../model/constants";
import { sendContactMessage } from "../api/contact";

export default function ContactForm() {
  const [subject, setSubject] = useState("resa");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    const result = await sendContactMessage({
      subject,
      firstName: data.get("firstName") as string,
      lastName: data.get("lastName") as string,
      email: data.get("email") as string,
      phone: (data.get("phone") as string) || undefined,
      booking: (data.get("booking") as string) || undefined,
      message: data.get("message") as string,
    });

    setLoading(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error ?? "Une erreur est survenue.");
    }
  };

  if (submitted) {
    return (
      <div className="contact-form-card">
        <div className="form-success-body">
          <i className="fa-solid fa-circle-check form-success-icon" aria-hidden="true" />
          <h3>Message envoyé !</h3>
          <p className="form-success-text">
            Nous avons bien reçu votre message. Notre équipe vous répondra dans
            les 24-48h ouvrées.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-form-card">
      <div className="contact-form-header">
        <h3>
          <i className="fa-solid fa-paper-plane" aria-hidden="true" /> Envoyez-nous
          un message
        </h3>
        <p>Nous vous répondrons dans les meilleurs délais</p>
      </div>
      <form className="contact-form-body" onSubmit={handleSubmit} noValidate>
        <div>
          <span className="contact-subject-label">Sujet de votre message</span>
          <div className="contact-radios">
            {CONTACT_SUBJECTS.map((s) => (
              <div
                key={s.id}
                className={`contact-radio${subject === s.id ? " active" : ""}`}
              >
                <input
                  type="radio"
                  name="subject"
                  id={`subj-${s.id}`}
                  value={s.id}
                  checked={subject === s.id}
                  onChange={() => setSubject(s.id)}
                />
                <label htmlFor={`subj-${s.id}`}>
                  <i className={`fa-solid ${s.icon}`} aria-hidden="true" />{" "}
                  {s.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label req" htmlFor="firstName">Prénom</label>
            <input type="text" id="firstName" name="firstName" className="form-input" placeholder="ex. Thomas" required />
          </div>
          <div className="form-group">
            <label className="form-label req" htmlFor="lastName">Nom</label>
            <input type="text" id="lastName" name="lastName" className="form-input" placeholder="ex. Martin" required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label req" htmlFor="email">Email</label>
            <input type="email" id="email" name="email" className="form-input" placeholder="thomas@exemple.fr" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="phone">Téléphone</label>
            <input type="tel" id="phone" name="phone" className="form-input" placeholder="06 12 34 56 78" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="booking">N° de réservation (facultatif)</label>
          <input type="text" id="booking" name="booking" className="form-input" placeholder="ex. SL-2025-00124" />
        </div>

        <div className="form-group">
          <label className="form-label req" htmlFor="message">Votre message</label>
          <textarea id="message" name="message" className="form-input" rows={5} placeholder="Décrivez votre demande en détail…" required />
        </div>

        {error && (
          <div className="form-error" role="alert">
            <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />{" "}
            {error}
          </div>
        )}

        <div className="form-rgpd">
          <input type="checkbox" id="rgpd" required className="form-rgpd-checkbox" />
          <label htmlFor="rgpd" className="form-rgpd-label">
            J&apos;accepte que mes données soient traitées conformément à la{" "}
            <a href="#" className="form-rgpd-link">politique de confidentialité</a>{" "}
            de SailingLoc.
          </label>
        </div>

        <button type="submit" className="btn btn-primary form-submit-btn" disabled={loading} aria-busy={loading}>
          {loading ? (
            <><i className="fa-solid fa-circle-notch fa-spin" aria-hidden="true" /> Envoi en cours…</>
          ) : (
            <><i className="fa-solid fa-paper-plane" aria-hidden="true" /> Envoyer mon message</>
          )}
        </button>

        <div className="form-footer">
          <div className="form-secure">
            <i className="fa-solid fa-lock" aria-hidden="true" /> Formulaire sécurisé
          </div>
          <div className="form-footer-links">
            <a href="tel:+33123456789">
              <i className="fa-solid fa-phone" aria-hidden="true" /> Nous appeler
            </a>
            <a href="https://wa.me/33612345678" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-whatsapp" aria-hidden="true" /> WhatsApp
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}
