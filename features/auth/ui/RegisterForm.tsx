"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AccountType } from "@/shared/types";
import { apiRegister, ApiError } from "@/shared/lib";
import PhoneInput from "./PhoneInput";

const STEPS = ["Type de compte", "Vos infos", "Confirmation"];

const ACCOUNT_TYPES: {
  type: AccountType;
  icon: string;
  bg: string;
  title: string;
  sub: string;
}[] = [
  {
    type: "locataire",
    icon: "fa-sailboat",
    bg: "#114B6B",
    title: "Je loue un bateau",
    sub: "Trouvez le voilier idéal parmi 3 200+ annonces",
  },
  {
    type: "proprietaire",
    icon: "fa-anchor",
    bg: "#0B1929",
    title: "Je propose mon bateau",
    sub: "Rentabilisez votre bateau et gérez vos réservations",
  },
];

function calcStrength(pwd: string): { score: number; label: string; color: string } {
  if (pwd.length === 0) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const labels = ["Trop court", "Faible", "Moyen", "Fort", "Excellent"];
  const colors = ["", "#EF4444", "#F59E0B", "#10B981", "#059669"];
  return { score, label: labels[score] ?? "", color: colors[score] ?? "" };
}

export default function RegisterForm() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [accountType, setAccountType] = useState<AccountType>("locataire");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [agreedCgu, setAgreedCgu] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const strength = calcStrength(password);

  const next = () => {
    if (step === 0 && (!email || !password)) { setError("E-mail et mot de passe requis."); return; }
    if (step === 0 && password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    if (step === 1 && (!firstName || !lastName)) { setError("Prénom et nom requis."); return; }
    if (step === 1 && !agreedCgu) { setError("Vous devez accepter les CGU pour continuer."); return; }
    setError("");
    setStep((s) => s + 1);
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step < 2) { next(); return; }
    setLoading(true);
    setError("");
    try {
      await apiRegister({ email, password, prenom: firstName, nom: lastName, telephone: phone || undefined });
      router.push("/connexion?registered=1");
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

      {/* ── Barre de progression ── */}
      <div className="reg-steps">
        {STEPS.map((s, i) => (
          <div key={s} className={`reg-step${i < step ? " done" : ""}${i === step ? " act" : ""}`}>
            <div className="reg-step-dot">
              {i < step
                ? <i className="fa-solid fa-check" aria-hidden="true" />
                : <span>{i + 1}</span>}
            </div>
            <span className="reg-step-lbl">{s}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="auth-error" role="alert">
          <i className="fa-solid fa-circle-exclamation" aria-hidden="true" /> {error}
        </div>
      )}

      {/* ── Étape 0 : type de compte + identifiants ── */}
      {step === 0 && (
        <>
          <div className="acct-toggle">
            {ACCOUNT_TYPES.map(({ type, icon, bg, title, sub }) => (
              <button
                key={type}
                type="button"
                className={`acct-toggle-btn${accountType === type ? " selected" : ""}`}
                onClick={() => setAccountType(type)}
                aria-pressed={accountType === type}
              >
                <span className="acct-toggle-icon" style={{ background: bg }}>
                  <i className={`fa-solid ${icon}`} aria-hidden="true" />
                </span>
                <span className="acct-toggle-text">
                  <strong>{title}</strong>
                  <small>{sub}</small>
                </span>
                <span className="acct-toggle-check" aria-hidden="true">
                  <i className="fa-solid fa-check" />
                </span>
              </button>
            ))}
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Adresse e-mail</label>
            <input
                id="reg-email" type="email" placeholder="vous@exemple.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                autoComplete="email" required
              />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">
              Mot de passe
              <span className="form-optional">8 car. min.</span>
            </label>
            <div className="input-password-wrap" style={{ position: "relative" }}>
              <input
                id="reg-password" type={showPwd ? "text" : "password"}
                placeholder="8 caractères minimum"
                value={password} onChange={(e) => setPassword(e.target.value)}
                required style={{ width: "100%" }}
              />
              <button type="button" className="input-password-toggle"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? "Masquer" : "Afficher"}>
                <i className={`fa-solid ${showPwd ? "fa-eye-slash" : "fa-eye"}`} aria-hidden="true" />
              </button>
            </div>
            {password && (
              <div className="pwd-strength">
                <div className="pwd-strength-bars">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="pwd-strength-bar"
                      style={{ background: i <= strength.score ? strength.color : "var(--border)" }} />
                  ))}
                </div>
                <span className="pwd-strength-label" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <button type="button" className="btn btn-primary btn-full" onClick={next} style={{ marginTop: "4px" }}>
            Continuer <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </button>
        </>
      )}

      {/* Étape 1 : informations personnelles */}
      {step === 1 && (
        <>
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="reg-fn">Prénom</label>
              <input id="reg-fn" type="text" placeholder="Marie"
                value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="reg-ln">Nom</label>
              <input id="reg-ln" type="text" placeholder="Dupont"
                value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-phone">
              Téléphone <span className="form-optional">(optionnel)</span>
            </label>
            <PhoneInput
              id="reg-phone"
              value={phone}
              onChange={setPhone}
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label auth-cgv">
              <input type="checkbox" checked={agreedCgu} onChange={(e) => setAgreedCgu(e.target.checked)} />
              <span>
                J'accepte les <Link href="#" className="auth-link">CGU</Link>{" "}
                et la <Link href="#" className="auth-link">politique de confidentialité</Link>
              </span>
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

      {/* ── Étape 2 : confirmation ── */}
      {step === 2 && (
        <>
          <div className="auth-confirm">
            <div className="auth-confirm-avatar">
              {firstName.charAt(0)}{lastName.charAt(0)}
            </div>
            <div className="auth-confirm-info">
              <strong className="auth-confirm-name">{firstName} {lastName}</strong>
              <span>{email}</span>
            </div>
            <div className="auth-confirm-badge">
              <i className={`fa-solid ${accountType === "locataire" ? "fa-sailboat" : "fa-anchor"}`} aria-hidden="true" />
              {accountType === "locataire" ? "Compte Locataire" : "Compte Propriétaire"}
            </div>
            <ul className="auth-confirm-details">
              <li><i className="fa-solid fa-check" aria-hidden="true" /><span>E-mail enregistré</span></li>
              <li><i className="fa-solid fa-check" aria-hidden="true" /><span>Mot de passe sécurisé</span></li>
              <li><i className="fa-solid fa-check" aria-hidden="true" /><span>CGU acceptées</span></li>
            </ul>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading
              ? <><i className="fa-solid fa-circle-notch fa-spin" aria-hidden="true" /> Création en cours…</>
              : <><i className="fa-solid fa-rocket" aria-hidden="true" /> Créer mon compte</>
            }
          </button>
          <button type="button" className="btn btn-ghost btn-full" onClick={() => setStep(1)} style={{ marginTop: "8px" }}>
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Modifier mes informations
          </button>
        </>
      )}

      <p className="auth-switch">
        Déjà un compte ?{" "}
        <Link href="/connexion" className="auth-link">Se connecter</Link>
      </p>
    </form>
  );
}
