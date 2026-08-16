import type { Metadata } from "next";
import { LocaleLink as Link } from "@/shared/i18n";
import { getDictionary, getRequestLocale } from "@/shared/i18n/get-dictionary";
import { getDestinations } from "@/entities/destination";
import { BOAT_TYPES } from "@/shared/config";

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getRequestLocale()).sitemapPage;
  return { title: t.metaTitle, description: t.metaDescription, alternates: { canonical: "/plan-du-site" } };
}

export default async function PlanDuSitePage() {
  const dict = getDictionary(await getRequestLocale());
  const t = dict.sitemapPage;
  const fl = dict.footer.links;
  const destinations = getDestinations();
  const boatTypes = BOAT_TYPES.filter((bt) => bt.value !== "tous");

  const sections: { heading: string; icon: string; links: { href: string; label: string }[] }[] = [
    {
      heading: t.sectionBoats,
      icon: "fa-sailboat",
      links: [
        { href: "/bateaux", label: fl.findBoat },
        ...boatTypes.map((bt) => ({
          href: `/bateaux?type=${bt.value}`,
          label: dict.catalog.typeLabels[bt.value as keyof typeof dict.catalog.typeLabels],
        })),
      ],
    },
    {
      heading: t.sectionDestinations,
      icon: "fa-map-location-dot",
      links: [
        { href: "/destinations", label: t.allDestinations },
        ...destinations.map((d) => ({ href: `/destinations/${d.slug}`, label: d.name })),
      ],
    },
    {
      heading: t.sectionOwners,
      icon: "fa-anchor",
      links: [
        { href: "/proprietaire", label: fl.listBoat },
        { href: "/proprietaire/bateaux", label: fl.ownerSpace },
      ],
    },
    {
      heading: t.sectionAccount,
      icon: "fa-user",
      links: [
        { href: "/connexion", label: dict.loginPage.metaTitle },
        { href: "/inscription", label: dict.registerPage.metaTitle },
      ],
    },
    {
      heading: t.sectionHelp,
      icon: "fa-circle-info",
      links: [
        { href: "/comment-ca-marche", label: fl.howItWorks },
        { href: "/contact", label: fl.contact },
      ],
    },
    {
      heading: t.sectionLegal,
      icon: "fa-scale-balanced",
      links: [
        { href: "/mentions-legales", label: fl.legal },
        { href: "/confidentialite", label: fl.privacy },
        { href: "/cgu", label: fl.cgu },
        { href: "/cookies", label: fl.cookies },
      ],
    },
  ];

  return (
    <>
      <section className="legal-hero">
        <div className="container">
          <div className="legal-hero-tag">
            <i className="fa-solid fa-map" aria-hidden="true" /> {t.tag}
          </div>
          <h1>{t.title}</h1>
          <p className="legal-hero-sub">{t.description}</p>
        </div>
      </section>

      <div className="container sitemap-grid">
        {sections.map((section) => (
          <div className="sitemap-col" key={section.heading}>
            <h5><i className={`fa-solid ${section.icon}`} aria-hidden="true" /> {section.heading}</h5>
            <ul>
              {section.links.map((link) => (
                <li key={link.href}><Link href={link.href}>{link.label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
