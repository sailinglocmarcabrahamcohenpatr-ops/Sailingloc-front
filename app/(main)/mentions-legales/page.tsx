import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/shared/ui";
import type { LegalTocItem } from "@/shared/ui";
import { APP_NAME, APP_URL, SUPPORT_EMAIL, SUPPORT_PHONE } from "@/shared/config";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site SailingLoc : éditeur, hébergeur, directeur de publication et propriété intellectuelle.",
};

const TOC: LegalTocItem[] = [
  { id: "editeur", label: "1. Éditeur du site" },
  { id: "hebergeur", label: "2. Hébergeur" },
  { id: "publication", label: "3. Directeur de publication" },
  { id: "propriete", label: "4. Propriété intellectuelle" },
  { id: "responsabilite", label: "5. Limitation de responsabilité" },
  { id: "liens", label: "6. Liens hypertextes" },
  { id: "mediation", label: "7. Médiation à la consommation" },
  { id: "donnees", label: "8. Données personnelles" },
  { id: "contact", label: "9. Contact" },
];

export default function MentionsLegalesPage() {
  return (
    <LegalLayout
      icon="fa-scale-balanced"
      tag="Mentions légales"
      title="Mentions légales"
      description={`Informations légales relatives à l'édition et à l'hébergement du site ${APP_URL.replace("https://", "")}, conformément à la loi n°2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique.`}
      updated="1 août 2026"
      toc={TOC}
    >
      <section id="editeur">
        <h2><i className="fa-solid fa-building" aria-hidden="true" /> 1. Éditeur du site</h2>
        <table>
          <tbody>
            <tr><th>Raison sociale</th><td>{APP_NAME} SAS</td></tr>
            <tr><th>Forme juridique</th><td>Société par actions simplifiée (SAS)</td></tr>
            <tr><th>Capital social</th><td>10 000 €</td></tr>
            <tr><th>Siège social</th><td>12 quai du Port, 13002 Marseille, France</td></tr>
            <tr><th>SIRET</th><td>123 456 789 00012</td></tr>
            <tr><th>RCS</th><td>Marseille B 123 456 789</td></tr>
            <tr><th>TVA intracommunautaire</th><td>FR 12 123456789</td></tr>
            <tr><th>E-mail</th><td><a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></td></tr>
            <tr><th>Téléphone</th><td>{SUPPORT_PHONE}</td></tr>
          </tbody>
        </table>
      </section>

      <section id="hebergeur">
        <h2><i className="fa-solid fa-server" aria-hidden="true" /> 2. Hébergeur</h2>
        <p>
          Le site est hébergé par un prestataire d&apos;hébergement cloud situé au sein de l&apos;Union
          européenne, garantissant la disponibilité et la sécurité des données hébergées.
        </p>
      </section>

      <section id="publication">
        <h2><i className="fa-solid fa-user-tie" aria-hidden="true" /> 3. Directeur de publication</h2>
        <p>
          Le directeur de la publication du site est le représentant légal de {APP_NAME} SAS. Toute question
          relative au contenu du site peut être adressée à <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
      </section>

      <section id="propriete">
        <h2><i className="fa-solid fa-copyright" aria-hidden="true" /> 4. Propriété intellectuelle</h2>
        <p>
          L&apos;ensemble des contenus présents sur le site {APP_NAME} (structure, textes, logos, graphismes,
          photographies, vidéos) est protégé par le droit d&apos;auteur et le droit des marques. Toute
          reproduction, représentation, modification ou exploitation, totale ou partielle, sans autorisation
          préalable est interdite et constitutive de contrefaçon.
        </p>
      </section>

      <section id="responsabilite">
        <h2><i className="fa-solid fa-triangle-exclamation" aria-hidden="true" /> 5. Limitation de responsabilité</h2>
        <p>
          {APP_NAME} s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des informations diffusées
          sur le site, mais ne peut garantir l&apos;absence d&apos;erreur ou d&apos;interruption du service.
          {" "}{APP_NAME} ne saurait être tenue responsable des dommages directs ou indirects résultant de
          l&apos;utilisation du site ou de l&apos;impossibilité d&apos;y accéder.
        </p>
      </section>

      <section id="liens">
        <h2><i className="fa-solid fa-link" aria-hidden="true" /> 6. Liens hypertextes</h2>
        <p>
          Le site peut contenir des liens vers des sites tiers. {APP_NAME} n&apos;exerce aucun contrôle sur ces
          sites et décline toute responsabilité quant à leur contenu.
        </p>
      </section>

      <section id="mediation">
        <h2><i className="fa-solid fa-handshake" aria-hidden="true" /> 7. Médiation à la consommation</h2>
        <p>
          Conformément aux articles L.616-1 et R.616-1 du Code de la consommation, tout consommateur a le droit
          de recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable d&apos;un
          litige, après démarche préalable auprès de notre service client.
        </p>
      </section>

      <section id="donnees">
        <h2><i className="fa-solid fa-user-shield" aria-hidden="true" /> 8. Données personnelles</h2>
        <p>
          Le traitement de vos données personnelles est décrit dans notre{" "}
          <Link href="/confidentialite">politique de confidentialité</Link>, ainsi que dans notre{" "}
          <Link href="/cookies">politique de cookies</Link>.
        </p>
      </section>

      <section id="contact">
        <h2><i className="fa-solid fa-envelope" aria-hidden="true" /> 9. Contact</h2>
        <p>
          Pour toute question relative aux présentes mentions légales, contactez-nous via notre{" "}
          <Link href="/contact">page de contact</Link> ou par e-mail à{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
      </section>
    </LegalLayout>
  );
}
