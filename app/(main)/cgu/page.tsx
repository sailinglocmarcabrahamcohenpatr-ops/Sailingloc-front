import type { Metadata } from "next";
import { LocaleLink as Link } from "@/shared/i18n";
import { LegalLayout } from "@/shared/ui";
import type { LegalTocItem } from "@/shared/ui";
import { getDictionary, getRequestLocale } from "@/shared/i18n/get-dictionary";
import { APP_NAME, SUPPORT_EMAIL } from "@/shared/config";

const TOC_IDS = ["objet", "definitions", "compte", "locataires", "proprietaires", "reservation", "annulation", "assurance", "avis", "propriete", "donnees", "resiliation", "droit", "contact"];
const ICONS = ["fa-anchor", "fa-book", "fa-user-plus", "fa-user", "fa-anchor", "fa-credit-card", "fa-rotate-left", "fa-shield-halved", "fa-star", "fa-copyright", "fa-lock", "fa-triangle-exclamation", "fa-scale-balanced", "fa-envelope"];

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getRequestLocale()).cguPage;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function CguPage() {
  const locale = await getRequestLocale();
  const t = getDictionary(locale).cguPage;
  const isEN = locale === "en";
  const toc: LegalTocItem[] = TOC_IDS.map((id, i) => ({ id, label: t.toc[i] }));

  return (
    <LegalLayout
      icon="fa-file-contract"
      tag={t.tag}
      title={t.title}
      description={t.description}
      updated={t.updated}
      toc={toc}
    >
      <section id="objet">
        <h2><i className={`fa-solid ${ICONS[0]}`} aria-hidden="true" /> {t.toc[0]}</h2>
        {isEN ? (
          <>
            <p>SailingLoc is a peer-to-peer platform enabling boat owners ("Owners") to offer their vessel for rental, and users ("Renters") to book those vessels for a fixed period.</p>
            <p>SailingLoc is neither the owner nor the lessor of any listed boat: it acts as a technical intermediary, facilitates connections, secures payment, and provides insurance included with every confirmed booking.</p>
          </>
        ) : (
          <>
            <p>{APP_NAME} est une plateforme de mise en relation entre particuliers permettant à des propriétaires de bateaux (« Propriétaires ») de proposer leur embarcation à la location, et à des utilisateurs (« Locataires ») de réserver ces embarcations pour une durée déterminée.</p>
            <p>{APP_NAME} n'est ni propriétaire, ni loueur des bateaux annoncés sur la plateforme : elle agit en qualité d'intermédiaire technique, facilite la mise en relation, sécurise le paiement et propose une assurance associée à chaque réservation confirmée.</p>
          </>
        )}
      </section>

      <section id="definitions">
        <h2><i className={`fa-solid ${ICONS[1]}`} aria-hidden="true" /> {t.toc[1]}</h2>
        {isEN ? (
          <ul>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Platform:</strong> the site and services accessible via SailingLoc.</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>User:</strong> any person registered on the Platform, whether Renter or Owner.</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Listing:</strong> the descriptive profile of a boat published by an Owner.</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Booking:</strong> the contractual commitment between a Renter and an Owner for a given period.</span></li>
          </ul>
        ) : (
          <ul>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Plateforme :</strong> le site et les services accessibles via {APP_NAME}.</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Utilisateur :</strong> toute personne inscrite sur la Plateforme, Locataire ou Propriétaire.</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Annonce :</strong> la fiche descriptive d'un bateau publiée par un Propriétaire.</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Réservation :</strong> l'engagement contractuel entre un Locataire et un Propriétaire pour une période donnée.</span></li>
          </ul>
        )}
      </section>

      <section id="compte">
        <h2><i className={`fa-solid ${ICONS[2]}`} aria-hidden="true" /> {t.toc[2]}</h2>
        {isEN ? (
          <>
            <p>Registration is free and open to any adult individual or legal entity. Each User undertakes to provide accurate and up-to-date information when creating their account (identity, contact details, payment methods) and to keep this information confidential.</p>
            <p>For rentals requiring a boating licence, the Renter must provide proof of a valid coastal or offshore licence before the booking is confirmed.</p>
          </>
        ) : (
          <>
            <p>L'inscription est gratuite et ouverte à toute personne physique majeure ou personne morale. Chaque Utilisateur s'engage à fournir des informations exactes et à jour lors de la création de son compte (identité, coordonnées, moyens de paiement) et à en assurer la confidentialité.</p>
            <p>Pour les locations nécessitant un permis bateau, le Locataire doit justifier d'un permis côtier ou hauturier valide avant la confirmation de la réservation.</p>
          </>
        )}
      </section>

      <section id="locataires">
        <h2><i className={`fa-solid ${ICONS[3]}`} aria-hidden="true" /> {t.toc[3]}</h2>
        {isEN ? (
          <ul>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Use the boat in accordance with its intended purpose, respecting navigation rules and maritime safety regulations.</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Return the boat on the agreed date, time, and location, in the condition noted at departure.</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Report without delay any incident, breakdown, or damage that occurs during the rental.</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Not sublet the boat to any third party in any form whatsoever.</span></li>
          </ul>
        ) : (
          <ul>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Utiliser le bateau conformément à sa destination, dans le respect des règles de navigation et de sécurité en mer.</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Restituer le bateau à la date, à l'heure et au lieu convenus, dans l'état constaté au départ.</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Signaler sans délai tout incident, avarie ou dommage survenu pendant la location.</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Ne pas sous-louer le bateau à un tiers, sous quelque forme que ce soit.</span></li>
          </ul>
        )}
      </section>

      <section id="proprietaires">
        <h2><i className={`fa-solid ${ICONS[4]}`} aria-hidden="true" /> {t.toc[4]}</h2>
        {isEN ? (
          <ul>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Publish an honest and up-to-date listing (photos, equipment, condition of the boat, availability).</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Provide a boat in good seaworthy condition, compliant with applicable safety standards.</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Hold all required documents and insurance for the boat to be rented out.</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Respond to booking requests within a reasonable time.</span></li>
          </ul>
        ) : (
          <ul>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Publier une annonce sincère et à jour (photos, équipements, état du bateau, disponibilités).</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Mettre à disposition un bateau en bon état de navigabilité, conforme aux normes de sécurité en vigueur.</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Détenir les documents et assurances nécessaires à l'exploitation du bateau en location.</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Répondre aux demandes de réservation dans un délai raisonnable.</span></li>
          </ul>
        )}
      </section>

      <section id="reservation">
        <h2><i className={`fa-solid ${ICONS[5]}`} aria-hidden="true" /> {t.toc[5]}</h2>
        {isEN ? (
          <>
            <p>Every confirmed booking is subject to secure online payment. Funds are held by SailingLoc until embarkation, then released to the Owner within 24 hours, after deduction of the service commission.</p>
            <table>
              <thead><tr><th>Party</th><th>Commission</th></tr></thead>
              <tbody>
                <tr><td>Owner</td><td>15% of rental amount</td></tr>
                <tr><td>Renter</td><td>8% service fee</td></tr>
              </tbody>
            </table>
            <p>A security deposit is taken by card pre-authorisation at the time of booking and released within 5 business days of the boat being returned in good condition.</p>
          </>
        ) : (
          <>
            <p>Toute réservation confirmée fait l'objet d'un paiement en ligne sécurisé. Les fonds sont conservés par {APP_NAME} jusqu'à l'embarquement, puis reversés au Propriétaire sous 24h, déduction faite de la commission de service.</p>
            <table>
              <thead><tr><th>Partie</th><th>Commission</th></tr></thead>
              <tbody>
                <tr><td>Propriétaire</td><td>15 % du montant de la location</td></tr>
                <tr><td>Locataire</td><td>8 % de frais de service</td></tr>
              </tbody>
            </table>
            <p>Une caution est prélevée par empreinte bancaire lors de la réservation et restituée dans les 5 jours ouvrés suivant le retour du bateau en bon état.</p>
          </>
        )}
      </section>

      <section id="annulation">
        <h2><i className={`fa-solid ${ICONS[6]}`} aria-hidden="true" /> {t.toc[6]}</h2>
        {isEN ? (
          <ul>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Cancellation more than 30 days before departure: 100% refund.</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Cancellation between 15 and 30 days before departure: 50% refund.</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Cancellation less than 15 days before departure: no refund, unless agreed by the Owner.</span></li>
          </ul>
        ) : (
          <ul>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Annulation à plus de 30 jours du départ : remboursement à 100 %.</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Annulation entre 15 et 30 jours du départ : remboursement à 50 %.</span></li>
            <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Annulation à moins de 15 jours du départ : aucun remboursement, sauf accord du Propriétaire.</span></li>
          </ul>
        )}
      </section>

      <section id="assurance">
        <h2><i className={`fa-solid ${ICONS[7]}`} aria-hidden="true" /> {t.toc[7]}</h2>
        {isEN ? (
          <>
            <p>Every confirmed booking via SailingLoc includes insurance covering the Renter&apos;s civil liability and material damage to the boat, in European waters and subject to the conditions detailed at the time of booking.</p>
            <p>SailingLoc shall not be liable for damages resulting from use of the boat that does not comply with these Terms, maritime regulations, or the Owner&apos;s instructions.</p>
          </>
        ) : (
          <>
            <p>Chaque réservation confirmée via {APP_NAME} inclut une assurance couvrant la responsabilité civile du Locataire ainsi que les dommages matériels causés au bateau, dans les eaux européennes et selon les conditions détaillées lors de la réservation.</p>
            <p>{APP_NAME} ne saurait être tenue responsable des dommages résultant d'une utilisation du bateau non conforme aux présentes CGU, à la réglementation maritime, ou aux instructions du Propriétaire.</p>
          </>
        )}
      </section>

      <section id="avis">
        <h2><i className={`fa-solid ${ICONS[8]}`} aria-hidden="true" /> {t.toc[8]}</h2>
        {isEN ? (
          <p>Only Users who have actually completed a rental may leave a review. Reviews must be honest, respectful, and must not contain defamatory, abusive, or misleading content. SailingLoc reserves the right to moderate or remove any content contrary to these principles.</p>
        ) : (
          <p>Seuls les Utilisateurs ayant effectivement réalisé une location peuvent déposer un avis. Les avis doivent être sincères, respectueux et ne contenir aucun propos diffamatoire, injurieux ou trompeur. {APP_NAME} se réserve le droit de modérer ou supprimer tout contenu contraire à ces principes.</p>
        )}
      </section>

      <section id="propriete">
        <h2><i className={`fa-solid ${ICONS[9]}`} aria-hidden="true" /> {t.toc[9]}</h2>
        {isEN ? (
          <p>All elements of the Platform (brand, logo, visual identity, texts, database) are protected by intellectual property law and remain the exclusive property of SailingLoc, with the exception of content published by Users (photos, listing descriptions).</p>
        ) : (
          <p>L'ensemble des éléments de la Plateforme (marque, logo, charte graphique, textes, base de données) est protégé par le droit de la propriété intellectuelle et demeure la propriété exclusive de {APP_NAME}, à l'exception des contenus publiés par les Utilisateurs (photos, descriptions d'annonces).</p>
        )}
      </section>

      <section id="donnees">
        <h2><i className={`fa-solid ${ICONS[10]}`} aria-hidden="true" /> {t.toc[10]}</h2>
        {isEN ? (
          <p>The processing of Users&apos; personal data is described in detail in our{" "}<Link href="/confidentialite">{t.linkPrivacy}</Link>, in compliance with the General Data Protection Regulation (GDPR).</p>
        ) : (
          <p>Le traitement des données personnelles des Utilisateurs est décrit en détail dans notre{" "}<Link href="/confidentialite">{t.linkPrivacy}</Link>, conforme au Règlement Général sur la Protection des Données (RGPD).</p>
        )}
      </section>

      <section id="resiliation">
        <h2><i className={`fa-solid ${ICONS[11]}`} aria-hidden="true" /> {t.toc[11]}</h2>
        {isEN ? (
          <p>SailingLoc may suspend or delete, without notice, the account of a User who seriously breaches these Terms (fraud, false listing, dangerous behaviour, dishonest reviews). Users may delete their account at any time from their personal account area.</p>
        ) : (
          <p>{APP_NAME} peut suspendre ou supprimer, sans préavis, le compte d'un Utilisateur en cas de manquement grave aux présentes CGU (fraude, fausse annonce, comportement dangereux, avis mensongers). L'Utilisateur peut à tout moment supprimer son compte depuis son espace personnel.</p>
        )}
      </section>

      <section id="droit">
        <h2><i className={`fa-solid ${ICONS[12]}`} aria-hidden="true" /> {t.toc[12]}</h2>
        {isEN ? (
          <p>These Terms are governed by French law. In the event of a dispute, Users are invited to contact SailingLoc support first to seek an amicable resolution. Failing that, French courts shall have sole jurisdiction.</p>
        ) : (
          <p>Les présentes CGU sont soumises au droit français. En cas de litige, les Utilisateurs sont invités à contacter en priorité le support {APP_NAME} afin de rechercher une solution amiable. À défaut, les tribunaux français seront seuls compétents.</p>
        )}
      </section>

      <section id="contact">
        <h2><i className={`fa-solid ${ICONS[13]}`} aria-hidden="true" /> {t.toc[13]}</h2>
        {isEN ? (
          <p>For any question relating to these Terms, contact us at{" "}<a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>{" "}or via our <Link href="/contact">{t.linkContact}</Link>.</p>
        ) : (
          <p>Pour toute question relative aux présentes CGU, contactez-nous à l'adresse{" "}<a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>{" "}ou via notre <Link href="/contact">{t.linkContact}</Link>.</p>
        )}
      </section>
    </LegalLayout>
  );
}
