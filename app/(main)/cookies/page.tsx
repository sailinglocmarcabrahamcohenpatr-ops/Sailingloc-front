import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/shared/ui";
import type { LegalTocItem } from "@/shared/ui";
import { CookieSettingsButton } from "@/widgets/cookie-consent";
import { APP_NAME, SUPPORT_EMAIL } from "@/shared/config";

export const metadata: Metadata = {
  title: "Politique de cookies",
  description:
    "Découvrez quels cookies sont utilisés sur SailingLoc, leur finalité, leur durée de conservation, et comment gérer vos préférences.",
};

const TOC: LegalTocItem[] = [
  { id: "quest-ce", label: "1. Qu'est-ce qu'un cookie ?" },
  { id: "categories", label: "2. Catégories de cookies" },
  { id: "liste", label: "3. Liste des cookies utilisés" },
  { id: "duree", label: "4. Durée de conservation" },
  { id: "gestion", label: "5. Gérer vos préférences" },
  { id: "navigateur", label: "6. Paramétrer votre navigateur" },
  { id: "contact", label: "7. Contact" },
];

export default function CookiesPage() {
  return (
    <LegalLayout
      icon="fa-cookie-bite"
      tag="Cookies"
      title="Politique de cookies"
      description={`Cette page explique ce que sont les cookies, pourquoi ${APP_NAME} les utilise, et comment vous pouvez à tout moment gérer vos préférences.`}
      updated="1 août 2026"
      toc={TOC}
    >
      <div className="legal-callout">
        <i className="fa-solid fa-sliders" aria-hidden="true" />
        <p>
          Vous pouvez modifier vos choix à tout moment, gratuitement et facilement, en cliquant sur le bouton
          ci-dessous.
        </p>
      </div>
      <CookieSettingsButton className="btn btn-primary legal-manage-cookies-btn" />

      <section id="quest-ce" style={{ marginTop: 40 }}>
        <h2><i className="fa-solid fa-circle-question" aria-hidden="true" /> 1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
        <p>
          Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur, tablette, mobile) lors de
          votre navigation sur un site internet. Il permet notamment de reconnaître votre appareil, de mémoriser
          vos préférences ou de mesurer votre navigation.
        </p>
      </section>

      <section id="categories">
        <h2><i className="fa-solid fa-layer-group" aria-hidden="true" /> 2. Catégories de cookies</h2>
        <h3>Cookies strictement nécessaires</h3>
        <p>
          Indispensables au fonctionnement du site : connexion à votre compte, sécurité, mémorisation de votre
          recherche de bateau ou de votre panier de réservation. Ils ne nécessitent pas votre consentement et ne
          peuvent pas être désactivés.
        </p>
        <h3>Cookies de mesure d&apos;audience</h3>
        <p>
          Permettent de comprendre comment les visiteurs utilisent le site (pages consultées, parcours,
          appareils utilisés) afin d&apos;améliorer l&apos;expérience proposée. Ils sont soumis à votre
          consentement.
        </p>
        <h3>Cookies de publicité et personnalisation</h3>
        <p>
          Permettent de vous proposer des contenus ou offres adaptés à vos centres d&apos;intérêt, sur{" "}
          {APP_NAME} ou sur d&apos;autres sites. Ils sont soumis à votre consentement.
        </p>
      </section>

      <section id="liste">
        <h2><i className="fa-solid fa-list-check" aria-hidden="true" /> 3. Liste des cookies utilisés</h2>
        <table>
          <thead>
            <tr><th>Nom</th><th>Catégorie</th><th>Finalité</th></tr>
          </thead>
          <tbody>
            <tr><td>sailingloc_session</td><td>Nécessaire</td><td>Maintien de la connexion à votre compte</td></tr>
            <tr><td>sailingloc_prefs</td><td>Nécessaire</td><td>Mémorisation de vos préférences d&apos;affichage (thème, taille du texte)</td></tr>
            <tr><td>sailingloc_cookie_consent</td><td>Nécessaire</td><td>Enregistrement de vos choix en matière de cookies</td></tr>
            <tr><td>_audience_anonyme</td><td>Mesure d&apos;audience</td><td>Statistiques de fréquentation anonymisées</td></tr>
            <tr><td>_ads_personnalisation</td><td>Publicité</td><td>Personnalisation des offres et contenus</td></tr>
          </tbody>
        </table>
      </section>

      <section id="duree">
        <h2><i className="fa-solid fa-hourglass-half" aria-hidden="true" /> 4. Durée de conservation</h2>
        <p>
          Votre choix concernant les cookies soumis à consentement est conservé 13 mois maximum. Passé ce délai,
          le bandeau de gestion des cookies vous sera de nouveau présenté.
        </p>
      </section>

      <section id="gestion">
        <h2><i className="fa-solid fa-sliders" aria-hidden="true" /> 5. Gérer vos préférences</h2>
        <p>
          Vous pouvez accepter, refuser ou personnaliser les cookies non essentiels à tout moment en cliquant sur
          le bouton « Gérer mes cookies » en haut de cette page, ou depuis le lien disponible en pied de page du
          site.
        </p>
      </section>

      <section id="navigateur">
        <h2><i className="fa-solid fa-gear" aria-hidden="true" /> 6. Paramétrer votre navigateur</h2>
        <p>
          Vous pouvez également configurer votre navigateur pour refuser tout ou partie des cookies. Notez que
          la désactivation des cookies strictement nécessaires peut empêcher le bon fonctionnement du site
          (connexion, réservation).
        </p>
      </section>

      <section id="contact">
        <h2><i className="fa-solid fa-envelope" aria-hidden="true" /> 7. Contact</h2>
        <p>
          Pour toute question sur notre utilisation des cookies, consultez également notre{" "}
          <Link href="/confidentialite">politique de confidentialité</Link> ou écrivez-nous à{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
      </section>
    </LegalLayout>
  );
}
