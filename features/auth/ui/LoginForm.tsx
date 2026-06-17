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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) { setError("Veuillez remplir tous les champs."); return; }

    setLoading(true);
    setError("");

    try {
      const result = await apiLogin({ email, password });
      login(result.email, result.role);
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.push(result.role === "proprietaire" ? "/proprietaire/bateaux" : "/profil");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 401 ? "Identifiants incorrects. Vérifiez votre e-mail et mot de passe." : err.message);
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
        <label htmlFor="login-email">Adresse e-mail</label>
        <input
          id="login-email"
          type="email"
          placeholder="vous@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="login-password">
          Mot de passe
          <Link href="/mot-de-passe-oublie" className="auth-link-inline">Oublié ?</Link>
        </label>
        <div className="input-password-wrap">
          <input
            id="login-password"
            type={showPwd ? "text" : "password"}
            placeholder="Votre mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
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

      <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
        {loading ? (
          <><i className="fa-solid fa-circle-notch fa-spin" aria-hidden="true" /> Connexion en cours…</>
        ) : (
          <><i className="fa-solid fa-right-to-bracket" aria-hidden="true" /> Se connecter</>
        )}
      </button>
    </form>
  );
}
