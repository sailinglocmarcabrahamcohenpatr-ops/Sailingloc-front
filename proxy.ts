import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* ── Routes protégées ───────────────────────────── */
const PROTECTED: Array<{ pattern: RegExp; requiredRole?: string }> = [
  { pattern: /^\/admin(\/|$)/, requiredRole: "admin" },
  { pattern: /^\/profil(\/|$)/ },
  { pattern: /^\/proprietaire(\/|$)/, requiredRole: "proprietaire" },
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
  const { pathname } = request.nextUrl;

  const isAuth = request.cookies.get("sailingloc_auth")?.value === "1";
  const role   = request.cookies.get("sailingloc_role")?.value ?? "";

  /* Admin connecté hors de /admin (site vitrine, /profil, /proprietaire...)
     → toujours renvoyé vers le dashboard admin. */
  if (
    isAuth &&
    role === "admin" &&
    !ADMIN_ALLOWED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))
  ) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  /* Déjà connecté sur /connexion ou /inscription → redirige vers l'espace
     propre au rôle du compte (admin, propriétaire ou locataire). */
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r)) && isAuth) {
    return NextResponse.redirect(new URL(dashboardHomeFor(role), request.url));
  }

  /* Routes privées */
  for (const rule of PROTECTED) {
    if (!rule.pattern.test(pathname)) continue;

    if (!isAuth) {
      const url = request.nextUrl.clone();
      url.pathname = "/connexion";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    if (rule.requiredRole && role !== rule.requiredRole) {
      return NextResponse.redirect(new URL(dashboardHomeFor(role), request.url));
    }

    break;
  }

  /* En-têtes de sécurité */
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(self), geolocation=()");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.\\w+$).*)"],
};

