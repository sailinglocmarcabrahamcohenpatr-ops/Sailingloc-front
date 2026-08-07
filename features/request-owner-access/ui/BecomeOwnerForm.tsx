"use client";

import { useEffect, useState } from "react";
import { ownerRequestsApi } from "@/shared/lib";
import type { OwnerRequestAPI } from "@/shared/lib";
import { sendOwnerRequest } from "../api/request";
import { useI18n } from "@/shared/i18n";

const emptyForm = {
  phone: "",
  address: "",
  city: "",
  postalCode: "",
  country: "France",
};

export default function BecomeOwnerForm() {
  const t = useI18n().dict.becomeOwnerForm;
  const STATUS_META: Record<OwnerRequestAPI["status"], { icon: string; title: string; text: string }> = {
    pending: { icon: "fa-clock", title: t.statusPendingTitle, text: t.statusPendingText },
    approved: { icon: "fa-circle-check", title: t.statusApprovedTitle, text: t.statusApprovedText },
    rejected: { icon: "fa-circle-xmark", title: t.statusRejectedTitle, text: t.statusRejectedText },
  };
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [lastRequest, setLastRequest] = useState<OwnerRequestAPI | null>(null);
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

    const phone = (data.get("phone") as string).trim();
    const address = (data.get("address") as string).trim();
    const city = (data.get("city") as string).trim();
    const postalCode = (data.get("postalCode") as string).trim();
    const country = ((data.get("country") as string) || "France").trim();

    if (!phone || !address || !city || !postalCode) {
      setLoading(false);
      setError(t.errRequiredFields);
      return;
    }

    const result = await sendOwnerRequest({ phone, address, city, postalCode, country });

    setLoading(false);

    if (result.success && result.request) {
      setSubmitted(result.request);
    } else {
      setError(result.error ?? t.errFallback);
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
          <i className="fa-solid fa-sailboat" aria-hidden="true" /> {t.formTitle}
        </h3>
        <p>{t.formIntro}</p>
      </div>

      {lastRequest?.status === "rejected" && lastRequest.adminComment && (
        <div className="docs-info-banner" style={{ margin: "0 24px 20px" }}>
          <i className="fa-solid fa-circle-info" />
          <div>
            <strong>{t.rejectedNote}</strong>
            <p>{lastRequest.adminComment}</p>
          </div>
        </div>
      )}

      <form className="contact-form-body" onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label req" htmlFor="phone">{t.labelPhone}</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="form-input"
              defaultValue={emptyForm.phone}
              placeholder={t.placeholderPhone}
              required
              maxLength={20}
              autoComplete="tel"
            />
          </div>
          <div className="form-group">
            <label className="form-label req" htmlFor="city">{t.labelCity}</label>
            <input type="text" id="city" name="city" className="form-input" placeholder={t.placeholderCity} required maxLength={60} autoComplete="address-level2" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label req" htmlFor="address">{t.labelAddress}</label>
          <input type="text" id="address" name="address" className="form-input" placeholder={t.placeholderAddress} required maxLength={120} autoComplete="street-address" />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label req" htmlFor="postalCode">{t.labelPostalCode}</label>
            <input type="text" id="postalCode" name="postalCode" className="form-input" placeholder={t.placeholderPostal} required maxLength={12} autoComplete="postal-code" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="country">{t.labelCountry}</label>
            <input type="text" id="country" name="country" className="form-input" defaultValue="France" maxLength={60} autoComplete="country-name" />
          </div>
        </div>

        {error && (
          <div className="form-error" role="alert">
            <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />{" "}
            {error}
          </div>
        )}

        <div className="form-rgpd">
          <input type="checkbox" id="owner-terms" required className="form-rgpd-checkbox" />
          <label htmlFor="owner-terms" className="form-rgpd-label">
            {t.rgpdBefore}
            <a href="/cgu#proprietaires" target="_blank" className="form-rgpd-link">{t.rgpdLink}</a>
            {t.rgpdAfter}
          </label>
        </div>

        <button type="submit" className="btn btn-primary form-submit-btn" disabled={loading} aria-busy={loading}>
          {loading ? (
            <><i className="fa-solid fa-circle-notch fa-spin" aria-hidden="true" /> {t.submitting}</>
          ) : (
            <><i className="fa-solid fa-paper-plane" aria-hidden="true" /> {t.submit}</>
          )}
        </button>
      </form>
    </div>
  );
}
