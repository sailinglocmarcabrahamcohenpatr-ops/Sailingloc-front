import type { Metadata, Viewport } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { FadeInObserver } from "@/shared/ui";
import { AuthProvider, PreferencesProvider, MessagesProvider, NotificationsProvider, CookieConsentProvider } from "@/shared/lib";
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

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <html lang="fr" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
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
                <CookieConsentProvider>
                  {children}
                  <FadeInObserver />
                  <CookieConsentBanner />
                </CookieConsentProvider>
              </NotificationsProvider>
            </MessagesProvider>
          </PreferencesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
