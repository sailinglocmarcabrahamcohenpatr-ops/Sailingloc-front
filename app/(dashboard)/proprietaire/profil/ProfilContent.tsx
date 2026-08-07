"use client";

import { useState } from "react";
import { useAuth, utilisateursApi, ApiError } from "@/shared/lib";
import { isValidEmail } from "@/shared/lib/utils";
import { useI18n } from "@/shared/i18n";
import "./profil.css";

export default function ProfilContent() {
  const { user, updateUser } = useAuth();
  const t = useI18n().dict.ownerProfilPage;

  const [prenom, setPrenom] = useState(() => user?.name.split(" ")[0] ?? "");
  const [nom, setNom] = useState(() => user?.name.split(" ").slice(1).join(" ") ?? "");
  const [email, setEmail] = useState(() => user?.email ?? "");
  const [telephone, setTelephone] = useState(() => user?.telephone ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [passwordEditing, setPasswordEditing] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;
    if (!isValidEmail(email)) { setSaveError(t.errEmailInvalid); return; }
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      await utilisateursApi.update(user.id, {
        prenom,
        nom,
        email,
        telephone: telephone || undefined,
      });
      updateUser({ name: `${prenom} ${nom}`.trim(), email, telephone });
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : t.saveError);
    } finally {
      setSaving(false);
    }
  }

  function openPasswordForm() {
    setPasswordEditing(true);
    setNewPassword("");
    setConfirmPassword("");
    setPwError("");
    setPwSuccess(false);
  }

  function cancelPasswordForm() {
    setPasswordEditing(false);
    setNewPassword("");
    setConfirmPassword("");
    setPwError("");
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;
    if (newPassword !== confirmPassword) {
      setPwError(t.pwMismatch);
      return;
    }
    setPwSaving(true);
    setPwError("");
    try {
      await utilisateursApi.update(user.id, { password: newPassword });
      setPasswordEditing(false);
      setNewPassword("");
      setConfirmPassword("");
      setPwSuccess(true);
    } catch (err) {
      setPwError(err instanceof ApiError ? err.message : t.saveError);
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div className="dash-page">
      <div className="dash-page-hd">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="dash-page-icon"><i className="fa-solid fa-user" /></div>
          <div>
            <h1 className="dash-title">{t.title}</h1>
            <p className="dash-sub">{t.sub}</p>
          </div>
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-card-hd"><h3>{t.personalTitle}</h3></div>
        <form className="op-form" onSubmit={handleSave}>
          {saveError && (
            <div className="op-form-alert" role="alert">
              <i className="fa-solid fa-circle-exclamation" aria-hidden="true" /> {saveError}
            </div>
          )}
          {saveSuccess && (
            <div className="op-form-alert success" role="status">
              <i className="fa-solid fa-circle-check" aria-hidden="true" /> {t.saveSuccess}
            </div>
          )}
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="op-fn">{t.labelFirstName}</label>
              <input id="op-fn" type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} required maxLength={60} />
            </div>
            <div className="form-group">
              <label htmlFor="op-ln">{t.labelLastName}</label>
              <input id="op-ln" type="text" value={nom} onChange={(e) => setNom(e.target.value)} required maxLength={60} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="op-email">{t.labelEmail}</label>
            <input id="op-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={254} />
          </div>
          <div className="form-group">
            <label htmlFor="op-phone">{t.labelPhone}</label>
            <input id="op-phone" type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} maxLength={20} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving
              ? <><i className="fa-solid fa-circle-notch fa-spin" /> {t.saving}</>
              : <><i className="fa-solid fa-floppy-disk" /> {t.save}</>}
          </button>
        </form>
      </div>

      <div className="dash-card">
        <div className="dash-card-hd"><h3>{t.securityTitle}</h3></div>
        <div className="security-items">
          <div className={`security-item${passwordEditing ? " op-security-item-editing" : ""}`}>
            <div className="op-security-item-row">
              <div><strong>{t.securityPasswordLabel}</strong><span>{t.securityPasswordSub}</span></div>
              {!passwordEditing && (
                <button type="button" className="btn btn-outline btn-sm" onClick={openPasswordForm}>
                  {t.securityPasswordBtn}
                </button>
              )}
            </div>
            {passwordEditing && (
              <form className="op-form" onSubmit={handlePasswordSave}>
                {pwError && (
                  <div className="op-form-alert" role="alert">
                    <i className="fa-solid fa-circle-exclamation" aria-hidden="true" /> {pwError}
                  </div>
                )}
                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="op-new-password">{t.labelNewPassword}</label>
                    <input id="op-new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" placeholder={t.passwordPlaceholder} required minLength={8} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="op-confirm-password">{t.labelConfirmPassword}</label>
                    <input id="op-confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" placeholder={t.passwordPlaceholder} required minLength={8} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={pwSaving}>
                    {pwSaving
                      ? <><i className="fa-solid fa-circle-notch fa-spin" /> {t.saving}</>
                      : <><i className="fa-solid fa-floppy-disk" /> {t.save}</>}
                  </button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={cancelPasswordForm} disabled={pwSaving}>
                    {t.pwCancel}
                  </button>
                </div>
              </form>
            )}
          </div>
          <div className="security-item">
            <div><strong>{t.securityIdLabel}</strong><span>{t.securityIdSub}</span></div>
            <span className="badge-status green"><i className="fa-solid fa-check" /> {t.securityIdBadge}</span>
          </div>
        </div>
        {pwSuccess && (
          <div className="op-form-alert success" style={{ marginTop: 16 }} role="status">
            <i className="fa-solid fa-circle-check" aria-hidden="true" /> {t.pwSuccess}
          </div>
        )}
      </div>
    </div>
  );
}
