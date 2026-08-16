import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { stripLocale, localizeHref, LOCALE_HEADER } from "@/shared/i18n/config";

/* ── Routes protégées ───────────────────────────── */
const PROTECTED: Array<{ pattern: RegExp; requiredRole?: string }> = [
  { pattern: /^\/admin(\/|$)/, requiredRole: "admin" },
  { pattern: /^\/profil\/radar(\/|$)/, requiredRole: "locataire" },
  { pattern: /^\/profil(\/|$)/ },
  { pattern: /^\/proprietaire\//, requiredRole: "proprietaire" },
];

const AUTH_ROUTES = ["/connexion", "/inscription"];

/* Un administrateur n'a pas de site public : tout ce qui n'est pas /admin
   (ni les appels /api du proxy backend) le renvoie vers son dashboard. */
const ADMIN_ALLOWED_PREFIXES = ["/admin", "/api"];

/* Page d'accueil de l'espace connecté selon le rôle du compte. */
function dashboardHomeFor(role: string): string {
  if (role === "admin") return "/admin/dashboard";
  if (role === "proprietaire") return "/proprietaire/dashboard";
  return "/profil";
}

export function proxy(request: NextRequest) {
  const rawPath = request.nextUrl.pathname;

  /* La locale est déduite du préfixe d'URL (/en/…), qui fait AUTORITÉ. On
     travaille ensuite sur le chemin canonique (sans préfixe) pour que toute
     la logique d'auth existante reste inchangée : /en/admin se comporte
     exactement comme /admin. */
  const { locale, pathname } = stripLocale(rawPath);

  const isAuth = request.cookies.get("sailingloc_auth")?.value === "1";
  const role   = request.cookies.get("sailingloc_role")?.value ?? "";

  /* Toute redirection doit conserver la locale courante : un visiteur EN
     redirigé reste dans l'espace EN. */
  const redirectTo = (to: string) =>
    NextResponse.redirect(new URL(localizeHref(to, locale), request.url));

  /* Admin connecté hors de /admin (site vitrine, /profil, /proprietaire...)
     → toujours renvoyé vers le dashboard admin. */
  if (
    isAuth &&
    role === "admin" &&
    !ADMIN_ALLOWED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))
  ) {
    return redirectTo("/admin/dashboard");
  }

  /* Déjà connecté sur /connexion ou /inscription → redirige vers l'espace
     propre au rôle du compte (admin, propriétaire ou locataire). */
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r)) && isAuth) {
    return redirectTo(dashboardHomeFor(role));
  }

  /* Ancienne route publique /inscrire-bateau : redirige vers le bon
     formulaire selon le rôle du visiteur — création de bateau dans le
     dashboard pour un propriétaire, demande d'accès propriétaire sinon. */
  if (/^\/inscrire-bateau(\/|$)/.test(pathname)) {
    if (!isAuth) {
      const url = request.nextUrl.clone();
      url.pathname = localizeHref("/connexion", locale);
      url.searchParams.set("redirect", rawPath);
      return NextResponse.redirect(url);
    }
    return redirectTo(role === "proprietaire" ? "/proprietaire/bateaux/nouveau" : "/profil/devenir-proprietaire");
  }

  /* Routes privées */
  for (const rule of PROTECTED) {
    if (!rule.pattern.test(pathname)) continue;

    if (!isAuth) {
      const url = request.nextUrl.clone();
      url.pathname = localizeHref("/connexion", locale);
      url.searchParams.set("redirect", rawPath);
      return NextResponse.redirect(url);
    }

    if (rule.requiredRole && role !== rule.requiredRole) {
      return redirectTo(dashboardHomeFor(role));
    }

    break;
  }

  /* Locale propagée aux composants serveur via un en-tête de requête. Posé
     systématiquement (y compris FR) pour que l'URL prime sur un cookie de
     préférence éventuellement obsolète. */
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER, locale);

  /* Overlay EN : /en/… est réécrit vers le chemin canonique (aucun fichier
     déplacé sous [lang]) en transportant l'en-tête de locale. */
  const response =
    rawPath !== pathname
      ? (() => {
          const url = request.nextUrl.clone();
          url.pathname = pathname;
          return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
        })()
      : NextResponse.next({ request: { headers: requestHeaders } });

  /* En-têtes de sécurité */
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(self), geolocation=(self)");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.\\w+$).*)"],
};
