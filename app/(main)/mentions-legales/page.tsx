import type { Metadata } from "next";
import { LocaleLink as Link } from "@/shared/i18n";
import { LegalLayout } from "@/shared/ui";
import type { LegalTocItem } from "@/shared/ui";
import { getDictionary, getRequestLocale } from "@/shared/i18n/get-dictionary";
import { APP_NAME, APP_URL, SUPPORT_EMAIL, SUPPORT_PHONE } from "@/shared/config";

const TOC_IDS = ["editeur", "hebergeur", "publication", "propriete", "responsabilite", "liens", "mediation", "donnees", "contact"];
const ICONS = ["fa-building", "fa-server", "fa-user-tie", "fa-copyright", "fa-triangle-exclamation", "fa-link", "fa-handshake", "fa-user-shield", "fa-envelope"];

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getRequestLocale()).mentionsPage;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function MentionsLegalesPage() {
  const locale = await getRequestLocale();
  const t = getDictionary(locale).mentionsPage;
  const isEN = locale === "en";
  const toc: LegalTocItem[] = TOC_IDS.map((id, i) => ({ id, label: t.toc[i] }));
  const domain = APP_URL.replace("https://", "");

  return (
    <LegalLayout
      icon="fa-scale-balanced"
      tag={t.tag}
      title={t.title}
      description={isEN
        ? `Legal information regarding the publication and hosting of the ${domain} website, in accordance with French Law No. 2004-575 of 21 June 2004 on confidence in the digital economy.`
        : `Informations légales relatives à l'édition et à l'hébergement du site ${domain}, conformément à la loi n°2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique.`
      }
      updated={t.updated}
      toc={toc}
    >
      <section id="editeur">
        <h2><i className={`fa-solid ${ICONS[0]}`} aria-hidden="true" /> {t.toc[0]}</h2>
        <table>
          <tbody>
            {isEN ? (
              <>
                <tr><th>Company name</th><td>{APP_NAME} SAS</td></tr>
                <tr><th>Legal form</th><td>Simplified joint-stock company (SAS)</td></tr>
                <tr><th>Share capital</th><td>€10,000</td></tr>
                <tr><th>Registered office</th><td>12 quai du Port, 13002 Marseille, France</td></tr>
                <tr><th>SIRET</th><td>123 456 789 00012</td></tr>
                <tr><th>RCS</th><td>Marseille B 123 456 789</td></tr>
                <tr><th>VAT number</th><td>FR 12 123456789</td></tr>
                <tr><th>Email</th><td><a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></td></tr>
                <tr><th>Phone</th><td>{SUPPORT_PHONE}</td></tr>
              </>
            ) : (
              <>
                <tr><th>Raison sociale</th><td>{APP_NAME} SAS</td></tr>
                <tr><th>Forme juridique</th><td>Société par actions simplifiée (SAS)</td></tr>
                <tr><th>Capital social</th><td>10 000 €</td></tr>
                <tr><th>Siège social</th><td>12 quai du Port, 13002 Marseille, France</td></tr>
                <tr><th>SIRET</th><td>123 456 789 00012</td></tr>
                <tr><th>RCS</th><td>Marseille B 123 456 789</td></tr>
                <tr><th>TVA intracommunautaire</th><td>FR 12 123456789</td></tr>
                <tr><th>E-mail</th><td><a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></td></tr>
                <tr><th>Téléphone</th><td>{SUPPORT_PHONE}</td></tr>
              </>
            )}
          </tbody>
        </table>
      </section>

      <section id="hebergeur">
        <h2><i className={`fa-solid ${ICONS[1]}`} aria-hidden="true" /> {t.toc[1]}</h2>
        {isEN ? (
          <p>The site is hosted by a cloud hosting provider located within the European Union, ensuring the availability and security of hosted data.</p>
        ) : (
          <p>Le site est hébergé par un prestataire d&apos;hébergement cloud situé au sein de l&apos;Union européenne, garantissant la disponibilité et la sécurité des données hébergées.</p>
        )}
      </section>

      <section id="publication">
        <h2><i className={`fa-solid ${ICONS[2]}`} aria-hidden="true" /> {t.toc[2]}</h2>
        {isEN ? (
          <p>
            The publication director of the site is the legal representative of {APP_NAME} SAS. Any question regarding the site&apos;s content may be addressed to{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
          </p>
        ) : (
          <p>
            Le directeur de la publication du site est le représentant légal de {APP_NAME} SAS. Toute question relative au contenu du site peut être adressée à{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
          </p>
        )}
      </section>

      <section id="propriete">
        <h2><i className={`fa-solid ${ICONS[3]}`} aria-hidden="true" /> {t.toc[3]}</h2>
        {isEN ? (
          <p>
            All content on the {APP_NAME} site (structure, text, logos, graphics, photographs, videos) is protected by copyright and trademark law. Any reproduction, representation, modification or exploitation, in whole or in part, without prior authorisation is prohibited and constitutes an infringement.
          </p>
        ) : (
          <p>
            L&apos;ensemble des contenus présents sur le site {APP_NAME} (structure, textes, logos, graphismes, photographies, vidéos) est protégé par le droit d&apos;auteur et le droit des marques. Toute reproduction, représentation, modification ou exploitation, totale ou partielle, sans autorisation préalable est interdite et constitutive de contrefaçon.
          </p>
        )}
      </section>

      <section id="responsabilite">
        <h2><i className={`fa-solid ${ICONS[4]}`} aria-hidden="true" /> {t.toc[4]}</h2>
        {isEN ? (
          <p>
            {APP_NAME} endeavours to ensure the accuracy and currency of information published on the site, but cannot guarantee the absence of errors or service interruptions. {APP_NAME} shall not be liable for direct or indirect damages resulting from the use of the site or inability to access it.
          </p>
        ) : (
          <p>
            {APP_NAME} s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des informations diffusées sur le site, mais ne peut garantir l&apos;absence d&apos;erreur ou d&apos;interruption du service. {APP_NAME} ne saurait être tenue responsable des dommages directs ou indirects résultant de l&apos;utilisation du site ou de l&apos;impossibilité d&apos;y accéder.
          </p>
        )}
      </section>

      <section id="liens">
        <h2><i className={`fa-solid ${ICONS[5]}`} aria-hidden="true" /> {t.toc[5]}</h2>
        {isEN ? (
          <p>The site may contain links to third-party sites. {APP_NAME} has no control over these sites and accepts no liability for their content.</p>
        ) : (
          <p>Le site peut contenir des liens vers des sites tiers. {APP_NAME} n&apos;exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.</p>
        )}
      </section>

      <section id="mediation">
        <h2><i className={`fa-solid ${ICONS[6]}`} aria-hidden="true" /> {t.toc[6]}</h2>
        {isEN ? (
          <p>
            In accordance with Articles L.616-1 and R.616-1 of the French Consumer Code, any consumer has the right to use a consumer mediator free of charge for the amicable resolution of a dispute, after first contacting our customer service.
          </p>
        ) : (
          <p>
            Conformément aux articles L.616-1 et R.616-1 du Code de la consommation, tout consommateur a le droit de recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable d&apos;un litige, après démarche préalable auprès de notre service client.
          </p>
        )}
      </section>

      <section id="donnees">
        <h2><i className={`fa-solid ${ICONS[7]}`} aria-hidden="true" /> {t.toc[7]}</h2>
        {isEN ? (
          <p>
            The processing of your personal data is described in our{" "}
            <Link href="/confidentialite">{t.linkPrivacy}</Link>, as well as in our{" "}
            <Link href="/cookies">{t.linkCookies}</Link>.
          </p>
        ) : (
          <p>
            Le traitement de vos données personnelles est décrit dans notre{" "}
            <Link href="/confidentialite">{t.linkPrivacy}</Link>, ainsi que dans notre{" "}
            <Link href="/cookies">{t.linkCookies}</Link>.
          </p>
        )}
      </section>

      <section id="contact">
        <h2><i className={`fa-solid ${ICONS[8]}`} aria-hidden="true" /> {t.toc[8]}</h2>
        {isEN ? (
          <p>
            For any question regarding these legal notices, contact us via our{" "}
            <Link href="/contact">{t.linkContact}</Link> or by email at{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
          </p>
        ) : (
          <p>
            Pour toute question relative aux présentes mentions légales, contactez-nous via notre{" "}
            <Link href="/contact">{t.linkContact}</Link> ou par e-mail à{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
          </p>
        )}
      </section>
    </LegalLayout>
  );
}
