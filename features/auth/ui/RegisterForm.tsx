"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AccountType } from "@/shared/types";
import { useI18n, LocaleLink as Link } from "@/shared/i18n";
import { apiRegister, ApiError } from "@/shared/lib";
import { isValidEmail } from "@/shared/lib/utils";
import PhoneInput from "./PhoneInput";

const ACCOUNT_TYPE_ICONS: Record<AccountType, { icon: string; bg: string }> = {
  locataire:   { icon: "fa-sailboat", bg: "#114B6B" },
  proprietaire: { icon: "fa-anchor",  bg: "#0B1929" },
};

/** Les 4 critères sont tous obligatoires (voir `next()`) — pas de "score" à
 *  moitié acceptable, d'où une checklist plutôt qu'une jauge de force. */
function getPasswordChecks(pwd: string) {
  return {
    length: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    digit: /[0-9]/.test(pwd),
    special: /[^A-Za-z0-9]/.test(pwd),
  };
}

export default function RegisterForm() {
  const router = useRouter();
  const t = useI18n().dict.registerPage;

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

  const pwdChecks = getPasswordChecks(password);
  const pwdValid = pwdChecks.length && pwdChecks.upper && pwdChecks.digit && pwdChecks.special;

  const next = () => {
    if (step === 0 && (!email || !password)) { setError(t.errEmailPwd); return; }
    if (step === 0 && !isValidEmail(email)) { setError(t.errEmailInvalid); return; }
    if (step === 0 && !pwdValid) { setError(t.errPwdLen); return; }
    if (step === 1 && (!firstName || !lastName)) { setError(t.errNames); return; }
    if (step === 1 && !agreedCgu) { setError(t.errCgu); return; }
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
        setError(err.status === 409 ? t.errEmailTaken : t.errUnknown);
      } else {
        setError(t.errServer);
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
        {t.steps.map((s, i) => (
          <div key={i} className={`reg-step${i < step ? " done" : ""}${i === step ? " act" : ""}`}>
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
            {(["locataire", "proprietaire"] as AccountType[]).map((type) => {
              const { icon, bg } = ACCOUNT_TYPE_ICONS[type];
              const title = type === "locataire" ? t.typeRenterTitle : t.typeOwnerTitle;
              const sub   = type === "locataire" ? t.typeRenterSub  : t.typeOwnerSub;
              return (
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
              );
            })}
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">{t.labelEmail}</label>
            <input
              id="reg-email" type="email" placeholder="vous@exemple.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              autoComplete="email" required maxLength={254}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">
              {t.labelPassword}
              <span className="form-optional">{t.pwdMinNote}</span>
            </label>
            <div className="input-password-wrap" style={{ position: "relative" }}>
              <input
                id="reg-password" type={showPwd ? "text" : "password"}
                placeholder={t.pwdMinPh}
                value={password} onChange={(e) => setPassword(e.target.value)}
                required autoComplete="new-password" style={{ width: "100%" }}
              />
              <button type="button" className="input-password-toggle"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? t.hidePwd : t.showPwd}>
                <i className={`fa-solid ${showPwd ? "fa-eye-slash" : "fa-eye"}`} aria-hidden="true" />
              </button>
            </div>
            {password && (
              <ul className="pwd-requirements">
                <li className={pwdChecks.length ? "met" : ""}>
                  <i className={`fa-solid ${pwdChecks.length ? "fa-circle-check" : "fa-circle"}`} aria-hidden="true" /> {t.pwdReqLength}
                </li>
                <li className={pwdChecks.upper ? "met" : ""}>
                  <i className={`fa-solid ${pwdChecks.upper ? "fa-circle-check" : "fa-circle"}`} aria-hidden="true" /> {t.pwdReqUpper}
                </li>
                <li className={pwdChecks.digit ? "met" : ""}>
                  <i className={`fa-solid ${pwdChecks.digit ? "fa-circle-check" : "fa-circle"}`} aria-hidden="true" /> {t.pwdReqDigit}
                </li>
                <li className={pwdChecks.special ? "met" : ""}>
                  <i className={`fa-solid ${pwdChecks.special ? "fa-circle-check" : "fa-circle"}`} aria-hidden="true" /> {t.pwdReqSpecial}
                </li>
              </ul>
            )}
          </div>

          <button type="button" className="btn btn-primary btn-full" onClick={next} style={{ marginTop: "4px" }}>
            {t.continueBtn} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </button>
        </>
      )}

      {/* ── Étape 1 : informations personnelles ── */}
      {step === 1 && (
        <>
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="reg-fn">{t.labelFirstName}</label>
              <input id="reg-fn" type="text" placeholder="Marie"
                value={firstName} onChange={(e) => setFirstName(e.target.value)} required maxLength={60} />
            </div>
            <div className="form-group">
              <label htmlFor="reg-ln">{t.labelLastName}</label>
              <input id="reg-ln" type="text" placeholder="Dupont"
                value={lastName} onChange={(e) => setLastName(e.target.value)} required maxLength={60} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-phone">
              {t.labelPhone} <span className="form-optional">{t.optional}</span>
            </label>
            <PhoneInput id="reg-phone" value={phone} onChange={setPhone} />
          </div>

          <div className="form-group">
            <label className="checkbox-label auth-cgv">
              <input type="checkbox" checked={agreedCgu} onChange={(e) => setAgreedCgu(e.target.checked)} />
              <span>
                {t.cguPrefix}
                <Link href="/cgu" target="_blank" className="auth-link">{t.cguLink}</Link>
                {t.cguMid}
                <Link href="/confidentialite" target="_blank" className="auth-link">{t.privacyLink}</Link>
              </span>
            </label>
          </div>

          <div className="auth-btns-row">
            <button type="button" className="btn btn-outline" onClick={() => setStep(0)}>
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /> {t.back}
            </button>
            <button type="button" className="btn btn-primary" onClick={next}>
              {t.continueBtn} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
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
              {accountType === "locataire" ? t.badgeRenter : t.badgeOwner}
            </div>
            <ul className="auth-confirm-details">
              <li><i className="fa-solid fa-check" aria-hidden="true" /><span>{t.confirmEmail}</span></li>
              <li><i className="fa-solid fa-check" aria-hidden="true" /><span>{t.confirmPwd}</span></li>
              <li><i className="fa-solid fa-check" aria-hidden="true" /><span>{t.confirmCgu}</span></li>
            </ul>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading
              ? <><i className="fa-solid fa-circle-notch fa-spin" aria-hidden="true" /> {t.submitLoading}</>
              : <><i className="fa-solid fa-rocket" aria-hidden="true" /> {t.submit}</>
            }
          </button>
          <button type="button" className="btn btn-ghost btn-full" onClick={() => setStep(1)} style={{ marginTop: "8px" }}>
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> {t.editInfo}
          </button>
        </>
      )}

      <p className="auth-switch">
        {t.alreadyAccount}{" "}
        <Link href="/connexion" className="auth-link">{t.signIn}</Link>
      </p>
    </form>
  );
}
