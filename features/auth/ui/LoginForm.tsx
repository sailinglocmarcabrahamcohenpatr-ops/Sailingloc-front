"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/lib";
import { apiLogin, ApiError } from "@/shared/lib";

interface LoginFormProps {
  redirectTo?: string;
}

export default function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) { setError("Veuillez remplir tous les champs."); return; }

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
        setError(err.status === 401
          ? "Identifiants incorrects. Vérifiez votre e-mail et mot de passe."
          : err.message);
      } else {
        setError("Impossible de joindre le serveur. Réessayez dans un instant.");
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
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          placeholder="Entrez votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="login-password">Mot de passe</label>
        <div className="input-password-wrap" style={{ position: "relative" }}>
          <input
            id="login-password"
            type={showPwd ? "text" : "password"}
            placeholder="Entrez votre mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            style={{ width: "100%" }}
          />
          <button
            type="button"
            className="input-password-toggle"
            aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
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
          Se souvenir de moi
        </label>
        <Link href="/mot-de-passe-oublie" className="auth-link-inline">
          Mot de passe oublié
        </Link>
      </div>

      <button
        type="submit"
        className="btn-auth-primary"
        disabled={loading}
      >
        {loading ? (
          <><i className="fa-solid fa-circle-notch fa-spin" aria-hidden="true" /> Connexion en cours…</>
        ) : (
          "Se connecter"
        )}
      </button>
    </form>
  );
}
