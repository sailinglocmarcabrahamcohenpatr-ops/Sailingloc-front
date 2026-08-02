import type { Metadata } from "next";
import { LocaleLink as Link } from "@/shared/i18n";
import { LegalLayout } from "@/shared/ui";
import type { LegalTocItem } from "@/shared/ui";
import { getDictionary, getRequestLocale } from "@/shared/i18n/get-dictionary";
import { CookieSettingsButton } from "@/widgets/cookie-consent";
import { SUPPORT_EMAIL } from "@/shared/config";

const TOC_IDS = ["quest-ce", "categories", "liste", "duree", "gestion", "navigateur", "contact"];
const ICONS = ["fa-circle-question", "fa-layer-group", "fa-list-check", "fa-hourglass-half", "fa-sliders", "fa-gear", "fa-envelope"];

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getRequestLocale()).cookiesPage;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function CookiesPage() {
  const locale = await getRequestLocale();
  const t = getDictionary(locale).cookiesPage;
  const isEN = locale === "en";
  const toc: LegalTocItem[] = TOC_IDS.map((id, i) => ({ id, label: t.toc[i] }));

  return (
    <LegalLayout
      icon="fa-cookie-bite"
      tag={t.tag}
      title={t.title}
      description={t.description}
      updated={t.updated}
      toc={toc}
    >
      <div className="legal-callout">
        <i className="fa-solid fa-sliders" aria-hidden="true" />
        <p>{t.callout}</p>
      </div>
      <CookieSettingsButton className="btn btn-primary legal-manage-cookies-btn" />

      <section id="quest-ce" style={{ marginTop: 40 }}>
        <h2><i className={`fa-solid ${ICONS[0]}`} aria-hidden="true" /> {t.toc[0]}</h2>
        {isEN ? (
          <p>A cookie is a small text file placed on your device (computer, tablet, mobile) when you browse a website. It enables the site to recognise your device, remember your preferences, or track your navigation.</p>
        ) : (
          <p>Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur, tablette, mobile) lors de votre navigation sur un site internet. Il permet notamment de reconnaître votre appareil, de mémoriser vos préférences ou de mesurer votre navigation.</p>
        )}
      </section>

      <section id="categories">
        <h2><i className={`fa-solid ${ICONS[1]}`} aria-hidden="true" /> {t.toc[1]}</h2>
        {isEN ? (
          <>
            <h3>Strictly necessary cookies</h3>
            <p>Essential for the site to function: logging into your account, security, remembering your boat search or booking basket. These do not require your consent and cannot be disabled.</p>
            <h3>Analytics cookies</h3>
            <p>Help us understand how visitors use the site (pages viewed, journeys, devices) in order to improve the experience. These require your consent.</p>
            <h3>Advertising and personalisation cookies</h3>
            <p>Enable us to show you content or offers tailored to your interests, on SailingLoc or on other sites. These require your consent.</p>
          </>
        ) : (
          <>
            <h3>Cookies strictement nécessaires</h3>
            <p>Indispensables au fonctionnement du site : connexion à votre compte, sécurité, mémorisation de votre recherche de bateau ou de votre panier de réservation. Ils ne nécessitent pas votre consentement et ne peuvent pas être désactivés.</p>
            <h3>Cookies de mesure d&apos;audience</h3>
            <p>Permettent de comprendre comment les visiteurs utilisent le site (pages consultées, parcours, appareils utilisés) afin d&apos;améliorer l&apos;expérience proposée. Ils sont soumis à votre consentement.</p>
            <h3>Cookies de publicité et personnalisation</h3>
            <p>Permettent de vous proposer des contenus ou offres adaptés à vos centres d&apos;intérêt, sur SailingLoc ou sur d&apos;autres sites. Ils sont soumis à votre consentement.</p>
          </>
        )}
      </section>

      <section id="liste">
        <h2><i className={`fa-solid ${ICONS[2]}`} aria-hidden="true" /> {t.toc[2]}</h2>
        <table>
          <thead>
            {isEN ? (
              <tr><th>Name</th><th>Category</th><th>Purpose</th></tr>
            ) : (
              <tr><th>Nom</th><th>Catégorie</th><th>Finalité</th></tr>
            )}
          </thead>
          <tbody>
            {isEN ? (
              <>
                <tr><td>sailingloc_session</td><td>Necessary</td><td>Keeps you logged in to your account</td></tr>
                <tr><td>sailingloc_prefs</td><td>Necessary</td><td>Saves your display preferences (theme, text size)</td></tr>
                <tr><td>sailingloc_cookie_consent</td><td>Necessary</td><td>Stores your cookie choices</td></tr>
                <tr><td>_audience_anonyme</td><td>Analytics</td><td>Anonymised traffic statistics</td></tr>
                <tr><td>_ads_personnalisation</td><td>Advertising</td><td>Personalisation of offers and content</td></tr>
              </>
            ) : (
              <>
                <tr><td>sailingloc_session</td><td>Nécessaire</td><td>Maintien de la connexion à votre compte</td></tr>
                <tr><td>sailingloc_prefs</td><td>Nécessaire</td><td>Mémorisation de vos préférences d&apos;affichage (thème, taille du texte)</td></tr>
                <tr><td>sailingloc_cookie_consent</td><td>Nécessaire</td><td>Enregistrement de vos choix en matière de cookies</td></tr>
                <tr><td>_audience_anonyme</td><td>Mesure d&apos;audience</td><td>Statistiques de fréquentation anonymisées</td></tr>
                <tr><td>_ads_personnalisation</td><td>Publicité</td><td>Personnalisation des offres et contenus</td></tr>
              </>
            )}
          </tbody>
        </table>
      </section>

      <section id="duree">
        <h2><i className={`fa-solid ${ICONS[3]}`} aria-hidden="true" /> {t.toc[3]}</h2>
        {isEN ? (
          <p>Your cookie consent choices are stored for a maximum of 13 months. After this period, the cookie management banner will be displayed again.</p>
        ) : (
          <p>Votre choix concernant les cookies soumis à consentement est conservé 13 mois maximum. Passé ce délai, le bandeau de gestion des cookies vous sera de nouveau présenté.</p>
        )}
      </section>

      <section id="gestion">
        <h2><i className={`fa-solid ${ICONS[4]}`} aria-hidden="true" /> {t.toc[4]}</h2>
        {isEN ? (
          <p>You can accept, decline or customise non-essential cookies at any time by clicking the &quot;Manage my cookies&quot; button at the top of this page, or from the link in the site footer.</p>
        ) : (
          <p>Vous pouvez accepter, refuser ou personnaliser les cookies non essentiels à tout moment en cliquant sur le bouton « Gérer mes cookies » en haut de cette page, ou depuis le lien disponible en pied de page du site.</p>
        )}
      </section>

      <section id="navigateur">
        <h2><i className={`fa-solid ${ICONS[5]}`} aria-hidden="true" /> {t.toc[5]}</h2>
        {isEN ? (
          <p>You can also configure your browser to refuse all or some cookies. Please note that disabling strictly necessary cookies may prevent the site from functioning correctly (login, booking).</p>
        ) : (
          <p>Vous pouvez également configurer votre navigateur pour refuser tout ou partie des cookies. Notez que la désactivation des cookies strictement nécessaires peut empêcher le bon fonctionnement du site (connexion, réservation).</p>
        )}
      </section>

      <section id="contact">
        <h2><i className={`fa-solid ${ICONS[6]}`} aria-hidden="true" /> {t.toc[6]}</h2>
        {isEN ? (
          <p>
            For any question about our use of cookies, please also consult our{" "}
            <Link href="/confidentialite">{t.linkPrivacy}</Link> or write to us at{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
          </p>
        ) : (
          <p>
            Pour toute question sur notre utilisation des cookies, consultez également notre{" "}
            <Link href="/confidentialite">{t.linkPrivacy}</Link> ou écrivez-nous à{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
          </p>
        )}
      </section>
    </LegalLayout>
  );
}
