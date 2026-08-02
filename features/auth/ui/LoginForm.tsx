"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/lib";
import { useI18n, LocaleLink as Link } from "@/shared/i18n";
import { apiLogin, ApiError } from "@/shared/lib";

interface LoginFormProps {
  redirectTo?: string;
}

export default function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const { login } = useAuth();
  const t = useI18n().dict.loginPage;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) { setError(t.errRequired); return; }

    setLoading(true);
    setError("");

    try {
      const result = await apiLogin({ email, password });
      login({ email: result.email, name: result.name, role: result.role, userId: result.userId, telephone: result.telephone });
      if (redirectTo) {
        router.push(redirectTo);
      } else if (result.role === "admin") {
        router.push("/admin/dashboard");
      } else if (result.role === "proprietaire") {
        router.push("/proprietaire/dashboard");
      } else {
        router.push("/profil");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 401 ? t.errCredentials : err.message);
      } else {
        setError(t.errServer);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="auth-error" role="alert">
          <i className="fa-solid fa-circle-exclamation" aria-hidden="true" /> {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="login-email">{t.labelEmail}</label>
        <input
          id="login-email"
          type="email"
          placeholder={t.phEmail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="login-password">{t.labelPassword}</label>
        <div className="input-password-wrap" style={{ position: "relative" }}>
          <input
            id="login-password"
            type={showPwd ? "text" : "password"}
            placeholder={t.phPassword}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            style={{ width: "100%" }}
          />
          <button
            type="button"
            className="input-password-toggle"
            aria-label={showPwd ? t.hidePwd : t.showPwd}
            onClick={() => setShowPwd((v) => !v)}
          >
            <i className={`fa-solid ${showPwd ? "fa-eye-slash" : "fa-eye"}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="auth-remember-row">
        <label className="auth-remember-label">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          {t.rememberMe}
        </label>
        <Link href="/mot-de-passe-oublie" className="auth-link-inline">
          {t.forgotPassword}
        </Link>
      </div>

      <button type="submit" className="btn-auth-primary" disabled={loading}>
        {loading ? (
          <><i className="fa-solid fa-circle-notch fa-spin" aria-hidden="true" /> {t.submitLoading}</>
        ) : (
          t.submit
        )}
      </button>
    </form>
  );
}
