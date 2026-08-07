"use client";

import { useState } from "react";
import { useI18n, LocaleLink as Link } from "@/shared/i18n";
import { apiForgotPassword, ApiError } from "@/shared/lib";
import { isValidEmail } from "@/shared/lib/utils";

export default function ForgotPasswordForm() {
  const t = useI18n().dict.forgotPasswordPage;
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (!isValidEmail(email)) { setError(t.errEmailInvalid); return; }
    setLoading(true);
    setError("");
    try {
      await apiForgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.errServer);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    const parts = t.sentText.split("{email}");
    return (
      <div className="auth-success">
        <div className="auth-success-icon"><i className="fa-solid fa-envelope-circle-check" /></div>
        <h3>{t.sentTitle}</h3>
        <p>{parts[0]}<strong>{email}</strong>{parts[1]}</p>
        <Link href="/connexion" className="btn btn-primary btn-full">
          <i className="fa-solid fa-right-to-bracket" /> {t.backToLogin}
        </Link>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <p className="auth-desc">{t.desc}</p>
      <div className="form-group">
        <label htmlFor="forgot-email">{t.labelEmail}</label>
        <input
          id="forgot-email"
          type="email"
          placeholder={t.phEmail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          maxLength={254}
        />
      </div>
      {error && <p className="auth-error">{error}</p>}
      <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
        {loading
          ? <><i className="fa-solid fa-circle-notch fa-spin" /> {t.submitLoading}</>
          : <><i className="fa-solid fa-paper-plane" /> {t.submit}</>
        }
      </button>
      <p className="auth-switch">
        <Link href="/connexion" className="auth-link">
          <i className="fa-solid fa-arrow-left" /> {t.backToLogin}
        </Link>
      </p>
    </form>
  );
}
