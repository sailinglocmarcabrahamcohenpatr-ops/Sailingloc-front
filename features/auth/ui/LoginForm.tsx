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
      } else {
        // Toujours atterrir dans l'espace locataire après connexion, même
        // pour un compte propriétaire — la bascule reste à un clic (menu
        // du compte / sidebar) si besoin d'aller dans l'espace propriétaire.
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

      <div className="auth-divider-or">ou</div>

      <button type="button" className="btn-auth-google">
        <svg className="btn-auth-google-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Se connecter avec Google
      </button>
    </form>
  );
}
