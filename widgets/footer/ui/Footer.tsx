import { CookieSettingsButton } from "@/widgets/cookie-consent";
import { Logo } from "@/shared/ui";
import { LocaleLink as Link } from "@/shared/i18n";
import { getRequestLocale, getDictionary } from "@/shared/i18n/get-dictionary";

/* Les libellés sont résolus via le dictionnaire (clé → traduction) ; seuls
   les href restent en dur (chemins canoniques FR, préfixés par LocaleLink). */
const footerLinks = {
  annonces: [
    { href: "/bateaux", key: "findBoat" },
    { href: "/destinations", key: "destinations" },
    { href: "/bateaux?type=voilier", key: "sailboats" },
    { href: "/bateaux?type=catamaran", key: "catamarans" },
    { href: "/bateaux?type=moteur", key: "motorboats" },
    { href: "/bateaux?type=sans-permis", key: "noLicense" },
  ],
  proprietaires: [
    { href: "/proprietaire", key: "listBoat" },
    { href: "/comment-ca-marche#proprietaires", key: "ownerInsurance" },
    { href: "/comment-ca-marche#proprietaires", key: "pricing" },
    { href: "/contact", key: "ownerHelp" },
    { href: "/proprietaire/bateaux", key: "ownerSpace" },
  ],
  informations: [
    { href: "/comment-ca-marche", key: "about" },
    { href: "/contact", key: "contact" },
    { href: "/comment-ca-marche", key: "howItWorks" },
    { href: "/comment-ca-marche#questions", key: "faq" },
    { href: "/confidentialite", key: "gdpr" },
    { href: "#", key: "blog" },
  ],
  abonnement: [
    { href: "#", key: "mobileApp" },
    { href: "#", key: "emailAlerts" },
    { href: "#", key: "newsletter" },
    { href: "#", key: "partners" },
  ],
} as const;

export default async function Footer() {
  const dict = getDictionary(await getRequestLocale());
  const t = dict.footer;
  const l = t.links;

  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <Logo onDark />
            </div>
            <p>{t.tagline}</p>
          </div>

          <div className="footer-col">
            <h5>{t.colListings}</h5>
            <ul>
              {footerLinks.annonces.map((link) => (
                <li key={link.key}><Link href={link.href}>{l[link.key]}</Link></li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h5>{t.colOwners}</h5>
            <ul>
              {footerLinks.proprietaires.map((link) => (
                <li key={link.key}><Link href={link.href}>{l[link.key]}</Link></li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h5>{t.colInfo}</h5>
            <ul>
              {footerLinks.informations.map((link) => (
                <li key={link.key}><Link href={link.href}>{l[link.key]}</Link></li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h5>{t.colSubscribe}</h5>
            <ul>
              {footerLinks.abonnement.map((link) => (
                <li key={link.key}><Link href={link.href}>{l[link.key]}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>{t.rights}</span>
          <div className="footer-bottom-links">
            <Link href="/cgu">{l.cgu}</Link>
            <Link href="/cookies">{l.cookies}</Link>
            <Link href="/confidentialite">{l.privacy}</Link>
            <Link href="/mentions-legales">{l.legal}</Link>
            <Link href="/plan-du-site">{l.sitemap}</Link>
            <CookieSettingsButton className="">{t.manageCookies}</CookieSettingsButton>
          </div>
        </div>
      </div>
    </footer>
  );
}
