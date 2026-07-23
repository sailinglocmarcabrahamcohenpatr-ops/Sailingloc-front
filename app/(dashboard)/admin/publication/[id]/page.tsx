"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { boatsApi, resolvePhotoUrl, StatutBateau, reservationsApi } from "@/shared/lib";
import type { BoatAPI, DocumentAPI, AvisAPI, ReservationAPI } from "@/shared/lib";
import "../../../proprietaire/dashboard.css";
import "../../publication/publication.css";

/* ── Helpers ── */
function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit", month: "long", year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function formatPrice(val?: string | number | null) {
  if (val == null) return "—";
  const n = typeof val === "string" ? parseFloat(val) : val;
  return isNaN(n) ? "—" : `${n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €`;
}

function docLabel(doc: DocumentAPI): string {
  if (doc.nom) return doc.nom;
  if (doc.typeDocument?.labelTypeDocument) return doc.typeDocument.labelTypeDocument;
  const ext = doc.urlDocument?.split(".").pop()?.toUpperCase();
  return ext ? `Document (${ext})` : "Document";
}

function docIcon(doc: DocumentAPI): string {
  const ext = doc.urlDocument?.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "fa-file-pdf";
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext ?? "")) return "fa-file-image";
  return "fa-file-lines";
}

function isImageUrl(url: string) {
  return /\.(jpe?g|png|webp|gif|bmp|svg)$/i.test(url);
}

function isPdfUrl(url: string) {
  return /\.pdf$/i.test(url);
}

function starArr(note: number) {
  return Array.from({ length: 5 }, (_, i) => i < Math.round(note));
}

/* ── Stat for owner ── */
interface OwnerStats {
  boatCount: number;
}

/* ── Document viewer modal ── */
function DocViewerModal({
  doc,
  onClose,
}: {
  doc: DocumentAPI;
  onClose: () => void;
}) {
  const url   = resolvePhotoUrl(doc.urlDocument ?? "");
  const label = docLabel(doc);

  return (
    <div
      className="pub-doc-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div className="pub-doc-modal">
        <div className="pub-doc-modal-header">
          <strong>{label}</strong>
          <button
            className="pub-doc-modal-close"
            onClick={onClose}
            aria-label="Fermer"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="pub-doc-modal-body">
          {isPdfUrl(doc.urlDocument ?? "") ? (
            <iframe
              src={url}
              className="pub-doc-modal-iframe"
              title={label}
            />
          ) : isImageUrl(doc.urlDocument ?? "") ? (
            <img
              src={url}
              alt={label}
              className="pub-doc-modal-img"
            />
          ) : (
            <div className="pub-doc-modal-unsupported">
              <i className="fa-solid fa-file" />
              <p>Aperçu non disponible pour ce type de fichier.</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-primary"
                style={{ marginTop: 12, display: "inline-flex" }}
              >
                <i className="fa-solid fa-download" />
                Télécharger
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Confirm action modal ── */
function ConfirmModal({
  title,
  message,
  confirmLabel,
  danger,
  loading,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="pub-confirm-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="pub-confirm-modal">
        <div className="pub-confirm-modal-header">
          <div className={`pub-confirm-modal-icon ${danger ? "red" : "green"}`}>
            <i className={`fa-solid ${danger ? "fa-ban" : "fa-circle-check"}`} />
          </div>
          <h2>{title}</h2>
          <p>{message}</p>
        </div>
        <div className="pub-confirm-modal-footer">
          <button
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={loading}
          >
            Annuler
          </button>
          <button
            className={`btn ${danger ? "btn-danger" : "btn-primary"}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="pub-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                En cours…
              </>
            ) : (
              <>
                <i className={`fa-solid ${danger ? "fa-ban" : "fa-circle-check"}`} />
                {confirmLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Photo lightbox ── */
function PhotoLightbox({
  photos,
  index,
  boatName,
  onClose,
  onPrev,
  onNext,
}: {
  photos: { id: number; url: string; description?: string }[];
  index: number;
  boatName: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const photo = photos[index];
  const url   = resolvePhotoUrl(photo.url);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape")      onClose();
      if (e.key === "ArrowLeft")   onPrev();
      if (e.key === "ArrowRight")  onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="pub-lightbox-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} sur ${photos.length}`}
    >
      {/* Close */}
      <button className="pub-lightbox-close" onClick={onClose} aria-label="Fermer">
        <i className="fa-solid fa-xmark" />
      </button>

      {/* Prev */}
      {photos.length > 1 && (
        <button className="pub-lightbox-nav pub-lightbox-prev" onClick={onPrev} aria-label="Photo précédente">
          <i className="fa-solid fa-chevron-left" />
        </button>
      )}

      {/* Image */}
      <div className="pub-lightbox-img-wrap">
        <img
          src={url}
          alt={photo.description ?? boatName}
          className="pub-lightbox-img"
        />
        <div className="pub-lightbox-caption">
          {photo.description ?? boatName}
          <span className="pub-lightbox-counter">{index + 1} / {photos.length}</span>
        </div>
      </div>

      {/* Next */}
      {photos.length > 1 && (
        <button className="pub-lightbox-nav pub-lightbox-next" onClick={onNext} aria-label="Photo suivante">
          <i className="fa-solid fa-chevron-right" />
        </button>
      )}
    </div>
  );
}

/* ── Toast ── */
function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div className={`pub-toast ${type}`}>
      <i className={`fa-solid ${type === "success" ? "fa-circle-check" : "fa-triangle-exclamation"}`} />
      {message}
    </div>
  );
}

/* ── Main component ── */
export default function AdminPublicationDetailPage() {
  const router  = useRouter();
  const params  = useParams<{ id: string }>();
  const boatId  = params.id;

  const [boat, setBoat]           = useState<BoatAPI | null>(null);
  const [reviews, setReviews]     = useState<AvisAPI[]>([]);
  const [ownerStats, setOwnerStats] = useState<OwnerStats | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  const [viewingDoc, setViewingDoc]   = useState<DocumentAPI | null>(null);
  const [lightboxIdx, setLightboxIdx]  = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<"validate" | "suspend" | "unsuspend" | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast]         = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  /* ── Load boat data ── */
  useEffect(() => {
    if (!boatId) return;
    setLoading(true);
    setError("");

    boatsApi
      .getOne(boatId)
      .then(async (b) => {
        setBoat(b);
        // Documents are included directly in the boat response
        // (no separate API call needed)

        // For available boats, also load reviews and owner stats
        if (b.statut === StatutBateau.DISPONIBLE) {
          // Load reviews via reservations
          boatsApi
            .getReservations(boatId)
            .then(async (reservations) => {
              const resArr = reservations as ReservationAPI[];
              const allReviews: AvisAPI[] = [];
              await Promise.allSettled(
                resArr.map(async (r) => {
                  try {
                    const rv = await reservationsApi.getAvis(r.id);
                    allReviews.push(...rv);
                  } catch {}
                })
              );
              setReviews(allReviews);
            })
            .catch(() => setReviews([]));

          // Load owner stats
          const ownerId = b.proprietaire?.id ?? b.id_utilisateur;
          if (ownerId) {
            boatsApi
              .getAll()
              .then((all) => {
                const count = all.filter(
                  (boat) => (boat.proprietaire?.id ?? boat.id_utilisateur) === ownerId
                ).length;
                setOwnerStats({ boatCount: count });
              })
              .catch(() => setOwnerStats(null));
          }
        }
      })
      .catch(() => setError("Impossible de charger les informations du bateau."))
      .finally(() => setLoading(false));
  }, [boatId]);

  /* ── Status change ── */
  async function handleAction() {
    if (!boat || !confirmAction) return;
    setActionLoading(true);
    const newStatut =
      confirmAction === "validate"   ? StatutBateau.DISPONIBLE :
      confirmAction === "unsuspend"  ? StatutBateau.DISPONIBLE :
                                       StatutBateau.SUSPENDU;
    try {
      const updated = await boatsApi.updateStatut(boat.id, newStatut);
      setBoat((prev) => prev ? { ...prev, statut: updated.statut ?? newStatut } : prev);
      setConfirmAction(null);
      showToast(
        confirmAction === "validate"
          ? "Le bateau a été validé et est maintenant disponible."
          : confirmAction === "unsuspend"
          ? "La suspension a été levée. Le bateau est de nouveau disponible."
          : "Le bateau a été suspendu.",
        "success"
      );
      // Navigate back after short delay
      setTimeout(() => router.push("/admin/publication"), 1800);
    } catch {
      setConfirmAction(null);
      showToast("Une erreur est survenue. Veuillez réessayer.", "error");
    } finally {
      setActionLoading(false);
    }
  }

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="dash-page">
        <div className="pub-loading" style={{ minHeight: 300 }}>
          <div className="pub-spinner" />
          Chargement du bateau…
        </div>
      </div>
    );
  }

  /* ── Error state ── */
  if (error || !boat) {
    return (
      <div className="dash-page">
        <button className="pub-detail-back" onClick={() => router.back()}>
          <i className="fa-solid fa-arrow-left" />
          Retour
        </button>
        <div className="pub-error">
          <i className="fa-solid fa-triangle-exclamation" />
          {error || "Bateau introuvable."}
        </div>
      </div>
    );
  }

  const isPending   = boat.statut === StatutBateau.EN_ATTENTE_VALIDATION;
  const isAvailable = boat.statut === StatutBateau.DISPONIBLE;
  const docs        = boat.documents ?? [];

  const mainPhoto = boat.photos?.find((p) => p.ordreAffichage === 0) ?? boat.photos?.[0];

  const owner = boat.proprietaire ?? boat.utilisateur;
  const ownerName = owner
    ? `${owner.prenom} ${owner.nom}`
    : `Utilisateur #${boat.id_utilisateur ?? "?"}`;

  return (
    <div className="dash-page">

      {/* ── Back + Header ── */}
      <div>
        <button className="pub-detail-back" onClick={() => router.back()}>
          <i className="fa-solid fa-arrow-left" />
          Retour à la liste
        </button>
        <div className="pub-detail-header" style={{ marginTop: 8 }}>
          <div>
            <div className="pub-detail-title-row">
              <h1 className="pub-detail-title">{boat.nomBateau}</h1>
              {isPending && (
                <span className="badge-pending">
                  <i className="fa-solid fa-clock" />
                  En attente de validation
                </span>
              )}
              {isAvailable && (
                <span className="badge-available">
                  <i className="fa-solid fa-circle-check" />
                  Disponible
                </span>
              )}
              {boat.statut === StatutBateau.SUSPENDU && (
                <span className="badge-suspended">
                  <i className="fa-solid fa-ban" />
                  Suspendu
                </span>
              )}
            </div>
            <p className="dash-sub" style={{ marginTop: 4 }}>
              {boat.typeBateau?.labelTypeBateau ?? "—"} · #{boat.id}
            </p>
          </div>
          {/* ── Owner mini card in header ── */}
          {owner && (
            <div className="pub-owner-mini" style={{ flexShrink: 0 }}>
              <div className="pub-owner-mini-avatar" style={{ width: 36, height: 36, fontSize: ".75rem" }}>
                {`${owner.prenom[0] ?? ""}${owner.nom[0] ?? ""}`.toUpperCase()}
              </div>
              <div>
                <div className="pub-owner-mini-name">{owner.prenom} {owner.nom}</div>
                <div style={{ fontSize: ".75rem", color: "var(--text-3)" }}>Propriétaire</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Gallery ── */}
      {(boat.photos?.length ?? 0) > 0 ? (
        <div className="pub-section">
          <div className="pub-section-hd">
            <i className="fa-solid fa-images" />
            Photos
            <span style={{ fontSize: ".8125rem", color: "var(--text-3)", fontWeight: 400, marginLeft: 4 }}>
              ({boat.photos!.length} photo{boat.photos!.length !== 1 ? "s" : ""})
            </span>
          </div>
          <div className="pub-section-body">
            <div className="pub-gallery">
              {boat.photos!.map((photo, idx) => (
                <img
                  key={photo.id}
                  src={resolvePhotoUrl(photo.url)}
                  alt={photo.description ?? boat.nomBateau}
                  className="pub-gallery-img pub-gallery-img--clickable"
                  onClick={() => setLightboxIdx(idx)}
                  title="Cliquer pour agrandir"
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="pub-section">
          <div className="pub-section-hd">
            <i className="fa-solid fa-images" />
            Photos
          </div>
          <div className="pub-section-body">
            <div className="pub-gallery-placeholder">
              <i className="fa-solid fa-image" />
            </div>
          </div>
        </div>
      )}

      {/* ── Informations du bateau ── */}
      <div className="pub-section">
        <div className="pub-section-hd">
          <i className="fa-solid fa-sailboat" />
          Informations du bateau
        </div>
        <div className="pub-section-body" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="pub-info-grid">
            <div className="pub-info-item">
              <div className="pub-info-label">Nom</div>
              <div className="pub-info-value">{boat.nomBateau}</div>
            </div>
            <div className="pub-info-item">
              <div className="pub-info-label">Type</div>
              <div className="pub-info-value">{boat.typeBateau?.labelTypeBateau ?? "—"}</div>
            </div>
            <div className="pub-info-item">
              <div className="pub-info-label">Motorisation</div>
              <div className="pub-info-value">{boat.motorisation || "—"}</div>
            </div>
            <div className="pub-info-item">
              <div className="pub-info-label">Taille</div>
              <div className="pub-info-value">{boat.taille || "—"}</div>
            </div>
            <div className="pub-info-item">
              <div className="pub-info-label">Prix / jour</div>
              <div className="pub-info-value">{formatPrice(boat.prixJour)}</div>
            </div>
            {boat.prixHeure != null && (
              <div className="pub-info-item">
                <div className="pub-info-label">Prix / heure</div>
                <div className="pub-info-value">{formatPrice(boat.prixHeure)}</div>
              </div>
            )}
            <div className="pub-info-item">
              <div className="pub-info-label">Capacité</div>
              <div className="pub-info-value">
                {boat.capacite != null ? `${boat.capacite} personne${boat.capacite !== 1 ? "s" : ""}` : "—"}
              </div>
            </div>
            {boat.nombreCabines != null && (
              <div className="pub-info-item">
                <div className="pub-info-label">Cabines</div>
                <div className="pub-info-value">{boat.nombreCabines}</div>
              </div>
            )}
            <div className="pub-info-item">
              <div className="pub-info-label">Avec skipper</div>
              <div className="pub-info-value">{boat.avecSkipper ? "Oui" : "Non"}</div>
            </div>
            <div className="pub-info-item">
              <div className="pub-info-label">Permis requis</div>
              <div className="pub-info-value">{boat.permisRequis ? "Oui" : "Non"}</div>
            </div>
            <div className="pub-info-item">
              <div className="pub-info-label">Carburant inclus</div>
              <div className="pub-info-value">{boat.carburantInclus ? "Oui" : "Non"}</div>
            </div>
            {boat.caution != null && (
              <div className="pub-info-item">
                <div className="pub-info-label">Caution</div>
                <div className="pub-info-value">{formatPrice(boat.caution)}</div>
              </div>
            )}
            <div className="pub-info-item">
              <div className="pub-info-label">Port d&apos;attache</div>
              <div className="pub-info-value">
                {boat.port ? `${boat.port.nom} — ${boat.port.ville}` : "—"}
              </div>
            </div>
          </div>

          {boat.description && (
            <div>
              <div className="pub-info-label" style={{ marginBottom: 8 }}>Description</div>
              <p className="pub-description">{boat.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Documents ── */}
      <div className="pub-section">
        <div className="pub-section-hd">
          <i className="fa-solid fa-folder-open" />
          Documents
          {docs.length > 0 && (
            <span style={{ fontSize: ".8125rem", color: "var(--text-3)", fontWeight: 400, marginLeft: 4 }}>
              ({docs.length} document{docs.length !== 1 ? "s" : ""})
            </span>
          )}
        </div>
        <div className="pub-section-body">
          {docs.length === 0 ? (
            <div className="pub-docs-warning">
              <div className="pub-docs-warning-icon">
                <i className="fa-solid fa-triangle-exclamation" />
              </div>
              <div>
                <strong>Documents manquants</strong>
                <p>
                  Aucun document n&apos;a été fourni pour ce bateau. Les documents sont requis
                  pour valider une publication (assurance, acte de propriété, permis, pièce d&apos;identité, etc.).
                </p>
              </div>
            </div>
          ) : (
            <div className="pub-docs-list">
              {docs.map((doc) => (
                <div key={doc.id} className="pub-doc-item">
                  <div className="pub-doc-icon">
                    <i className={`fa-solid ${docIcon(doc)}`} />
                  </div>
                  <div className="pub-doc-info">
                    <div className="pub-doc-name">{docLabel(doc)}</div>
                    {doc.created_at && (
                      <div className="pub-doc-type">
                        Déposé le {formatDate(doc.created_at)}
                      </div>
                    )}
                  </div>
                  <button
                    className="pub-doc-btn"
                    onClick={() => setViewingDoc(doc)}
                  >
                    <i className="fa-solid fa-eye" />
                    Consulter
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Reviews (available boats only) ── */}
      {isAvailable && (
        <div className="pub-section">
          <div className="pub-section-hd">
            <i className="fa-solid fa-star" />
            Avis
            {reviews.length > 0 && (
              <span style={{ fontSize: ".8125rem", color: "var(--text-3)", fontWeight: 400, marginLeft: 4 }}>
                ({reviews.length} avis)
              </span>
            )}
          </div>
          <div className="pub-section-body">
            {reviews.length === 0 ? (
              <div className="pub-empty" style={{ padding: "16px 0" }}>
                <i className="fa-solid fa-star" />
                <p>Aucun avis pour ce bateau.</p>
              </div>
            ) : (
              <div className="pub-reviews-list">
                {reviews.map((rv) => {
                  const reviewer = rv.utilisateur;
                  const authorName = reviewer ? `${reviewer.prenom} ${reviewer.nom}` : "Utilisateur inconnu";
                  const initials = reviewer
                    ? `${reviewer.prenom[0] ?? ""}${reviewer.nom[0] ?? ""}`.toUpperCase()
                    : "?";
                  const dateAvis = rv.dateAvis;

                  return (
                    <div key={rv.id} className="pub-review-item">
                      <div className="pub-review-header">
                        <div className="pub-review-author">
                          <div className="pub-review-avatar">{initials}</div>
                          <div>
                            <div className="pub-review-author-name">{authorName}</div>
                            <div className="pub-review-date">{formatDate(dateAvis)}</div>
                          </div>
                        </div>
                        <div className="pub-review-stars">
                          {starArr(rv.note).map((filled, i) => (
                            <i
                              key={i}
                              className={`fa-${filled ? "solid" : "regular"} fa-star`}
                            />
                          ))}
                          <span style={{ fontSize: ".8125rem", fontWeight: 700, marginLeft: 4 }}>
                            {rv.note}/5
                          </span>
                        </div>
                      </div>
                      {rv.commentaire && (
                        <p className="pub-review-body">{rv.commentaire}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Owner info (available boats only) ── */}
      {isAvailable && owner && (
        <div className="pub-section">
          <div className="pub-section-hd">
            <i className="fa-solid fa-user" />
            Informations du propriétaire
          </div>
          <div className="pub-section-body">
            {/* ── Profile card ── */}
            <div className="pub-owner-card">
              <div className="pub-owner-avatar">
                {`${owner.prenom[0] ?? ""}${owner.nom[0] ?? ""}`.toUpperCase()}
              </div>
              <div className="pub-owner-card-info">
                <div className="pub-owner-card-name">{owner.prenom} {owner.nom}</div>
                <div className="pub-owner-card-sub">
                  Propriétaire
                  {owner.email && <> · {owner.email}</>}
                </div>
              </div>
              <a
                href={`mailto:${owner.email}`}
                className="btn btn-sm btn-ghost"
                style={{ flexShrink: 0 }}
              >
                <i className="fa-solid fa-envelope" />
                Contacter
              </a>
            </div>

            {/* ── Stats ── */}
            <div className="pub-owner-grid">
              {owner.telephone && (
                <div className="pub-owner-stat">
                  <div className="pub-owner-stat-label">Téléphone</div>
                  <div className="pub-owner-stat-value">{owner.telephone}</div>
                </div>
              )}
              {owner.created_at && (
                <div className="pub-owner-stat">
                  <div className="pub-owner-stat-label">Membre depuis</div>
                  <div className="pub-owner-stat-value">{formatDate(owner.created_at)}</div>
                </div>
              )}
              {ownerStats && (
                <div className="pub-owner-stat">
                  <div className="pub-owner-stat-label">Bateaux publiés</div>
                  <div className="pub-owner-stat-value">{ownerStats.boatCount}</div>
                </div>
              )}
              <div className="pub-owner-stat">
                <div className="pub-owner-stat-label">Statut du compte</div>
                <div className="pub-owner-stat-value">
                  {owner.statutCompte === false ? (
                    <span className="badge-suspended" style={{ fontSize: ".8125rem" }}>Désactivé</span>
                  ) : (
                    <span className="badge-available" style={{ fontSize: ".8125rem" }}>Actif</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Action zone ── */}
      {isPending && (
        <div className="pub-action-zone">
          <div className="pub-action-zone-text">
            <strong>Valider la publication</strong>
            <p>
              Après validation, le bateau sera visible sur la plateforme et son statut
              passera à <strong>Disponible</strong>.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setConfirmAction("validate")}
          >
            <i className="fa-solid fa-circle-check" />
            Valider la publication
          </button>
        </div>
      )}

      {isAvailable && (
        <div className="pub-action-zone">
          <div className="pub-action-zone-text danger">
            <strong>Suspendre le bateau</strong>
            <p>
              Le bateau sera retiré de la liste des bateaux disponibles et son statut
              passera à <strong>Suspendu</strong>.
            </p>
          </div>
          <button
            className="btn btn-danger"
            onClick={() => setConfirmAction("suspend")}
          >
            <i className="fa-solid fa-ban" />
            Suspendre le bateau
          </button>
        </div>
      )}

      {boat.statut === StatutBateau.SUSPENDU && (
        <div className="pub-action-zone">
          <div className="pub-action-zone-text">
            <strong>Lever la suspension</strong>
            <p>
              Le bateau sera rétabli et son statut repassera à <strong>Disponible</strong>.
              Il sera de nouveau visible sur la plateforme.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setConfirmAction("unsuspend")}
          >
            <i className="fa-solid fa-circle-check" />
            Lever la suspension
          </button>
        </div>
      )}

      {/* ── Document viewer modal ── */}
      {viewingDoc && (
        <DocViewerModal doc={viewingDoc} onClose={() => setViewingDoc(null)} />
      )}

      {/* ── Confirm action modal ── */}
      {confirmAction && (
        <ConfirmModal
          title={
            confirmAction === "validate"  ? "Valider la publication" :
            confirmAction === "unsuspend" ? "Lever la suspension" :
                                           "Suspendre le bateau"
          }
          message={
            confirmAction === "validate"
              ? `Êtes-vous sûr de vouloir valider la publication du bateau "${boat.nomBateau}" ? Il sera visible sur la plateforme.`
              : confirmAction === "unsuspend"
              ? `Êtes-vous sûr de vouloir lever la suspension du bateau "${boat.nomBateau}" ? Il redeviendra disponible sur la plateforme.`
              : `Êtes-vous sûr de vouloir suspendre le bateau "${boat.nomBateau}" ? Il ne sera plus visible sur la plateforme.`
          }
          confirmLabel={
            confirmAction === "validate"  ? "Valider" :
            confirmAction === "unsuspend" ? "Lever la suspension" :
                                           "Suspendre"
          }
          danger={confirmAction === "suspend"}
          loading={actionLoading}
          onConfirm={handleAction}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {/* ── Photo lightbox ── */}
      {lightboxIdx !== null && boat.photos && boat.photos.length > 0 && (
        <PhotoLightbox
          photos={boat.photos}
          index={lightboxIdx}
          boatName={boat.nomBateau}
          onClose={() => setLightboxIdx(null)}
          onPrev={() => setLightboxIdx((i) => (i! - 1 + boat.photos!.length) % boat.photos!.length)}
          onNext={() => setLightboxIdx((i) => (i! + 1) % boat.photos!.length)}
        />
      )}

      {/* ── Toast ── */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
