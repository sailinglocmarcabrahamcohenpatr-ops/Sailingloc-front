"use client";

import { useState } from "react";
import { useI18n, LocaleLink as Link } from "@/shared/i18n";
import { isValidEmail } from "@/shared/lib/utils";
import { sendContactMessage } from "../api/contact";

type SubjectId = "resa" | "pay" | "doc" | "assur" | "prop" | "other";

const SUBJECT_ICONS: Record<SubjectId, string> = {
  resa: "fa-sailboat",
  pay: "fa-credit-card",
  doc: "fa-file",
  assur: "fa-shield-halved",
  prop: "fa-anchor",
  other: "fa-ellipsis",
};

const SUBJECT_IDS = Object.keys(SUBJECT_ICONS) as SubjectId[];

export default function ContactForm() {
  const t = useI18n().dict.contactPage;
  const [subject, setSubject] = useState<SubjectId>("resa");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    const firstName = (data.get("firstName") as string).trim();
    const lastName = (data.get("lastName") as string).trim();
    const email = (data.get("email") as string).trim();
    const message = (data.get("message") as string).trim();

    if (!firstName || !lastName || !email || !message) {
      setError(t.errRequiredFields);
      return;
    }
    if (!isValidEmail(email)) {
      setError(t.errEmailInvalid);
      return;
    }

    setLoading(true);

    const result = await sendContactMessage({
      subject,
      firstName,
      lastName,
      email,
      phone: (data.get("phone") as string) || undefined,
      booking: (data.get("booking") as string) || undefined,
      message,
    });

    setLoading(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error ?? t.formError);
    }
  };

  if (submitted) {
    return (
      <div className="contact-form-card">
        <div className="form-success-body">
          <i className="fa-solid fa-circle-check form-success-icon" aria-hidden="true" />
          <h3>{t.successTitle}</h3>
          <p className="form-success-text">{t.successText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-form-card">
      <div className="contact-form-header">
        <h3>
          <i className="fa-solid fa-paper-plane" aria-hidden="true" /> {t.formTitle}
        </h3>
        <p>{t.formSub}</p>
      </div>
      <form className="contact-form-body" onSubmit={handleSubmit} noValidate>
        <div>
          <span className="contact-subject-label">{t.subjectLabel}</span>
          <div className="contact-radios">
            {SUBJECT_IDS.map((id) => (
              <div key={id} className={`contact-radio${subject === id ? " active" : ""}`}>
                <input
                  type="radio"
                  name="subject"
                  id={`subj-${id}`}
                  value={id}
                  checked={subject === id}
                  onChange={() => setSubject(id)}
                />
                <label htmlFor={`subj-${id}`}>
                  <i className={`fa-solid ${SUBJECT_ICONS[id]}`} aria-hidden="true" />{" "}
                  {t.subjectLabels[id]}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label req" htmlFor="firstName">{t.labelFirstName}</label>
            <input type="text" id="firstName" name="firstName" className="form-input" placeholder={t.phFirstName} required maxLength={60} />
          </div>
          <div className="form-group">
            <label className="form-label req" htmlFor="lastName">{t.labelLastName}</label>
            <input type="text" id="lastName" name="lastName" className="form-input" placeholder={t.phLastName} required maxLength={60} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label req" htmlFor="email">{t.labelEmail}</label>
            <input type="email" id="email" name="email" className="form-input" placeholder={t.phEmail} required maxLength={254} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="phone">{t.labelPhone}</label>
            <input type="tel" id="phone" name="phone" className="form-input" placeholder={t.phPhone} maxLength={20} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="booking">{t.labelBooking}</label>
          <input type="text" id="booking" name="booking" className="form-input" placeholder={t.phBooking} maxLength={40} />
        </div>

        <div className="form-group">
          <label className="form-label req" htmlFor="message">{t.labelMessage}</label>
          <textarea id="message" name="message" className="form-input" rows={5} placeholder={t.phMessage} required maxLength={2000} />
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
            {t.rgpdPrefix}
            <Link href="/confidentialite" target="_blank" className="form-rgpd-link">{t.rgpdLink}</Link>
            {t.rgpdSuffix}
          </label>
        </div>

        <button type="submit" className="btn btn-primary form-submit-btn" disabled={loading} aria-busy={loading}>
          {loading ? (
            <><i className="fa-solid fa-circle-notch fa-spin" aria-hidden="true" /> {t.submitLoading}</>
          ) : (
            <><i className="fa-solid fa-paper-plane" aria-hidden="true" /> {t.submitBtn}</>
          )}
        </button>

        <div className="form-footer">
          <div className="form-secure">
            <i className="fa-solid fa-lock" aria-hidden="true" /> {t.formSecure}
          </div>
          <div className="form-footer-links">
            <a href="tel:+33123456789">
              <i className="fa-solid fa-phone" aria-hidden="true" /> {t.callLink}
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
