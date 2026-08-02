import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/shared/ui";
import type { LegalTocItem } from "@/shared/ui";
import { APP_NAME, SUPPORT_EMAIL } from "@/shared/config";

export const metadata: Metadata = {
  title: "Politique de confidentialité (RGPD)",
  description:
    "Politique de confidentialité et de protection des données personnelles de SailingLoc : données collectées, finalités, durée de conservation et droits RGPD.",
};

const TOC: LegalTocItem[] = [
  { id: "responsable", label: "1. Responsable de traitement" },
  { id: "donnees-collectees", label: "2. Données collectées" },
  { id: "finalites", label: "3. Finalités & base légale" },
  { id: "destinataires", label: "4. Destinataires des données" },
  { id: "conservation", label: "5. Durée de conservation" },
  { id: "securite", label: "6. Sécurité des données" },
  { id: "transferts", label: "7. Transferts hors UE" },
  { id: "cookies", label: "8. Cookies" },
  { id: "droits", label: "9. Vos droits RGPD" },
  { id: "mineurs", label: "10. Protection des mineurs" },
  { id: "modifications", label: "11. Modifications" },
  { id: "contact", label: "12. Contact & réclamation" },
];

export default function ConfidentialitePage() {
  return (
    <LegalLayout
      icon="fa-user-shield"
      tag="RGPD"
      title="Politique de confidentialité"
      description={`${APP_NAME} attache une grande importance à la protection de vos données personnelles. Cette page explique, conformément au RGPD, quelles données nous collectons, pourquoi, et comment vous pouvez exercer vos droits.`}
      updated="1 août 2026"
      toc={TOC}
    >
      <div className="legal-callout">
        <i className="fa-solid fa-circle-info" aria-hidden="true" />
        <p>
          Cette politique complète nos <Link href="/cgu">Conditions Générales d&apos;Utilisation</Link> et notre{" "}
          <Link href="/cookies">Politique de cookies</Link>. Elle s&apos;applique à toute personne utilisant le
          site {APP_NAME}, qu&apos;elle soit Locataire, Propriétaire ou simple visiteur.
        </p>
      </div>

      <section id="responsable">
        <h2><i className="fa-solid fa-building" aria-hidden="true" /> 1. Responsable de traitement</h2>
        <p>
          Le responsable du traitement des données personnelles collectées sur la Plateforme est la société{" "}
          {APP_NAME}, éditrice du site. Les coordonnées complètes figurent dans nos{" "}
          <Link href="/mentions-legales">mentions légales</Link>.
        </p>
      </section>

      <section id="donnees-collectees">
        <h2><i className="fa-solid fa-database" aria-hidden="true" /> 2. Données collectées</h2>
        <ul>
          <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Données d'identification :</strong> nom, prénom, adresse e-mail, téléphone, mot de passe (chiffré).</span></li>
          <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Données de vérification :</strong> pièce d'identité, permis bateau, justificatifs (Propriétaires et Locataires).</span></li>
          <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Données de paiement :</strong> traitées par notre prestataire de paiement sécurisé, jamais stockées en clair sur nos serveurs.</span></li>
          <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Données d'usage :</strong> historique de réservations, messages échangés, avis publiés.</span></li>
          <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Données techniques :</strong> adresse IP, type d'appareil, cookies (voir notre <Link href="/cookies">politique de cookies</Link>).</span></li>
        </ul>
      </section>

      <section id="finalites">
        <h2><i className="fa-solid fa-bullseye" aria-hidden="true" /> 3. Finalités et base légale</h2>
        <table>
          <thead>
            <tr><th>Finalité</th><th>Base légale</th></tr>
          </thead>
          <tbody>
            <tr><td>Création et gestion du compte utilisateur</td><td>Exécution du contrat</td></tr>
            <tr><td>Traitement des réservations et paiements</td><td>Exécution du contrat</td></tr>
            <tr><td>Vérification d'identité et prévention de la fraude</td><td>Intérêt légitime</td></tr>
            <tr><td>Support client et messagerie</td><td>Exécution du contrat</td></tr>
            <tr><td>Statistiques d'audience et amélioration du site</td><td>Consentement (cookies)</td></tr>
            <tr><td>Communications marketing et newsletter</td><td>Consentement</td></tr>
            <tr><td>Obligations comptables et légales</td><td>Obligation légale</td></tr>
          </tbody>
        </table>
      </section>

      <section id="destinataires">
        <h2><i className="fa-solid fa-people-arrows" aria-hidden="true" /> 4. Destinataires des données</h2>
        <p>
          Vos données sont destinées aux équipes internes de {APP_NAME} habilitées, ainsi qu'à certains
          partenaires strictement nécessaires au fonctionnement du service : prestataire de paiement sécurisé,
          assureur partenaire, hébergeur du site. Ces prestataires sont contractuellement tenus de respecter la
          confidentialité et la sécurité de vos données.
        </p>
        <p>
          Les coordonnées d'un Propriétaire et d'un Locataire ne sont partagées entre eux qu'une fois la
          réservation confirmée, dans la limite nécessaire à la bonne exécution de la location.
        </p>
      </section>

      <section id="conservation">
        <h2><i className="fa-solid fa-box-archive" aria-hidden="true" /> 5. Durée de conservation</h2>
        <ul>
          <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Données de compte : conservées pendant toute la durée de vie du compte, puis 3 ans après la dernière activité.</span></li>
          <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Données de réservation et facturation : 10 ans, conformément aux obligations comptables.</span></li>
          <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Cookies et données de mesure d'audience : 13 mois maximum.</span></li>
        </ul>
      </section>

      <section id="securite">
        <h2><i className="fa-solid fa-lock" aria-hidden="true" /> 6. Sécurité des données</h2>
        <p>
          {APP_NAME} met en œuvre des mesures techniques et organisationnelles appropriées (chiffrement des
          échanges en HTTPS, hachage des mots de passe, contrôle d'accès aux données) afin de protéger vos
          données contre tout accès non autorisé, perte ou altération.
        </p>
      </section>

      <section id="transferts">
        <h2><i className="fa-solid fa-globe" aria-hidden="true" /> 7. Transferts hors Union européenne</h2>
        <p>
          Certains prestataires techniques peuvent être situés hors de l'Union européenne. Dans ce cas,
          {" "}{APP_NAME} s'assure de la mise en place de garanties appropriées (clauses contractuelles types de
          la Commission européenne, ou pays bénéficiant d'une décision d'adéquation).
        </p>
      </section>

      <section id="cookies">
        <h2><i className="fa-solid fa-cookie-bite" aria-hidden="true" /> 8. Cookies</h2>
        <p>
          Le site utilise des cookies strictement nécessaires ainsi que des cookies soumis à votre consentement
          (mesure d'audience, personnalisation). Vous pouvez gérer vos préférences à tout moment. Détails
          complets sur notre <Link href="/cookies">page dédiée aux cookies</Link>.
        </p>
      </section>

      <section id="droits">
        <h2><i className="fa-solid fa-hand" aria-hidden="true" /> 9. Vos droits RGPD</h2>
        <p>Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :</p>
        <ul>
          <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Droit d'accès :</strong> obtenir une copie des données que nous détenons sur vous.</span></li>
          <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Droit de rectification :</strong> corriger des données inexactes ou incomplètes.</span></li>
          <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Droit à l'effacement :</strong> demander la suppression de vos données, sous réserve des obligations légales de conservation.</span></li>
          <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Droit à la limitation :</strong> demander la limitation du traitement de vos données.</span></li>
          <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré et lisible.</span></li>
          <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Droit d'opposition :</strong> vous opposer à un traitement fondé sur l'intérêt légitime ou à des fins de prospection.</span></li>
          <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Droit de retirer votre consentement</strong> à tout moment, pour les traitements basés sur celui-ci.</span></li>
        </ul>
        <p>
          Pour exercer ces droits, contactez-nous à <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>{" "}
          ou depuis votre espace personnel. Une réponse vous sera apportée dans un délai maximum d'un mois.
        </p>
      </section>

      <section id="mineurs">
        <h2><i className="fa-solid fa-child-reaching" aria-hidden="true" /> 10. Protection des mineurs</h2>
        <p>
          La création d'un compte {APP_NAME} est réservée aux personnes majeures. Nous ne collectons pas
          sciemment de données concernant des mineurs.
        </p>
      </section>

      <section id="modifications">
        <h2><i className="fa-solid fa-pen" aria-hidden="true" /> 11. Modifications de la politique</h2>
        <p>
          Cette politique de confidentialité peut être mise à jour pour refléter l'évolution du service ou de la
          réglementation. La date de dernière mise à jour est indiquée en haut de cette page.
        </p>
      </section>

      <section id="contact">
        <h2><i className="fa-solid fa-envelope" aria-hidden="true" /> 12. Contact et réclamation</h2>
        <p>
          Pour toute question relative à vos données personnelles, contactez-nous à{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Si vous estimez que vos droits ne sont pas
          respectés, vous pouvez introduire une réclamation auprès de la{" "}
          <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">CNIL</a> (Commission Nationale
          de l&apos;Informatique et des Libertés).
        </p>
      </section>
    </LegalLayout>
  );
}
