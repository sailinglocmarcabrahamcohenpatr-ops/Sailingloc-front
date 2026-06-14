import type { Metadata } from "next";
import { ListBoatForm } from "@/features/list-boat";

export const metadata: Metadata = {
  title: "Inscrire mon bateau — SailingLoc",
  description: "Commencez à louer votre bateau et générez des revenus. Inscription gratuite en 15 minutes.",
};

export default function ListBoatPage() {
  return (
    <div className="inscrire-layout">
      <div className="inscrire-aside">
        <div className="inscrire-aside-inner">
          <div className="inscrire-aside-logo">
            <i className="fa-solid fa-sailboat" /> SailingLoc
          </div>
          <h2>Gagnez jusqu'à <span>40 000 €</span> par an</h2>
          <p>Votre bateau vous attend quand vous l'utilisez. Rentabilisez-le le reste du temps.</p>
          <div className="inscrire-benefits">
            <div className="inscrire-benefit">
              <i className="fa-solid fa-check-circle" />
              <span>Inscription gratuite, sans abonnement</span>
            </div>
            <div className="inscrire-benefit">
              <i className="fa-solid fa-check-circle" />
              <span>Vous fixez vos tarifs et vos disponibilités</span>
            </div>
            <div className="inscrire-benefit">
              <i className="fa-solid fa-check-circle" />
              <span>Assurance et contrat inclus</span>
            </div>
            <div className="inscrire-benefit">
              <i className="fa-solid fa-check-circle" />
              <span>Paiement sécurisé sous 24h</span>
            </div>
            <div className="inscrire-benefit">
              <i className="fa-solid fa-check-circle" />
              <span>Support dédié aux propriétaires</span>
            </div>
          </div>
          <div className="inscrire-aside-quote">
            <p>"En louant mon voilier 3 mois l'été, je couvre les frais d'entretien de toute l'année."</p>
            <cite>— Marc D., propriétaire depuis 2022</cite>
          </div>
        </div>
      </div>
      <div className="inscrire-main">
        <ListBoatForm />
      </div>
    </div>
  );
}
