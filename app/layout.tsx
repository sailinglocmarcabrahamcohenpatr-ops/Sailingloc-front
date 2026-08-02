import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Montserrat } from "next/font/google";
import "./globals.css";
import { FadeInObserver } from "@/shared/ui";
import { AuthProvider, PreferencesProvider, MessagesProvider, NotificationsProvider, FavorisProvider, CookieConsentProvider } from "@/shared/lib";
import { CookieConsentBanner } from "@/widgets/cookie-consent";
import { cn } from "@/lib/utils";

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var raw = localStorage.getItem("sailingloc_prefs");
    var prefs = raw ? JSON.parse(raw) : {};
    var theme = prefs.theme || "light";
    var resolved = theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;
    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.setAttribute("data-text-size", prefs.textSize || "normal");
    if (prefs.reduceMotion) document.documentElement.setAttribute("data-motion", "reduced");
  } catch (e) {}
})();
`;

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

/* Police de titrage. Fraunces est un serif variable à fort caractère : il
   donne une identité aux titres là où Geist (police par défaut de Next.js)
   reste neutre. Le texte courant garde Geist — c'est le CONTRASTE entre les
   deux qui produit l'effet haut de gamme, pas le serif seul.
   Remplace Inter, qui était chargée mais jamais appliquée. */
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

/* Titres du dashboard (admin/propriétaire/profil) : Montserrat, en remplacement
   du serif Fraunces utilisé sur le site public — demande du chef. */
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-dashboard",
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SailingLoc — Location de bateaux entre particuliers",
    template: "%s · SailingLoc",
  },
  description:
    "Louez un bateau entre particuliers en France et en Europe. Des centaines de voiliers, catamarans et bateaux à moteur disponibles.",
  keywords: [
    "location bateau",
    "voilier",
    "catamaran",
    "particuliers",
    "France",
    "Méditerranée",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "SailingLoc",
    title: "SailingLoc — Location de bateaux entre particuliers",
    description:
      "Louez un bateau entre particuliers en France et en Europe. Des centaines de voiliers, catamarans et bateaux à moteur disponibles.",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={cn("font-sans", geist.variable, fraunces.variable, montserrat.variable)} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <AuthProvider>
          <PreferencesProvider>
            <MessagesProvider>
              <NotificationsProvider>
                <FavorisProvider>
                  <CookieConsentProvider>
                    {children}
                    <FadeInObserver />
                    <CookieConsentBanner />
                  </CookieConsentProvider>
                </FavorisProvider>
              </NotificationsProvider>
            </MessagesProvider>
          </PreferencesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
