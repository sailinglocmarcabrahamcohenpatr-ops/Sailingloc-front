import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/shared/ui";
import type { LegalTocItem } from "@/shared/ui";
import { APP_NAME, SUPPORT_EMAIL } from "@/shared/config";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
  description:
    "Conditions générales d'utilisation de SailingLoc : inscription, réservation, obligations des locataires et propriétaires, annulation, responsabilité.",
};

const TOC: LegalTocItem[] = [
  { id: "objet", label: "1. Objet" },
  { id: "definitions", label: "2. Définitions" },
  { id: "compte", label: "3. Création de compte" },
  { id: "locataires", label: "4. Obligations locataires" },
  { id: "proprietaires", label: "5. Obligations propriétaires" },
  { id: "reservation", label: "6. Réservation & paiement" },
  { id: "annulation", label: "7. Annulation & remboursement" },
  { id: "assurance", label: "8. Assurance & responsabilité" },
  { id: "avis", label: "9. Avis & contenus" },
  { id: "propriete", label: "10. Propriété intellectuelle" },
  { id: "donnees", label: "11. Données personnelles" },
  { id: "resiliation", label: "12. Suspension & résiliation" },
  { id: "droit", label: "13. Droit applicable" },
  { id: "contact", label: "14. Contact" },
];

export default function CguPage() {
  return (
    <LegalLayout
      icon="fa-file-contract"
      tag="Conditions Générales d'Utilisation"
      title="Conditions Générales d'Utilisation"
      description={`Les présentes CGU régissent l'utilisation de la plateforme ${APP_NAME} par les locataires et les propriétaires de bateaux. En créant un compte ou en utilisant le site, vous acceptez ces conditions sans réserve.`}
      updated="1 août 2026"
      toc={TOC}
    >
      <section id="objet">
        <h2><i className="fa-solid fa-anchor" aria-hidden="true" /> 1. Objet</h2>
        <p>
          {APP_NAME} est une plateforme de mise en relation entre particuliers permettant à des propriétaires
          de bateaux (« Propriétaires ») de proposer leur embarcation à la location, et à des utilisateurs
          (« Locataires ») de réserver ces embarcations pour une durée déterminée.
        </p>
        <p>
          {APP_NAME} n'est ni propriétaire, ni loueur des bateaux annoncés sur la plateforme : elle agit en
          qualité d'intermédiaire technique, facilite la mise en relation, sécurise le paiement et propose une
          assurance associée à chaque réservation confirmée.
        </p>
      </section>

      <section id="definitions">
        <h2><i className="fa-solid fa-book" aria-hidden="true" /> 2. Définitions</h2>
        <ul>
          <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Plateforme :</strong> le site et les services accessibles via {APP_NAME}.</span></li>
          <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Utilisateur :</strong> toute personne inscrite sur la Plateforme, Locataire ou Propriétaire.</span></li>
          <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Annonce :</strong> la fiche descriptive d'un bateau publiée par un Propriétaire.</span></li>
          <li><i className="fa-solid fa-circle" aria-hidden="true" /><span><strong>Réservation :</strong> l'engagement contractuel entre un Locataire et un Propriétaire pour une période donnée.</span></li>
        </ul>
      </section>

      <section id="compte">
        <h2><i className="fa-solid fa-user-plus" aria-hidden="true" /> 3. Création de compte</h2>
        <p>
          L'inscription est gratuite et ouverte à toute personne physique majeure ou personne morale. Chaque
          Utilisateur s'engage à fournir des informations exactes et à jour lors de la création de son compte
          (identité, coordonnées, moyens de paiement) et à en assurer la confidentialité.
        </p>
        <p>
          Pour les locations nécessitant un permis bateau, le Locataire doit justifier d'un permis côtier ou
          hauturier valide avant la confirmation de la réservation.
        </p>
      </section>

      <section id="locataires">
        <h2><i className="fa-solid fa-user" aria-hidden="true" /> 4. Obligations des locataires</h2>
        <ul>
          <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Utiliser le bateau conformément à sa destination, dans le respect des règles de navigation et de sécurité en mer.</span></li>
          <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Restituer le bateau à la date, à l'heure et au lieu convenus, dans l'état constaté au départ.</span></li>
          <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Signaler sans délai tout incident, avarie ou dommage survenu pendant la location.</span></li>
          <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Ne pas sous-louer le bateau à un tiers, sous quelque forme que ce soit.</span></li>
        </ul>
      </section>

      <section id="proprietaires">
        <h2><i className="fa-solid fa-anchor" aria-hidden="true" /> 5. Obligations des propriétaires</h2>
        <ul>
          <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Publier une annonce sincère et à jour (photos, équipements, état du bateau, disponibilités).</span></li>
          <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Mettre à disposition un bateau en bon état de navigabilité, conforme aux normes de sécurité en vigueur.</span></li>
          <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Détenir les documents et assurances nécessaires à l'exploitation du bateau en location.</span></li>
          <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Répondre aux demandes de réservation dans un délai raisonnable.</span></li>
        </ul>
      </section>

      <section id="reservation">
        <h2><i className="fa-solid fa-credit-card" aria-hidden="true" /> 6. Réservation, paiement et commissions</h2>
        <p>
          Toute réservation confirmée fait l'objet d'un paiement en ligne sécurisé. Les fonds sont conservés par
          {" "}{APP_NAME} jusqu'à l'embarquement, puis reversés au Propriétaire sous 24h, déduction faite de la
          commission de service.
        </p>
        <table>
          <thead>
            <tr><th>Partie</th><th>Commission</th></tr>
          </thead>
          <tbody>
            <tr><td>Propriétaire</td><td>15 % du montant de la location</td></tr>
            <tr><td>Locataire</td><td>8 % de frais de service</td></tr>
          </tbody>
        </table>
        <p>
          Une caution est prélevée par empreinte bancaire lors de la réservation et restituée dans les 5 jours
          ouvrés suivant le retour du bateau en bon état.
        </p>
      </section>

      <section id="annulation">
        <h2><i className="fa-solid fa-rotate-left" aria-hidden="true" /> 7. Annulation et remboursement</h2>
        <ul>
          <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Annulation à plus de 30 jours du départ : remboursement à 100 %.</span></li>
          <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Annulation entre 15 et 30 jours du départ : remboursement à 50 %.</span></li>
          <li><i className="fa-solid fa-circle" aria-hidden="true" /><span>Annulation à moins de 15 jours du départ : aucun remboursement, sauf accord du Propriétaire.</span></li>
        </ul>
      </section>

      <section id="assurance">
        <h2><i className="fa-solid fa-shield-halved" aria-hidden="true" /> 8. Assurance et responsabilité</h2>
        <p>
          Chaque réservation confirmée via {APP_NAME} inclut une assurance couvrant la responsabilité civile du
          Locataire ainsi que les dommages matériels causés au bateau, dans les eaux européennes et selon les
          conditions détaillées lors de la réservation.
        </p>
        <p>
          {APP_NAME} ne saurait être tenue responsable des dommages résultant d'une utilisation du bateau non
          conforme aux présentes CGU, à la réglementation maritime, ou aux instructions du Propriétaire.
        </p>
      </section>

      <section id="avis">
        <h2><i className="fa-solid fa-star" aria-hidden="true" /> 9. Avis et contenus</h2>
        <p>
          Seuls les Utilisateurs ayant effectivement réalisé une location peuvent déposer un avis. Les avis
          doivent être sincères, respectueux et ne contenir aucun propos diffamatoire, injurieux ou trompeur.
          {APP_NAME} se réserve le droit de modérer ou supprimer tout contenu contraire à ces principes.
        </p>
      </section>

      <section id="propriete">
        <h2><i className="fa-solid fa-copyright" aria-hidden="true" /> 10. Propriété intellectuelle</h2>
        <p>
          L'ensemble des éléments de la Plateforme (marque, logo, charte graphique, textes, base de données) est
          protégé par le droit de la propriété intellectuelle et demeure la propriété exclusive de {APP_NAME},
          à l'exception des contenus publiés par les Utilisateurs (photos, descriptions d'annonces).
        </p>
      </section>

      <section id="donnees">
        <h2><i className="fa-solid fa-lock" aria-hidden="true" /> 11. Données personnelles</h2>
        <p>
          Le traitement des données personnelles des Utilisateurs est décrit en détail dans notre{" "}
          <Link href="/confidentialite">Politique de confidentialité</Link>, conforme au Règlement Général sur
          la Protection des Données (RGPD).
        </p>
      </section>

      <section id="resiliation">
        <h2><i className="fa-solid fa-triangle-exclamation" aria-hidden="true" /> 12. Suspension et résiliation</h2>
        <p>
          {APP_NAME} peut suspendre ou supprimer, sans préavis, le compte d'un Utilisateur en cas de manquement
          grave aux présentes CGU (fraude, fausse annonce, comportement dangereux, avis mensongers). L'Utilisateur
          peut à tout moment supprimer son compte depuis son espace personnel.
        </p>
      </section>

      <section id="droit">
        <h2><i className="fa-solid fa-scale-balanced" aria-hidden="true" /> 13. Droit applicable et litiges</h2>
        <p>
          Les présentes CGU sont soumises au droit français. En cas de litige, les Utilisateurs sont invités à
          contacter en priorité le support {APP_NAME} afin de rechercher une solution amiable. À défaut, les
          tribunaux français seront seuls compétents.
        </p>
      </section>

      <section id="contact">
        <h2><i className="fa-solid fa-envelope" aria-hidden="true" /> 14. Contact</h2>
        <p>
          Pour toute question relative aux présentes CGU, contactez-nous à l'adresse{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> ou via notre{" "}
          <Link href="/contact">page de contact</Link>.
        </p>
      </section>
    </LegalLayout>
  );
}
