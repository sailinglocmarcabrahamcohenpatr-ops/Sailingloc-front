import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { ReservationAPI, PaiementAPI } from "./reservations-api";
import type { BoatAPI } from "./boats-api";
import { LEGAL_COMPANY_NAME, LEGAL_ADDRESS, LEGAL_SIRET, LEGAL_SIREN, LEGAL_RCS, LEGAL_TVA } from "@/shared/config";

// Palette alignée sur --navy / --primary du site (app/globals.css) plutôt que sur un vert générique.
const BRAND_NAVY: [number, number, number] = [11, 25, 41];
const ACCENT_BLUE: [number, number, number] = [17, 75, 107];
const BAND_MUTED: [number, number, number] = [196, 210, 224];
const SOFT_BG: [number, number, number] = [246, 248, 250];
const SOFT_BORDER: [number, number, number] = [222, 227, 233];
const TEXT_MUTED: [number, number, number] = [110, 118, 114];
const TEXT_DARK: [number, number, number] = [40, 40, 40];

const STATUS_STYLES = {
  paid: { text: [16, 122, 87] as [number, number, number], bg: [222, 245, 234] as [number, number, number] },
  pending: { text: [180, 106, 8] as [number, number, number], bg: [254, 243, 210] as [number, number, number] },
  failed: { text: [190, 40, 40] as [number, number, number], bg: [252, 224, 224] as [number, number, number] },
  cancelled: { text: [110, 118, 114] as [number, number, number], bg: [237, 239, 238] as [number, number, number] },
};

const PAGE_MARGIN = 40;

// jsPDF's default font can't render the narrow no-break space used by
// toLocaleString("fr-FR") as a thousands separator (it prints as "/"),
// so PDF export uses a plain space instead.
const fmtEuroPdf = (n: number) => `${n.toLocaleString("fr-FR").replace(/[  ]/g, " ")} €`;

const fmtDatePdf = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

const nights = (start: string, end: string) =>
  Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)));

function invoiceNumber(reservationId: number, dateReservation?: string): string {
  const year = dateReservation ? new Date(dateReservation).getFullYear() : new Date().getFullYear();
  return `FACT-${year}-${String(reservationId).padStart(6, "0")}`;
}

function contractNumber(reservationId: number, dateReservation?: string): string {
  const year = dateReservation ? new Date(dateReservation).getFullYear() : new Date().getFullYear();
  return `CONTRAT-${year}-${String(reservationId).padStart(6, "0")}`;
}

function paymentStatusInfo(
  reservation: ReservationAPI,
  paiements: PaiementAPI[]
): { label: string; key: keyof typeof STATUS_STYLES } {
  const key = (reservation.statutReservation ?? "").toLowerCase();
  if (paiements.length > 0) {
    const latest = paiements[paiements.length - 1];
    if (latest.statutPaiement === "paye") return { label: "Payée", key: "paid" };
    if (latest.statutPaiement === "rembourse") return { label: "Remboursée", key: "cancelled" };
    if (latest.statutPaiement === "echoue") return { label: "Paiement échoué", key: "failed" };
    // La réservation confirmée/terminée par le propriétaire vaut encaissement pour le locataire,
    // même si l'enregistrement de paiement lui-même est resté "en_attente" (webhook Stripe manqué,
    // données antérieures au correctif backend).
    if (key.includes("confirm") || key.includes("termin")) return { label: "Payée", key: "paid" };
    return { label: "En attente d'encaissement", key: "pending" };
  }
  if (key.includes("annul")) return { label: "Annulée", key: "cancelled" };
  if (key.includes("confirm") || key.includes("termin")) return { label: "Payée", key: "paid" };
  return { label: "En attente d'encaissement", key: "pending" };
}

interface TenantInfo {
  name?: string;
  email?: string;
}

// Pictogramme SailingLoc (shared/ui/Logo.tsx) reproduit en blanc pour le bandeau sombre du PDF.
const LOGO_MARK_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 60">' +
  '<path d="M24 57C13 44 6 33 6 21.5 6 11 14.1 3 24 3s18 8 18 18.5C42 33 35 44 24 57Z" fill="none" stroke="#ffffff" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>' +
  '<path d="M24 14 34 34H14Z" fill="#ffffff"/>' +
  '<path d="M10 34Q24 30 38 34Q24 42 10 34Z" fill="#ffffff"/>' +
  '<path d="M8 47q8-5 16 0t16 0" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round"/>' +
  "</svg>";
const LOGO_MARK_RATIO = 48 / 60;

function svgToPngDataUrl(svgMarkup: string, width: number, height: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgMarkup)))}`;
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 2D context unavailable"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Impossible de charger le pictogramme SailingLoc"));
    img.src = svgDataUrl;
  });
}

// Rasterisé une seule fois par session et réutilisé pour toutes les PDF générées ensuite.
let cachedLogoMarkPng: Promise<string> | null = null;
function getLogoMarkPng(): Promise<string> {
  if (!cachedLogoMarkPng) {
    cachedLogoMarkPng = svgToPngDataUrl(LOGO_MARK_SVG, 240, 300);
  }
  return cachedLogoMarkPng;
}

/** Bandeau de marque en tête de document ; renvoie le Y où commence le contenu. */
async function drawBrandBand(doc: jsPDF, pageWidth: number, title: string, metaLines: string[]): Promise<number> {
  const bandHeight = 92;
  doc.setFillColor(...BRAND_NAVY);
  doc.rect(0, 0, pageWidth, bandHeight, "F");

  const markHeight = 28;
  const markWidth = markHeight * LOGO_MARK_RATIO;
  const markX = PAGE_MARGIN;
  const markY = 20;
  try {
    const logoPng = await getLogoMarkPng();
    doc.addImage(logoPng, "PNG", markX, markY, markWidth, markHeight);
  } catch {
    // Le pictogramme est décoratif : si le rendu canvas échoue, le document reste utilisable.
  }

  const wordX = markX + markWidth + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text("SailingLoc", wordX, 40);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...BAND_MUTED);
  doc.text("Location de bateaux entre particuliers", PAGE_MARGIN, 58);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(title, pageWidth - PAGE_MARGIN, 38, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...BAND_MUTED);
  metaLines.forEach((line, i) => {
    doc.text(line, pageWidth - PAGE_MARGIN, 54 + i * 13, { align: "right" });
  });

  return bandHeight + 32;
}

/** Encart d'information (locataire / propriétaire) sur fond léger ; renvoie la hauteur utilisée. */
function drawInfoCard(doc: jsPDF, x: number, y: number, width: number, label: string, lines: string[]): number {
  const height = 30 + lines.length * 14 + 8;
  doc.setFillColor(...SOFT_BG);
  doc.setDrawColor(...SOFT_BORDER);
  doc.roundedRect(x, y, width, height, 4, 4, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...ACCENT_BLUE);
  doc.text(label.toUpperCase(), x + 14, y + 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...TEXT_DARK);
  lines.forEach((line, i) => {
    doc.text(line, x + 14, y + 34 + i * 14);
  });

  return height;
}

/** Pastille de statut colorée ; renvoie sa largeur. */
function drawStatusBadge(doc: jsPDF, x: number, y: number, label: string, key: keyof typeof STATUS_STYLES): number {
  const { text, bg } = STATUS_STYLES[key];
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  const width = doc.getTextWidth(label) + 20;
  doc.setFillColor(...bg);
  doc.roundedRect(x, y, width, 20, 10, 10, "F");
  doc.setTextColor(...text);
  doc.text(label, x + 10, y + 14);
  return width;
}

/** Bandeau total mis en évidence, aligné à droite ; sa largeur s'adapte au contenu pour ne jamais tronquer un gros montant. Renvoie sa hauteur. */
function drawTotalBanner(doc: jsPDF, pageWidth: number, y: number, label: string, amount: string): number {
  const paddingX = 16;
  const minWidth = 180;
  const height = 46;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const labelWidth = doc.getTextWidth(label.toUpperCase());
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  const amountWidth = doc.getTextWidth(amount);

  const width = Math.max(minWidth, labelWidth, amountWidth) + paddingX * 2;
  const x = pageWidth - PAGE_MARGIN - width;

  doc.setFillColor(...BRAND_NAVY);
  doc.roundedRect(x, y, width, height, 5, 5, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...BAND_MUTED);
  doc.text(label.toUpperCase(), x + paddingX, y + 18);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(255, 255, 255);
  doc.text(amount, x + paddingX, y + 37);
  return height;
}

const DEFAULT_FOOTER_NOTE =
  "SailingLoc — plateforme de location de bateaux entre particuliers. Ce document tient lieu de facture pour la prestation de location réservée via SailingLoc.";

function drawFooter(doc: jsPDF, pageWidth: number, pageHeight: number, note: string = DEFAULT_FOOTER_NOTE) {
  const y = pageHeight - 46;
  doc.setDrawColor(...SOFT_BORDER);
  doc.line(PAGE_MARGIN, y, pageWidth - PAGE_MARGIN, y);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(note, PAGE_MARGIN, y + 14, { maxWidth: pageWidth - PAGE_MARGIN * 2 });
}

function drawPageNumber(doc: jsPDF, pageWidth: number, pageHeight: number) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(
    `Page ${doc.getCurrentPageInfo().pageNumber} / ${doc.getNumberOfPages()}`,
    pageWidth - PAGE_MARGIN,
    pageHeight - 20,
    { align: "right" }
  );
}

/** Ajoute une page si l'espace restant avant le pied de page est insuffisant ; renvoie le Y à utiliser. */
function ensureSpace(doc: jsPDF, y: number, needed: number, pageHeight: number): number {
  if (y + needed > pageHeight - 66) {
    doc.addPage();
    return 60;
  }
  return y;
}

/**
 * Facture PDF d'une réservation unique, téléchargée côté locataire (ou propriétaire).
 * `boat`, s'il est fourni (ex: via boatsApi.getOne), complète les infos bateau/port/propriétaire :
 * l'endpoint de détail d'une réservation n'embarque pas toujours ces champs imbriqués,
 * contrairement à la liste des réservations ou à la fiche bateau elle-même.
 */
export async function generateReservationInvoicePdf(
  reservation: ReservationAPI,
  tenant: TenantInfo,
  paiements: PaiementAPI[] = [],
  boat?: BoatAPI | null
): Promise<void> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const number = invoiceNumber(reservation.id, reservation.dateReservation);
  const issuedAt = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  let y = await drawBrandBand(doc, pageWidth, "FACTURE", [`N° ${number}`, `Émise le ${issuedAt}`]);

  const reservationBoat = reservation.bateau;
  const owner = boat?.proprietaire ?? boat?.utilisateur ?? reservationBoat?.proprietaire;
  const port = boat?.port?.ville ?? reservationBoat?.port?.ville;
  const boatName = boat?.nomBateau ?? reservationBoat?.nomBateau ?? `Bateau #${boat?.id ?? reservationBoat?.id ?? reservation.id}`;
  const cardGap = 16;
  const cardWidth = (pageWidth - PAGE_MARGIN * 2 - cardGap) / 2;

  const tenantLines = [tenant.name, tenant.email].filter((v): v is string => Boolean(v));
  const ownerLines = owner
    ? [`${owner.prenom} ${owner.nom}`, owner.email].filter((v): v is string => Boolean(v))
    : ["Information indisponible"];

  const h1 = drawInfoCard(doc, PAGE_MARGIN, y, cardWidth, "Facturé à", tenantLines.length > 0 ? tenantLines : ["—"]);
  const h2 = drawInfoCard(doc, PAGE_MARGIN + cardWidth + cardGap, y, cardWidth, "Loué auprès de", ownerLines);
  y += Math.max(h1, h2) + 28;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND_NAVY);
  doc.text("Détail de la location", PAGE_MARGIN, y);
  y += 12;

  autoTable(doc, {
    startY: y,
    theme: "grid",
    head: [["Bateau", "Port", "Période", "Durée", "Montant"]],
    body: [
      [
        boatName,
        port ?? "—",
        `${fmtDatePdf(reservation.dateDebut)} - ${fmtDatePdf(reservation.dateFin)}`,
        `${nights(reservation.dateDebut, reservation.dateFin)} nuit(s)`,
        fmtEuroPdf(Number(reservation.montantTotal)),
      ],
    ],
    styles: { fontSize: 9, cellPadding: 8, textColor: TEXT_DARK, lineColor: SOFT_BORDER, lineWidth: 0.6 },
    headStyles: { fillColor: BRAND_NAVY, textColor: 255, fontStyle: "bold" },
    columnStyles: { 4: { halign: "right", fontStyle: "bold" } },
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
  });

  let afterTableY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 26;
  afterTableY = ensureSpace(doc, afterTableY, 46, pageHeight);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_MUTED);
  doc.text("STATUT DU PAIEMENT", PAGE_MARGIN, afterTableY + 8);
  const status = paymentStatusInfo(reservation, paiements);
  drawStatusBadge(doc, PAGE_MARGIN, afterTableY + 14, status.label, status.key);

  drawTotalBanner(doc, pageWidth, afterTableY, "Total TTC", fmtEuroPdf(Number(reservation.montantTotal)));

  drawFooter(doc, pageWidth, pageHeight);
  drawPageNumber(doc, pageWidth, pageHeight);

  doc.save(`sailingloc-facture-${reservation.id}.pdf`);
}

/**
 * Facture récapitulative PDF regroupant toutes les réservations du locataire connecté.
 * `paiementsByReservation`, s'il est fourni, donne le statut de paiement réel (issu des
 * enregistrements Paiement) plutôt que la simple déduction depuis le statut de la réservation,
 * pour rester cohérent avec la facture individuelle générée depuis la page de détail.
 */
export async function generateReservationsInvoicesPdf(
  reservations: ReservationAPI[],
  tenant: TenantInfo,
  paiementsByReservation?: Record<number, PaiementAPI[]>
): Promise<void> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const issuedAt = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  let y = await drawBrandBand(doc, pageWidth, "RÉCAPITULATIF", [`Généré le ${issuedAt}`]);

  const tenantLines = [tenant.name, tenant.email].filter((v): v is string => Boolean(v));
  if (tenantLines.length > 0) {
    y += drawInfoCard(doc, PAGE_MARGIN, y, pageWidth - PAGE_MARGIN * 2, "Locataire", tenantLines) + 26;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND_NAVY);
  doc.text("Historique des réservations", PAGE_MARGIN, y);
  y += 12;

  const sorted = reservations
    .slice()
    .sort((a, b) => new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime());

  const total = sorted
    .filter((r) => !(r.statutReservation ?? "").toLowerCase().includes("annul"))
    .reduce((acc, r) => acc + Number(r.montantTotal), 0);
  const count = sorted.filter((r) => !(r.statutReservation ?? "").toLowerCase().includes("annul")).length;

  const rows = sorted.map((r) => [
    invoiceNumber(r.id, r.dateReservation),
    r.bateau?.nomBateau ?? `Bateau #${r.bateau?.id ?? r.id}`,
    `${fmtDatePdf(r.dateDebut)} - ${fmtDatePdf(r.dateFin)}`,
    paymentStatusInfo(r, paiementsByReservation?.[r.id] ?? []).label,
    fmtEuroPdf(Number(r.montantTotal)),
  ]);

  autoTable(doc, {
    startY: y,
    head: [["N° facture", "Bateau", "Période", "Statut", "Montant"]],
    body: rows,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 8, textColor: TEXT_DARK, lineColor: SOFT_BORDER, lineWidth: 0.6 },
    headStyles: { fillColor: BRAND_NAVY, textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: SOFT_BG },
    columnStyles: { 4: { halign: "right" } },
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    didDrawPage: () => drawPageNumber(doc, pageWidth, pageHeight),
  });

  let afterTableY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 26;
  afterTableY = ensureSpace(doc, afterTableY, 46, pageHeight);

  drawTotalBanner(
    doc,
    pageWidth,
    afterTableY,
    `Total (${count} réservation${count !== 1 ? "s" : ""})`,
    fmtEuroPdf(total)
  );

  drawFooter(doc, pageWidth, pageHeight);

  doc.save(`sailingloc-factures-${new Date().toISOString().slice(0, 10)}.pdf`);
}

const CONTRACT_FOOTER_NOTE =
  "SailingLoc SAS — ce document est un récapitulatif des conditions de location généré automatiquement à partir des informations de la réservation et de l'annonce du bateau, et des Conditions Générales d'Utilisation (CGU) de la plateforme, disponibles sur sailingloc.com/cgu. Il ne remplace pas un contrat signé formellement entre les parties.";

/**
 * Contrat de location PDF généré entièrement côté client (données déjà disponibles via
 * reservationsApi/boatsApi), sans dépendre de l'endpoint backend GET /api/reservations/{id}/contrat
 * (pas encore déployé). Les clauses générales (assurance, restitution, navigation, douane) reprennent
 * les CGU déjà publiées par la plateforme (app/(main)/cgu) ; les clauses par bateau (caution, carburant,
 * permis, skipper) viennent de l'annonce elle-même. Rien n'est inventé côté per-réservation : le champ
 * libre `contrat.conditions` propre à chaque réservation n'est pas exposé par une API publique et n'est
 * donc pas reproduit ici.
 */
export async function generateReservationContractPdf(
  reservation: ReservationAPI,
  tenant: TenantInfo,
  boat?: BoatAPI | null
): Promise<void> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const number = contractNumber(reservation.id, reservation.dateReservation);
  const issuedAt = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  let y = await drawBrandBand(doc, pageWidth, "CONTRAT DE LOCATION", [`N° ${number}`, `Généré le ${issuedAt}`]);

  y +=
    drawInfoCard(doc, PAGE_MARGIN, y, pageWidth - PAGE_MARGIN * 2, "Intermédiaire de location", [
      LEGAL_COMPANY_NAME,
      LEGAL_ADDRESS,
      `SIRET ${LEGAL_SIRET} — SIREN ${LEGAL_SIREN}`,
      `RCS ${LEGAL_RCS} — TVA intracommunautaire ${LEGAL_TVA}`,
    ]) + 20;

  const reservationBoat = reservation.bateau;
  const owner = boat?.proprietaire ?? boat?.utilisateur ?? reservationBoat?.proprietaire;
  const port = boat?.port ? `${boat.port.nom} (${boat.port.ville})` : reservationBoat?.port?.ville;
  const boatName = boat?.nomBateau ?? reservationBoat?.nomBateau ?? `Bateau #${boat?.id ?? reservationBoat?.id ?? reservation.id}`;
  const typeBateau = boat?.typeBateau?.labelTypeBateau ?? reservationBoat?.typeBateau?.labelTypeBateau;

  const cardGap = 16;
  const cardWidth = (pageWidth - PAGE_MARGIN * 2 - cardGap) / 2;

  const tenantLines = [tenant.name, tenant.email].filter((v): v is string => Boolean(v));
  const ownerLines = owner
    ? [`${owner.prenom} ${owner.nom}`, owner.email].filter((v): v is string => Boolean(v))
    : ["Information indisponible"];

  const h1 = drawInfoCard(doc, PAGE_MARGIN, y, cardWidth, "Locataire", tenantLines.length > 0 ? tenantLines : ["—"]);
  const h2 = drawInfoCard(doc, PAGE_MARGIN + cardWidth + cardGap, y, cardWidth, "Propriétaire", ownerLines);
  y += Math.max(h1, h2) + 28;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND_NAVY);
  doc.text("Objet de la location", PAGE_MARGIN, y);
  y += 12;

  autoTable(doc, {
    startY: y,
    theme: "grid",
    head: [["Bateau", "Type", "Port", "Période", "Durée"]],
    body: [
      [
        boatName,
        typeBateau ?? "—",
        port ?? "—",
        `${fmtDatePdf(reservation.dateDebut)} - ${fmtDatePdf(reservation.dateFin)}`,
        `${nights(reservation.dateDebut, reservation.dateFin)} nuit(s)`,
      ],
    ],
    styles: { fontSize: 9, cellPadding: 8, textColor: TEXT_DARK, lineColor: SOFT_BORDER, lineWidth: 0.6 },
    headStyles: { fillColor: BRAND_NAVY, textColor: 255, fontStyle: "bold" },
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
  });

  let afterTableY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 26;
  afterTableY = ensureSpace(doc, afterTableY, 260, pageHeight);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND_NAVY);
  doc.text("Conditions de location", PAGE_MARGIN, afterTableY);
  afterTableY += 12;

  const caution = boat?.caution != null && Number(boat.caution) > 0 ? fmtEuroPdf(Number(boat.caution)) : "Non renseignée";
  const carburant = boat?.carburantInclus ? "Inclus" : "Non inclus, à restituer avec le niveau constaté au départ";
  const permis = boat?.permisRequis ? "Oui — permis côtier ou hauturier valide exigé" : "Non requis";
  const skipper = boat?.avecSkipper ? "Inclus" : "Non inclus — navigation par le locataire";

  autoTable(doc, {
    startY: afterTableY,
    theme: "grid",
    body: [
      ["Caution", caution],
      ["Carburant", carburant],
      ["Permis bateau requis", permis],
      ["Skipper", skipper],
      [
        "Assurance",
        "Responsabilité civile et dommages matériels inclus dans les eaux européennes (cf. CGU art. 8).",
      ],
      [
        "Restitution",
        "À la date, l'heure et au lieu convenus, dans l'état constaté au départ (cf. CGU art. 4).",
      ],
      [
        "Navigation & sécurité",
        "Dans le respect des règles de navigation, de sécurité en mer et de la réglementation maritime en vigueur.",
      ],
      [
        "Formalités douanières",
        "En cas de navigation hors des eaux territoriales françaises, le locataire est seul responsable des formalités douanières, de déclaration et d'immigration applicables.",
      ],
    ],
    styles: { fontSize: 9, cellPadding: 8, textColor: TEXT_DARK, lineColor: SOFT_BORDER, lineWidth: 0.6 },
    columnStyles: { 0: { fontStyle: "bold", textColor: [60, 60, 60], cellWidth: 150 } },
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    didDrawPage: () => drawPageNumber(doc, pageWidth, pageHeight),
  });

  let afterConditionsY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 26;
  afterConditionsY = ensureSpace(doc, afterConditionsY, 46, pageHeight);

  drawTotalBanner(doc, pageWidth, afterConditionsY, "Montant total", fmtEuroPdf(Number(reservation.montantTotal)));

  drawFooter(doc, pageWidth, pageHeight, CONTRACT_FOOTER_NOTE);

  doc.save(`sailingloc-contrat-${reservation.id}.pdf`);
}

export interface OwnerRevenueRow {
  renterName: string;
  boatName: string;
  period: string;
  statusLabel: string;
  gross: number;
  commission: number;
  net: number;
}

export interface OwnerRevenueSummary {
  totalNet: number;
  totalGross: number;
  totalCommission: number;
  commissionRatePct: number;
  count: number;
  avgNet: number;
  boatsCount: number;
  periodLabel?: string;
}

const REVENUE_FOOTER_NOTE =
  "SailingLoc SAS — ce document est un relevé récapitulatif des revenus générés via la plateforme, indicatif et non contractuel. Il ne se substitue pas à un document comptable ou fiscal officiel.";

/**
 * Relevé de revenus PDF récapitulant les locations d'un propriétaire, avec la même
 * identité visuelle (bandeau de marque, encarts, bandeau total) que la facture et le
 * contrat de location, plutôt qu'un simple tableau brut.
 */
export async function generateOwnerRevenueReportPdf(
  rows: OwnerRevenueRow[],
  summary: OwnerRevenueSummary,
  owner: TenantInfo
): Promise<void> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const issuedAt = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  let y = await drawBrandBand(doc, pageWidth, "RAPPORT DE REVENUS", [
    summary.periodLabel ?? "",
    `Généré le ${issuedAt}`,
  ].filter(Boolean));

  const ownerLines = [owner.name, owner.email].filter((v): v is string => Boolean(v));
  if (ownerLines.length > 0) {
    y += drawInfoCard(doc, PAGE_MARGIN, y, pageWidth - PAGE_MARGIN * 2, "Propriétaire", ownerLines) + 26;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND_NAVY);
  doc.text("Résumé", PAGE_MARGIN, y);
  y += 12;

  autoTable(doc, {
    startY: y,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 5, textColor: TEXT_DARK },
    columnStyles: {
      0: { fontStyle: "bold", textColor: ACCENT_BLUE },
      1: { halign: "right", fontStyle: "bold", textColor: BRAND_NAVY },
    },
    body: [
      ["Revenus nets cumulés", fmtEuroPdf(summary.totalNet)],
      ["Chiffre d'affaires brut", fmtEuroPdf(summary.totalGross)],
      ["Commission SailingLoc", `${fmtEuroPdf(summary.totalCommission)} (${summary.commissionRatePct}%)`],
      ["Locations réalisées (hors annulées)", `${summary.count}`],
      ["Revenu moyen / location", fmtEuroPdf(summary.avgNet)],
      ["Bateaux concernés", `${summary.boatsCount}`],
    ],
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
  });

  let afterSummaryY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 26;
  afterSummaryY = ensureSpace(doc, afterSummaryY, 60, pageHeight);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND_NAVY);
  doc.text("Détail des transactions", PAGE_MARGIN, afterSummaryY);
  afterSummaryY += 12;

  autoTable(doc, {
    startY: afterSummaryY,
    theme: "grid",
    head: [["Locataire", "Bateau", "Période", "Statut", "Brut", "Commission", "Net"]],
    body: rows.map((r) => [
      r.renterName,
      r.boatName,
      r.period,
      r.statusLabel,
      fmtEuroPdf(r.gross),
      fmtEuroPdf(r.commission),
      fmtEuroPdf(r.net),
    ]),
    foot: [[
      "",
      "",
      "",
      "Total",
      fmtEuroPdf(summary.totalGross),
      fmtEuroPdf(summary.totalCommission),
      fmtEuroPdf(summary.totalNet),
    ]],
    styles: { fontSize: 9, cellPadding: 7, textColor: TEXT_DARK, lineColor: SOFT_BORDER, lineWidth: 0.6 },
    headStyles: { fillColor: BRAND_NAVY, textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: BRAND_NAVY, textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: SOFT_BG },
    columnStyles: { 4: { halign: "right" }, 5: { halign: "right" }, 6: { halign: "right" } },
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    didDrawPage: () => drawPageNumber(doc, pageWidth, pageHeight),
  });

  let afterTableY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 26;
  afterTableY = ensureSpace(doc, afterTableY, 46, pageHeight);

  drawTotalBanner(doc, pageWidth, afterTableY, "Revenu net total", fmtEuroPdf(summary.totalNet));

  drawFooter(doc, pageWidth, pageHeight, REVENUE_FOOTER_NOTE);

  doc.save(`sailingloc-revenus-${new Date().toISOString().slice(0, 10)}.pdf`);
}
