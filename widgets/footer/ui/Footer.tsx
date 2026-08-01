import Link from "next/link";
import { CookieSettingsButton } from "@/widgets/cookie-consent";
import { Logo } from "@/shared/ui";

const footerLinks = {
  annonces: [
    { href: "/bateaux", label: "Trouver un bateau" },
    { href: "/destinations", label: "Destinations" },
    { href: "/bateaux?type=voilier", label: "Voiliers" },
    { href: "/bateaux?type=catamaran", label: "Catamarans" },
    { href: "/bateaux?type=moteur", label: "Bateaux moteur" },
    { href: "/bateaux?type=sans-permis", label: "Sans permis" },
  ],
  proprietaires: [
    { href: "/proprietaire", label: "Mettre en location" },
    { href: "/comment-ca-marche#proprietaires", label: "Assurance propriétaire" },
    { href: "/comment-ca-marche#proprietaires", label: "Tarifs & commissions" },
    { href: "/contact", label: "Aide propriétaire" },
    { href: "/proprietaire/bateaux", label: "Espace propriétaire" },
  ],
  informations: [
    { href: "/comment-ca-marche", label: "À propos de SailingLoc" },
    { href: "/contact", label: "Contact" },
    { href: "/comment-ca-marche", label: "Comment ça marche" },
    { href: "/comment-ca-marche#questions", label: "FAQ" },
    { href: "/confidentialite", label: "Politique RGPD" },
    { href: "#", label: "Blog" },
  ],
  abonnement: [
    { href: "#", label: "Application mobile" },
    { href: "#", label: "Alertes email" },
    { href: "#", label: "Newsletter" },
    { href: "#", label: "Nos partenaires" },
  ],
};

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <Logo onDark />
            </div>
            <p>
              La plateforme de référence pour la location de bateaux entre
              particuliers en France et en Europe. Accessible à tous.
            </p>
          </div>

          <div className="footer-col">
            <h5>Annonces</h5>
            <ul>
              {footerLinks.annonces.map((link) => (
                <li key={link.label}><Link href={link.href}>{link.label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h5>Propriétaires</h5>
            <ul>
              {footerLinks.proprietaires.map((link) => (
                <li key={link.label}><Link href={link.href}>{link.label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h5>Informations</h5>
            <ul>
              {footerLinks.informations.map((link) => (
                <li key={link.label}><Link href={link.href}>{link.label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h5>Abonnement</h5>
            <ul>
              {footerLinks.abonnement.map((link) => (
                <li key={link.label}><Link href={link.href}>{link.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 SailingLoc.com — Tous droits réservés</span>
          <div className="footer-bottom-links">
            <Link href="/cgu">CGU</Link>
            <Link href="/cookies">Cookies</Link>
            <Link href="/confidentialite">Confidentialité</Link>
            <Link href="/mentions-legales">Mentions légales</Link>
            <CookieSettingsButton className="">Gérer mes cookies</CookieSettingsButton>
          </div>
        </div>
      </div>
    </footer>
  );
}
