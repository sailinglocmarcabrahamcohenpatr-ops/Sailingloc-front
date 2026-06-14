"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BOAT_TYPES } from "@/shared/config";
import type { BoatType } from "@/shared/types";

const STEPS = ["Type & infos", "Photos & description", "Tarifs", "Disponibilités", "Récapitulatif"];

export default function ListBoatForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [type, setType] = useState<BoatType>("voilier");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [length, setLength] = useState("");
  const [capacity, setCapacity] = useState("");
  const [cabins, setCabins] = useState("");
  const [year, setYear] = useState("");
  const [license, setLicense] = useState("Requis");
  const [description, setDescription] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [weeklyDiscount, setWeeklyDiscount] = useState("10");
  const [caution, setCaution] = useState("2000");

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    router.push("/proprietaire/bateaux");
  };

  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <form className="list-boat-form" onSubmit={handleSubmit} noValidate>
      <div className="form-wizard">
        <div className="form-wizard-steps">
          {STEPS.map((s, i) => (
            <div key={s} className={`wizard-step${i <= step ? " done" : ""}${i === step ? " current" : ""}`}>
              <div className="wizard-dot">{i < step ? <i className="fa-solid fa-check" /> : i + 1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>
        <div className="form-wizard-progress">
          <div className="form-wizard-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="list-boat-body">
        {step === 0 && (
          <div className="form-section">
            <h3>Type de bateau</h3>
            <div className="boat-type-select-grid">
              {BOAT_TYPES.filter((b) => b.value !== "tous").map((bt) => (
                <button
                  key={bt.value}
                  type="button"
                  className={`boat-type-select-btn${type === bt.value ? " active" : ""}`}
                  onClick={() => setType(bt.value)}
                >
                  <span className="icon">{bt.icon}</span>
                  {bt.label}
                </button>
              ))}
            </div>
            <h3>Informations techniques</h3>
            <div className="form-group">
              <label htmlFor="lb-name">Nom du bateau *</label>
              <input id="lb-name" type="text" placeholder="Ex: Sun Odyssey 440" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="lb-location">Port d'attache *</label>
                <input id="lb-location" type="text" placeholder="Ex: Marseille, Vieux-Port" value={location} onChange={(e) => setLocation(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="lb-year">Année de construction</label>
                <input id="lb-year" type="number" placeholder="2020" min="1970" max="2025" value={year} onChange={(e) => setYear(e.target.value)} />
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label htmlFor="lb-length">Longueur (m)</label>
                <input id="lb-length" type="text" placeholder="10.5" value={length} onChange={(e) => setLength(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="lb-capacity">Capacité (pers.)</label>
                <input id="lb-capacity" type="number" placeholder="6" min="1" max="30" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="lb-cabins">Cabines</label>
                <input id="lb-cabins" type="number" placeholder="2" min="0" max="10" value={cabins} onChange={(e) => setCabins(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Permis requis</label>
              <div className="radio-group">
                {["Requis", "Non requis"].map((v) => (
                  <label key={v} className="radio-label">
                    <input type="radio" name="license" value={v} checked={license === v} onChange={() => setLicense(v)} />
                    {v}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="form-section">
            <h3>Photos de votre bateau</h3>
            <div className="photo-upload-zone">
              <i className="fa-solid fa-cloud-arrow-up" />
              <p><strong>Glissez vos photos ici</strong> ou cliquez pour sélectionner</p>
              <small>JPG, PNG — Max 10 Mo par photo — Minimum 3 photos</small>
              <button type="button" className="btn btn-outline btn-sm">
                <i className="fa-solid fa-image" /> Choisir des photos
              </button>
            </div>
            <div className="photo-tips">
              <h4>Conseils pour de bonnes photos</h4>
              <ul>
                <li><i className="fa-solid fa-check" style={{ color: "var(--green)" }} /> Photo depuis l'arrière du bateau en mer</li>
                <li><i className="fa-solid fa-check" style={{ color: "var(--green)" }} /> Cockpit et poste de barre</li>
                <li><i className="fa-solid fa-check" style={{ color: "var(--green)" }} /> Cabine principale bien éclairée</li>
                <li><i className="fa-solid fa-check" style={{ color: "var(--green)" }} /> Cuisine et salle de bain</li>
              </ul>
            </div>
            <div className="form-group" style={{ marginTop: "32px" }}>
              <label htmlFor="lb-desc">Description *</label>
              <textarea
                id="lb-desc"
                rows={6}
                placeholder="Décrivez votre bateau : ses atouts, son histoire, les zones de navigation idéales, le matériel inclus…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <small className="form-hint">{description.length}/2000 caractères (minimum 100 recommandés)</small>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="form-section">
            <h3>Tarification</h3>
            <div className="form-group">
              <label htmlFor="lb-price">Prix par jour (€) *</label>
              <div className="input-prefix-wrap">
                <span className="input-prefix">€</span>
                <input id="lb-price" type="number" placeholder="350" min="10" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} required />
              </div>
              <small className="form-hint">Bateaux similaires sur SailingLoc : 200 € – 900 € / jour</small>
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="lb-weekly">Remise semaine (%)</label>
                <div className="input-suffix-wrap">
                  <input id="lb-weekly" type="number" placeholder="10" min="0" max="50" value={weeklyDiscount} onChange={(e) => setWeeklyDiscount(e.target.value)} />
                  <span className="input-suffix">%</span>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="lb-caution">Caution (€)</label>
                <div className="input-prefix-wrap">
                  <span className="input-prefix">€</span>
                  <input id="lb-caution" type="number" placeholder="2000" min="0" value={caution} onChange={(e) => setCaution(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="price-estimate">
              <div className="price-estimate-title">Estimation mensuelle</div>
              <div className="price-estimate-row">
                <span>4 semaines × {pricePerDay ? `${pricePerDay} € × 7 j` : "—"}</span>
                <strong>{pricePerDay ? `${(parseInt(pricePerDay) * 28 * 0.85).toLocaleString("fr-FR")} €` : "—"}</strong>
              </div>
              <small>Après commission SailingLoc (15 %) et frais de service</small>
            </div>
            <div className="form-group" style={{ marginTop: "24px" }}>
              <label>Services inclus</label>
              <div className="checkbox-group">
                {["Linge de bord", "Kit de sécurité", "Carburant inclus", "Skipper disponible", "Cours de voile", "Transfert aéroport"].map((s) => (
                  <label key={s} className="checkbox-label">
                    <input type="checkbox" /> {s}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="form-section">
            <h3>Disponibilités</h3>
            <p className="form-section-desc">Définissez les périodes où votre bateau est disponible à la location.</p>
            <div className="availability-mock">
              <div className="availability-calendar-placeholder">
                <i className="fa-regular fa-calendar" />
                <p>Calendrier de disponibilités</p>
                <small>Sélectionnez les mois disponibles pour la location</small>
                <div className="month-grid">
                  {["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"].map((m) => (
                    <label key={m} className="month-btn-label">
                      <input type="checkbox" defaultChecked={["Mai", "Juin", "Juil", "Aoû", "Sep"].includes(m)} />
                      {m}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Durée minimale de location</label>
              <div className="radio-group">
                {["1 jour", "3 jours", "1 semaine", "2 semaines"].map((v) => (
                  <label key={v} className="radio-label">
                    <input type="radio" name="min-duration" value={v} defaultChecked={v === "1 semaine"} />
                    {v}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="form-section">
            <h3>Récapitulatif de votre annonce</h3>
            <div className="list-boat-recap">
              <div className="recap-row">
                <span><i className="fa-solid fa-sailboat" /> Type</span>
                <strong>{BOAT_TYPES.find((b) => b.value === type)?.label ?? type}</strong>
              </div>
              <div className="recap-row">
                <span><i className="fa-solid fa-tag" /> Nom</span>
                <strong>{name || "—"}</strong>
              </div>
              <div className="recap-row">
                <span><i className="fa-solid fa-location-dot" /> Port d'attache</span>
                <strong>{location || "—"}</strong>
              </div>
              <div className="recap-row">
                <span><i className="fa-solid fa-euro-sign" /> Prix / jour</span>
                <strong>{pricePerDay ? `${pricePerDay} €` : "—"}</strong>
              </div>
              <div className="recap-row">
                <span><i className="fa-solid fa-percent" /> Remise semaine</span>
                <strong>{weeklyDiscount}%</strong>
              </div>
              <div className="recap-row">
                <span><i className="fa-solid fa-shield-halved" /> Caution</span>
                <strong>{caution ? `${caution} €` : "—"}</strong>
              </div>
            </div>
            <div className="list-boat-cgv">
              <label className="checkbox-label">
                <input type="checkbox" required />
                <span>
                  J'accepte les <a href="#" className="auth-link">conditions pour les propriétaires</a> et je certifie être le propriétaire ou le représentant légal de ce bateau.
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="form-wizard-nav">
        {step > 0 && (
          <button type="button" className="btn btn-outline" onClick={prev}>
            <i className="fa-solid fa-arrow-left" /> Retour
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button type="button" className="btn btn-primary" onClick={next}>
            Continuer <i className="fa-solid fa-arrow-right" />
          </button>
        ) : (
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <><i className="fa-solid fa-circle-notch fa-spin" /> Publication…</> : <><i className="fa-solid fa-paper-plane" /> Publier mon annonce</>}
          </button>
        )}
      </div>
    </form>
  );
}
