"use client";

import { useState } from "react";
import StarPicker from "./StarPicker";
import { submitBoatRating } from "../api/rate";
import { EMPTY_RATING, type RatingFormValues } from "../model/types";
import type { AvisAPI } from "@/shared/lib";

interface RatingFormProps {
  reservationId: number;
  boatName: string;
  onClose: () => void;
  onSuccess: (avis: AvisAPI) => void;
}

export default function RatingForm({ reservationId, boatName, onClose, onSuccess }: RatingFormProps) {
  const [values, setValues] = useState<RatingFormValues>(EMPTY_RATING);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof RatingFormValues) => (v: number) => setValues((prev) => ({ ...prev, [key]: v }));

  const complete = values.noteProprietaire > 0 && values.noteBateau > 0 && values.noteLieu > 0;
  const average = complete
    ? Math.round((values.noteProprietaire + values.noteBateau + values.noteLieu) / 3)
    : 0;

  const handleSubmit = async () => {
    if (!complete || submitting) return;
    setSubmitting(true);
    setError("");
    const result = await submitBoatRating(reservationId, values);
    setSubmitting(false);
    if (result.success && result.avis) {
      onSuccess(result.avis);
    } else {
      setError(result.error ?? "Une erreur est survenue.");
    }
  };

  return (
    <div
      className="rating-modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget && !submitting) onClose(); }}
    >
      <div className="rating-modal" role="dialog" aria-modal="true" aria-label="Noter cette location">
        <div className="rating-modal-header">
          <h2>
            <i className="fa-solid fa-star" aria-hidden="true" /> Noter votre location
          </h2>
          <button className="rating-modal-close" onClick={onClose} disabled={submitting} aria-label="Fermer">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <p className="rating-modal-boat">{boatName}</p>

        <div className="rating-modal-body">
          <StarPicker label="Le propriétaire" icon="fa-user" value={values.noteProprietaire} onChange={set("noteProprietaire")} />
          <StarPicker label="Le bateau" icon="fa-sailboat" value={values.noteBateau} onChange={set("noteBateau")} />
          <StarPicker label="Le lieu visité" icon="fa-map-location-dot" value={values.noteLieu} onChange={set("noteLieu")} />

          {complete && (
            <div className="rating-modal-average">
              Note globale : <strong>{average}/5</strong>
              <span className="stars">
                {[1, 2, 3, 4, 5].map((n) => (
                  <i key={n} className={n <= average ? "fa-solid fa-star" : "fa-regular fa-star"} aria-hidden="true" />
                ))}
              </span>
            </div>
          )}

          <label className="rating-modal-comment-label" htmlFor="rating-comment">Votre commentaire</label>
          <textarea
            id="rating-comment"
            className="rating-modal-textarea"
            rows={4}
            maxLength={1000}
            placeholder="Partagez votre expérience avec les prochains locataires…"
            value={values.commentaire}
            onChange={(e) => setValues((prev) => ({ ...prev, commentaire: e.target.value }))}
          />

          {error && <p className="rating-modal-error">{error}</p>}
        </div>

        <div className="rating-modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={submitting}>Annuler</button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!complete || !values.commentaire.trim() || submitting}
          >
            {submitting ? "Envoi…" : "Publier ma notation"}
          </button>
        </div>
      </div>
    </div>
  );
}
