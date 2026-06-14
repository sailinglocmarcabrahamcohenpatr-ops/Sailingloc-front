import Link from "next/link";

const footerLinks = {
  annonces: [
    { href: "/bateaux", label: "Trouver un bateau" },
    { href: "/bateaux", label: "Destinations" },
    { href: "/bateaux?type=voilier", label: "Voiliers" },
    { href: "/bateaux?type=catamaran", label: "Catamarans" },
    { href: "/bateaux?type=moteur", label: "Bateaux moteur" },
    { href: "/bateaux?permis=non", label: "Sans permis" },
  ],
  proprietaires: [
    { href: "#", label: "Mettre en location" },
    { href: "#", label: "Assurance propriétaire" },
    { href: "#", label: "Tarifs & commissions" },
    { href: "#", label: "Aide propriétaire" },
    { href: "#", label: "Espace propriétaire" },
  ],
  informations: [
    { href: "#", label: "À propos" },
    { href: "/contact", label: "Contact" },
    { href: "/#comment-ca-marche", label: "Comment ça marche" },
    { href: "#", label: "FAQ" },
    { href: "#", label: "Politique RGPD" },
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
              <i className="fa-solid fa-anchor" aria-hidden="true" />
              SailingLoc
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
          <span>© 2025 SailingLoc.com — Tous droits réservés</span>
          <div className="footer-bottom-links">
            <Link href="#">CGU</Link>
            <Link href="#">Cookies</Link>
            <Link href="#">Confidentialité</Link>
            <Link href="#">Mentions légales</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
