"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AccountType } from "@/shared/types";
import { useAuth } from "@/shared/lib";
import { apiRegister, ApiError } from "@/shared/lib";

const STEPS = ["Votre compte", "Vos informations", "Confirmation"];

export default function RegisterForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState(0);
  const [accountType, setAccountType] = useState<AccountType>("locataire");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const next = () => {
    if (step === 0 && (!email || !password)) { setError("E-mail et mot de passe requis."); return; }
    if (step === 1 && (!firstName || !lastName)) { setError("Prénom et nom requis."); return; }
    setError("");
    setStep((s) => s + 1);
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await apiRegister({
        email,
        password,
        prenom: firstName,
        nom: lastName,
        telephone: phone || undefined,
        role: accountType === "proprietaire" ? "ROLE_PROPRIETAIRE" : "ROLE_USER",
      });
      login(result.email, result.role);
      router.push(result.role === "proprietaire" ? "/proprietaire/bateaux" : "/profil");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 409 ? "Un compte existe déjà avec cet e-mail." : err.message);
      } else {
        setError("Impossible de joindre le serveur. Réessayez dans un instant.");
      }
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-steps">
        {STEPS.map((s, i) => (
          <div key={s} className={`auth-step${i <= step ? " done" : ""}${i === step ? " current" : ""}`}>
            <div className="auth-step-dot">{i < step ? <i className="fa-solid fa-check" /> : i + 1}</div>
            <span>{s}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="auth-error" role="alert">
          <i className="fa-solid fa-circle-exclamation" aria-hidden="true" /> {error}
        </div>
      )}

      {step === 0 && (
        <>
          <div className="account-type-row">
            {(["locataire", "proprietaire"] as AccountType[]).map((t) => (
              <button
                key={t}
                type="button"
                className={`account-type-btn${accountType === t ? " active" : ""}`}
                onClick={() => setAccountType(t)}
              >
                <i className={`fa-solid ${t === "locataire" ? "fa-sailboat" : "fa-anchor"}`} aria-hidden="true" />
                <strong>{t === "locataire" ? "Je loue un bateau" : "Je loue mon bateau"}</strong>
                <small>{t === "locataire" ? "Je cherche à louer" : "Je suis propriétaire"}</small>
              </button>
            ))}
          </div>
          <div className="form-group">
            <label htmlFor="reg-email">Adresse e-mail</label>
            <input id="reg-email" type="email" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="reg-password">Mot de passe</label>
            <div className="input-password-wrap">
              <input id="reg-password" type={showPwd ? "text" : "password"} placeholder="8 caractères minimum" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" className="input-password-toggle" onClick={() => setShowPwd((v) => !v)} aria-label={showPwd ? "Masquer" : "Afficher"}>
                <i className={`fa-solid ${showPwd ? "fa-eye-slash" : "fa-eye"}`} aria-hidden="true" />
              </button>
            </div>
          </div>
          <button type="button" className="btn btn-primary btn-full" onClick={next}>
            Continuer <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </button>
        </>
      )}

      {step === 1 && (
        <>
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="reg-fn">Prénom</label>
              <input id="reg-fn" type="text" placeholder="Marie" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="reg-ln">Nom</label>
              <input id="reg-ln" type="text" placeholder="Dupont" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="reg-phone">Téléphone <span className="form-optional">(optionnel)</span></label>
            <input id="reg-phone" type="tel" placeholder="+33 6 12 34 56 78" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="checkbox-label auth-cgv">
              <input type="checkbox" required />
              <span>J'accepte les <Link href="#" className="auth-link">CGU</Link> et la <Link href="#" className="auth-link">politique de confidentialité</Link></span>
            </label>
          </div>
          <div className="auth-btns-row">
            <button type="button" className="btn btn-outline" onClick={() => setStep(0)}>
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Retour
            </button>
            <button type="button" className="btn btn-primary" onClick={next}>
              Continuer <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="auth-confirm-summary">
            <div className="auth-confirm-avatar">
              {firstName.charAt(0)}{lastName.charAt(0)}
            </div>
            <div>
              <strong>{firstName} {lastName}</strong>
              <span>{email}</span>
              <span className="auth-confirm-type">
                <i className={`fa-solid ${accountType === "locataire" ? "fa-sailboat" : "fa-anchor"}`} aria-hidden="true" />
                {accountType === "locataire" ? "Compte Locataire" : "Compte Propriétaire"}
              </span>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading
              ? <><i className="fa-solid fa-circle-notch fa-spin" aria-hidden="true" /> Création…</>
              : <><i className="fa-solid fa-check" aria-hidden="true" /> Créer mon compte</>
            }
          </button>
          <button type="button" className="btn btn-ghost btn-full" onClick={() => setStep(1)}>
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Modifier
          </button>
        </>
      )}

      <p className="auth-switch">
        Déjà un compte ? <Link href="/connexion" className="auth-link">Se connecter</Link>
      </p>
    </form>
  );
}
