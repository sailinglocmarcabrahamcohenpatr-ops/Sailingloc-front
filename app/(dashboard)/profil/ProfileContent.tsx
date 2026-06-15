"use client";

import { useAuth } from "@/shared/lib";

export default function ProfileContent() {
  const { user } = useAuth();

  const displayName = user?.name ?? "Mon compte";
  const displayEmail = user?.email ?? "";
  const displayRole = user?.role === "proprietaire" ? "Propriétaire" : "Locataire";
  const nameParts = displayName.split(" ");
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");
  const initials = user?.initials ?? displayName.slice(0, 2).toUpperCase();

  return (
    <div className="profile-grid">
      <div className="dash-card profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar-wrap">
            <div
              className="dash-sidebar-avatar"
              style={{ width: 96, height: 96, fontSize: "2rem", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--primary)", color: "#fff", fontWeight: 700 }}
              aria-hidden="true"
            >
              {initials}
            </div>
            <button className="profile-avatar-edit" aria-label="Changer la photo">
              <i className="fa-solid fa-camera" />
            </button>
          </div>
          <div>
            <h2>{displayName}</h2>
            <p><i className="fa-solid fa-sailboat" /> {displayRole} · Membre depuis 2024</p>
            <span className="profile-verified">
              <i className="fa-solid fa-circle-check" style={{ color: "var(--green)" }} /> Identité vérifiée
            </span>
          </div>
        </div>

        <div className="profile-stats">
          <div className="profile-stat"><strong>8</strong><span>Voyages</span></div>
          <div className="profile-stat"><strong>4.9 ★</strong><span>Note</span></div>
          <div className="profile-stat"><strong>1 an</strong><span>Membre</span></div>
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-card-hd"><h3>Informations personnelles</h3></div>
        <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="pf-fn">Prénom</label>
              <input id="pf-fn" type="text" defaultValue={firstName} />
            </div>
            <div className="form-group">
              <label htmlFor="pf-ln">Nom</label>
              <input id="pf-ln" type="text" defaultValue={lastName} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="pf-email">E-mail</label>
            <input id="pf-email" type="email" defaultValue={displayEmail} />
          </div>
          <div className="form-group">
            <label htmlFor="pf-phone">Téléphone</label>
            <input id="pf-phone" type="tel" defaultValue="+33 6 12 34 56 78" />
          </div>
          <div className="form-group">
            <label htmlFor="pf-location">Ville</label>
            <input id="pf-location" type="text" placeholder="Paris, France" />
          </div>
          <div className="form-group">
            <label htmlFor="pf-bio">Bio <span className="form-optional">(optionnel)</span></label>
            <textarea id="pf-bio" rows={3} placeholder="Parlez-vous aux propriétaires : expérience en voile, habitudes, etc." />
          </div>
          <button type="submit" className="btn btn-primary">
            <i className="fa-solid fa-floppy-disk" /> Enregistrer
          </button>
        </form>
      </div>

      <div className="dash-card">
        <div className="dash-card-hd"><h3>Sécurité du compte</h3></div>
        <div className="security-items">
          <div className="security-item">
            <div><strong>Mot de passe</strong><span>Modifié il y a 3 mois</span></div>
            <button className="btn btn-outline btn-sm">Changer</button>
          </div>
          <div className="security-item">
            <div><strong>Double authentification</strong><span>Non activée</span></div>
            <button className="btn btn-outline btn-sm">Activer</button>
          </div>
          <div className="security-item">
            <div><strong>Identité vérifiée</strong><span>Pièce d'identité validée</span></div>
            <span className="badge-status green"><i className="fa-solid fa-check" /> Vérifié</span>
          </div>
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-card-hd"><h3>Paiement</h3></div>
        <div className="payment-items">
          <div className="payment-method">
            <i className="fa-brands fa-cc-visa" style={{ fontSize: "1.5rem", color: "#1A1F71" }} />
            <div><strong>Visa •••• 4242</strong><span>Expire 09/2027</span></div>
            <button className="btn btn-ghost btn-sm">Supprimer</button>
          </div>
        </div>
        <button className="btn btn-outline btn-sm" style={{ marginTop: "12px" }}>
          <i className="fa-solid fa-plus" /> Ajouter un moyen de paiement
        </button>
      </div>
    </div>
  );
}
