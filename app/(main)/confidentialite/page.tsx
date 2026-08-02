import type { Metadata } from "next";
import { LocaleLink as Link } from "@/shared/i18n";
import { LegalLayout } from "@/shared/ui";
import type { LegalTocItem } from "@/shared/ui";
import { getDictionary, getRequestLocale } from "@/shared/i18n/get-dictionary";
import { APP_NAME, SUPPORT_EMAIL } from "@/shared/config";

const TOC_IDS = ["responsable", "donnees-collectees", "finalites", "destinataires", "conservation", "securite", "transferts", "cookies", "droits", "mineurs", "modifications", "contact"];
const ICONS = ["fa-building", "fa-database", "fa-bullseye", "fa-people-arrows", "fa-box-archive", "fa-lock", "fa-globe", "fa-cookie-bite", "fa-hand", "fa-child-reaching", "fa-pen", "fa-envelope"];

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getRequestLocale()).privacyPage;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function ConfidentialitePage() {
  const locale = await getRequestLocale();
  const t = getDictionary(locale).privacyPage;
  const isEN = locale === "en";
  const toc: LegalTocItem[] = TOC_IDS.map((id, i) => ({ id, label: t.toc[i] }));

  const calloutParts = t.callout.split(/\{cgu\}|\{cookies\}/);

  return (
    <LegalLayout
      icon="fa-user-shield"
      tag={t.tag}
      title={t.title}
      description={t.description}
      updated={t.updated}
      toc={toc}
    >
      <div className="legal-callout">
        <i className="fa-solid fa-circle-info" aria-hidden="true" />
        <p>
          {calloutParts[0]}
          <Link href="/cgu">{t.linkCgu}</Link>
          {calloutParts[1]}
          <Link href="/cookies">{t.linkCookies}</Link>
          {calloutParts[2]}
        </p>
      </div>

      <section id="responsable">
        <h2><i className={`fa-solid ${ICONS[0]}`} aria-hidden="true" /> {t.toc[0]}</h2>
        {isEN ? (
          <p>
            The data controller for personal data collected on the Platform is {APP_NAME}, publisher of the site. Full contact details are provided in our{" "}
            <Link href="/mentions-legales">{t.linkMentions}</Link>.
          </p>
        ) : (
          <p>
            Le responsable du traitement des données personnelles collectées sur la Plateforme est la société{" "}
            {APP_NAME}, éditrice du site. Les coordonnées complètes figurent dans nos{" "}
            <Link href="/mentions-legales">{t.linkMentions}</Link>.
          </p>
        )}
      </section>

      <section id="donnees-collectees">
        <h2><i className={`fa-solid ${ICONS[1]}`} aria-hidden="true" /> {t.toc[1]}</h2>
        {isEN ? (
          <ul>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Identification data:</strong> surname, first name, email address, phone number, password (encrypted).</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Verification data:</strong> identity document, boating licence, supporting documents (Owners and Renters).</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Payment data:</strong> processed by our secure payment provider, never stored in plain text on our servers.</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Usage data:</strong> booking history, messages exchanged, reviews published.</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Technical data:</strong> IP address, device type, cookies (see our <Link href="/cookies">{t.linkCookies}</Link>).</span></li>
          </ul>
        ) : (
          <ul>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Données d'identification :</strong> nom, prénom, adresse e-mail, téléphone, mot de passe (chiffré).</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Données de vérification :</strong> pièce d'identité, permis bateau, justificatifs (Propriétaires et Locataires).</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Données de paiement :</strong> traitées par notre prestataire de paiement sécurisé, jamais stockées en clair sur nos serveurs.</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Données d'usage :</strong> historique de réservations, messages échangés, avis publiés.</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Données techniques :</strong> adresse IP, type d'appareil, cookies (voir notre <Link href="/cookies">{t.linkCookies}</Link>).</span></li>
          </ul>
        )}
      </section>

      <section id="finalites">
        <h2><i className={`fa-solid ${ICONS[2]}`} aria-hidden="true" /> {t.toc[2]}</h2>
        <table>
          <thead>
            {isEN ? (
              <tr><th>Purpose</th><th>Legal basis</th></tr>
            ) : (
              <tr><th>Finalité</th><th>Base légale</th></tr>
            )}
          </thead>
          <tbody>
            {isEN ? (
              <>
                <tr><td>User account creation and management</td><td>Performance of contract</td></tr>
                <tr><td>Processing bookings and payments</td><td>Performance of contract</td></tr>
                <tr><td>Identity verification and fraud prevention</td><td>Legitimate interest</td></tr>
                <tr><td>Customer support and messaging</td><td>Performance of contract</td></tr>
                <tr><td>Audience analytics and site improvement</td><td>Consent (cookies)</td></tr>
                <tr><td>Marketing communications and newsletter</td><td>Consent</td></tr>
                <tr><td>Accounting and legal obligations</td><td>Legal obligation</td></tr>
              </>
            ) : (
              <>
                <tr><td>Création et gestion du compte utilisateur</td><td>Exécution du contrat</td></tr>
                <tr><td>Traitement des réservations et paiements</td><td>Exécution du contrat</td></tr>
                <tr><td>Vérification d'identité et prévention de la fraude</td><td>Intérêt légitime</td></tr>
                <tr><td>Support client et messagerie</td><td>Exécution du contrat</td></tr>
                <tr><td>Statistiques d'audience et amélioration du site</td><td>Consentement (cookies)</td></tr>
                <tr><td>Communications marketing et newsletter</td><td>Consentement</td></tr>
                <tr><td>Obligations comptables et légales</td><td>Obligation légale</td></tr>
              </>
            )}
          </tbody>
        </table>
      </section>

      <section id="destinataires">
        <h2><i className={`fa-solid ${ICONS[3]}`} aria-hidden="true" /> {t.toc[3]}</h2>
        {isEN ? (
          <>
            <p>Your data is accessed by authorised {APP_NAME} internal teams and certain partners strictly necessary for the service: our secure payment provider, insurance partner, and site hosting provider. These providers are contractually bound to respect the confidentiality and security of your data.</p>
            <p>An Owner&apos;s and a Renter&apos;s contact details are shared between them only once a booking is confirmed, to the extent necessary for the rental to take place.</p>
          </>
        ) : (
          <>
            <p>Vos données sont destinées aux équipes internes de {APP_NAME} habilitées, ainsi qu'à certains partenaires strictement nécessaires au fonctionnement du service : prestataire de paiement sécurisé, assureur partenaire, hébergeur du site. Ces prestataires sont contractuellement tenus de respecter la confidentialité et la sécurité de vos données.</p>
            <p>Les coordonnées d'un Propriétaire et d'un Locataire ne sont partagées entre eux qu'une fois la réservation confirmée, dans la limite nécessaire à la bonne exécution de la location.</p>
          </>
        )}
      </section>

      <section id="conservation">
        <h2><i className={`fa-solid ${ICONS[4]}`} aria-hidden="true" /> {t.toc[4]}</h2>
        {isEN ? (
          <ul>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Account data: retained for the lifetime of the account, then 3 years after the last activity.</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Booking and billing data: 10 years, in accordance with accounting obligations.</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Cookies and audience measurement data: maximum 13 months.</span></li>
          </ul>
        ) : (
          <ul>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Données de compte : conservées pendant toute la durée de vie du compte, puis 3 ans après la dernière activité.</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Données de réservation et facturation : 10 ans, conformément aux obligations comptables.</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Cookies et données de mesure d'audience : 13 mois maximum.</span></li>
          </ul>
        )}
      </section>

      <section id="securite">
        <h2><i className={`fa-solid ${ICONS[5]}`} aria-hidden="true" /> {t.toc[5]}</h2>
        {isEN ? (
          <p>{APP_NAME} implements appropriate technical and organisational measures (HTTPS encryption, password hashing, data access controls) to protect your data against unauthorised access, loss, or alteration.</p>
        ) : (
          <p>{APP_NAME} met en œuvre des mesures techniques et organisationnelles appropriées (chiffrement des échanges en HTTPS, hachage des mots de passe, contrôle d'accès aux données) afin de protéger vos données contre tout accès non autorisé, perte ou altération.</p>
        )}
      </section>

      <section id="transferts">
        <h2><i className={`fa-solid ${ICONS[6]}`} aria-hidden="true" /> {t.toc[6]}</h2>
        {isEN ? (
          <p>Some technical providers may be located outside the European Union. In such cases, {APP_NAME} ensures appropriate safeguards are in place (European Commission standard contractual clauses, or countries covered by an adequacy decision).</p>
        ) : (
          <p>Certains prestataires techniques peuvent être situés hors de l'Union européenne. Dans ce cas, {APP_NAME} s'assure de la mise en place de garanties appropriées (clauses contractuelles types de la Commission européenne, ou pays bénéficiant d'une décision d'adéquation).</p>
        )}
      </section>

      <section id="cookies">
        <h2><i className={`fa-solid ${ICONS[7]}`} aria-hidden="true" /> {t.toc[7]}</h2>
        {isEN ? (
          <p>The site uses strictly necessary cookies as well as cookies subject to your consent (analytics, personalisation). You can manage your preferences at any time. Full details on our{" "}<Link href="/cookies">{t.linkCookiesPage}</Link>.</p>
        ) : (
          <p>Le site utilise des cookies strictement nécessaires ainsi que des cookies soumis à votre consentement (mesure d'audience, personnalisation). Vous pouvez gérer vos préférences à tout moment. Détails complets sur notre{" "}<Link href="/cookies">{t.linkCookiesPage}</Link>.</p>
        )}
      </section>

      <section id="droits">
        <h2><i className={`fa-solid ${ICONS[8]}`} aria-hidden="true" /> {t.toc[8]}</h2>
        {isEN ? (
          <>
            <p>Under the GDPR, you have the following rights over your personal data:</p>
            <ul>
              <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Right of access:</strong> obtain a copy of the data we hold about you.</span></li>
              <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Right to rectification:</strong> correct inaccurate or incomplete data.</span></li>
              <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Right to erasure:</strong> request deletion of your data, subject to legal retention obligations.</span></li>
              <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Right to restriction:</strong> request restriction of the processing of your data.</span></li>
              <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Right to data portability:</strong> receive your data in a structured, machine-readable format.</span></li>
              <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Right to object:</strong> object to processing based on legitimate interest or for direct marketing purposes.</span></li>
              <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Right to withdraw consent</strong> at any time, for processing based on consent.</span></li>
            </ul>
            <p>To exercise these rights, contact us at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>{" "}or from your personal account. We will respond within a maximum of one month.</p>
          </>
        ) : (
          <>
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
            <p>Pour exercer ces droits, contactez-nous à <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>{" "}ou depuis votre espace personnel. Une réponse vous sera apportée dans un délai maximum d'un mois.</p>
          </>
        )}
      </section>

      <section id="mineurs">
        <h2><i className={`fa-solid ${ICONS[9]}`} aria-hidden="true" /> {t.toc[9]}</h2>
        {isEN ? (
          <p>Creating a {APP_NAME} account is restricted to adults. We do not knowingly collect data relating to minors.</p>
        ) : (
          <p>La création d'un compte {APP_NAME} est réservée aux personnes majeures. Nous ne collectons pas sciemment de données concernant des mineurs.</p>
        )}
      </section>

      <section id="modifications">
        <h2><i className={`fa-solid ${ICONS[10]}`} aria-hidden="true" /> {t.toc[10]}</h2>
        {isEN ? (
          <p>This privacy policy may be updated to reflect changes to the service or applicable regulations. The date of the last update is shown at the top of this page.</p>
        ) : (
          <p>Cette politique de confidentialité peut être mise à jour pour refléter l'évolution du service ou de la réglementation. La date de dernière mise à jour est indiquée en haut de cette page.</p>
        )}
      </section>

      <section id="contact">
        <h2><i className={`fa-solid ${ICONS[11]}`} aria-hidden="true" /> {t.toc[11]}</h2>
        {isEN ? (
          <p>
            For any question regarding your personal data, contact us at{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. If you believe your rights are not being respected, you may lodge a complaint with the{" "}
            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">{t.linkCnil}</a>{" "}
            (French data protection authority).
          </p>
        ) : (
          <p>
            Pour toute question relative à vos données personnelles, contactez-nous à{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la{" "}
            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">{t.linkCnil}</a>{" "}
            (Commission Nationale de l&apos;Informatique et des Libertés).
          </p>
        )}
      </section>
    </LegalLayout>
  );
}
