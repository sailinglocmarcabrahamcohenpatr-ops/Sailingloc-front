import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Montserrat } from "next/font/google";
import "./globals.css";
import { FadeInObserver } from "@/shared/ui";
import { AuthProvider, PreferencesProvider, MessagesProvider, NotificationsProvider, FavorisProvider, CookieConsentProvider } from "@/shared/lib";
import { CookieConsentBanner } from "@/widgets/cookie-consent";
import { I18nProvider } from "@/shared/i18n";
import { getRequestLocale, getDictionary } from "@/shared/i18n/get-dictionary";
import { cn } from "@/lib/utils";
import { APP_URL, APP_NAME, SUPPORT_EMAIL, SUPPORT_PHONE } from "@/shared/config";

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

const DEFAULT_TITLE = "SailingLoc — Location de bateaux entre particuliers";
const DEFAULT_DESCRIPTION =
  "Louez un bateau entre particuliers en France et en Europe. Des centaines de voiliers, catamarans et bateaux à moteur disponibles.";
const DEFAULT_OG_IMAGE = {
  url: "/videos/scroll-bg-poster.jpg",
  width: 1920,
  height: 1080,
  alt: DEFAULT_TITLE,
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s · SailingLoc",
  },
  description: DEFAULT_DESCRIPTION,
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
    url: APP_URL,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();
  const dict = getDictionary(locale);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${APP_URL}/#organization`,
        name: APP_NAME,
        url: APP_URL,
        email: SUPPORT_EMAIL,
        telephone: SUPPORT_PHONE,
      },
      {
        "@type": "WebSite",
        "@id": `${APP_URL}/#website`,
        name: APP_NAME,
        url: APP_URL,
        inLanguage: locale,
        publisher: { "@id": `${APP_URL}/#organization` },
      },
    ],
  };

  return (
    <html lang={locale} className={cn("font-sans", geist.variable, fraunces.variable, montserrat.variable)} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <I18nProvider locale={locale} dict={dict}>
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
        </I18nProvider>
      </body>
    </html>
  );
}
