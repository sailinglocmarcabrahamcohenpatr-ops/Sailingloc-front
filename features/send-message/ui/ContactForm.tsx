"use client";

import { useRef, useState } from "react";
import { useI18n, LocaleLink as Link } from "@/shared/i18n";
import { isValidEmail } from "@/shared/lib/utils";
import { sendContactMessage } from "../api/contact";
import { ALLOWED_ATTACHMENT_TYPES, MAX_ATTACHMENT_SIZE_BYTES } from "../model/constants";

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
  const [attachment, setAttachment] = useState<File | null>(null);
  const [rgpdAccepted, setRgpdAccepted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setError(null);

    if (!file) {
      setAttachment(null);
      return;
    }
    if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
      setError(t.errFileType);
      e.target.value = "";
      setAttachment(null);
      return;
    }
    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
      setError(t.errFileSize);
      e.target.value = "";
      setAttachment(null);
      return;
    }
    setAttachment(file);
  };

  const handleRemoveFile = () => {
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
    if (!rgpdAccepted) {
      setError(t.errRgpd);
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
      attachment: attachment ?? undefined,
    });

    setLoading(false);

    if (result.success) {
      setSubmitted(true);
    } else if (result.errorKind === "network") {
      setError(t.errNetwork);
    } else if (result.errorKind === "server") {
      setError(t.errServer);
    } else {
      setError(t.formError);
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

        <div className="form-group">
          <label className="form-label" htmlFor="attachment">{t.labelAttachment}</label>
          <div className="form-file">
            <label htmlFor="attachment" className="form-file-btn">
              <i className="fa-solid fa-paperclip" aria-hidden="true" /> {t.attachmentChoose}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              id="attachment"
              name="attachment"
              className="form-file-input"
              accept={ALLOWED_ATTACHMENT_TYPES.join(",")}
              onChange={handleFileChange}
            />
            {attachment && (
              <div className="form-file-preview">
                <i className="fa-solid fa-file" aria-hidden="true" />
                <span className="form-file-name">{attachment.name}</span>
                <button type="button" className="form-file-remove" onClick={handleRemoveFile} aria-label={t.attachmentRemove}>
                  <i className="fa-solid fa-xmark" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
          <p className="form-file-hint">{t.attachmentHint}</p>
        </div>

        {error && (
          <div className="form-error" role="alert">
            <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />{" "}
            {error}
          </div>
        )}

        <div className="form-rgpd">
          <input
            type="checkbox"
            id="rgpd"
            required
            className="form-rgpd-checkbox"
            checked={rgpdAccepted}
            onChange={(e) => setRgpdAccepted(e.target.checked)}
          />
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
