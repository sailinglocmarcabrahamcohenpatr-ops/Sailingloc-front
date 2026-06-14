"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="auth-success">
        <div className="auth-success-icon"><i className="fa-solid fa-envelope-circle-check" /></div>
        <h3>E-mail envoyé !</h3>
        <p>
          Un lien de réinitialisation a été envoyé à <strong>{email}</strong>.
          Vérifiez vos spams si vous ne le voyez pas dans les 5 minutes.
        </p>
        <Link href="/connexion" className="btn btn-primary btn-full">
          <i className="fa-solid fa-right-to-bracket" /> Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <p className="auth-desc">
        Saisissez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
      </p>
      <div className="form-group">
        <label htmlFor="forgot-email">Adresse e-mail</label>
        <input
          id="forgot-email"
          type="email"
          placeholder="vous@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
        {loading ? <><i className="fa-solid fa-circle-notch fa-spin" /> Envoi…</> : <><i className="fa-solid fa-paper-plane" /> Envoyer le lien</>}
      </button>
      <p className="auth-switch">
        <Link href="/connexion" className="auth-link">
          <i className="fa-solid fa-arrow-left" /> Retour à la connexion
        </Link>
      </p>
    </form>
  );
}
