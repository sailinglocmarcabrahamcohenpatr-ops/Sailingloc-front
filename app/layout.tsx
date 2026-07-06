import type { Metadata, Viewport } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { FadeInObserver } from "@/shared/ui";
import { AuthProvider } from "@/shared/lib";
import { cn } from "@/lib/utils";

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
  colorScheme: "light",
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
      </head>
      <body>
        <AuthProvider>
          {children}
          <FadeInObserver />
        </AuthProvider>
      </body>
    </html>
  );
}
