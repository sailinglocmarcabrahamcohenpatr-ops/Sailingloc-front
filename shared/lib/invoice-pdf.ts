import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { ReservationAPI, PaiementAPI } from "./reservations-api";
import type { BoatAPI } from "./boats-api";

const BRAND_GREEN: [number, number, number] = [14, 59, 46];
const ACCENT_GREEN: [number, number, number] = [16, 122, 87];
const SOFT_BG: [number, number, number] = [247, 250, 248];
const SOFT_BORDER: [number, number, number] = [222, 231, 227];
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

/** Bandeau de marque en tête de document ; renvoie le Y où commence le contenu. */
function drawBrandBand(doc: jsPDF, pageWidth: number, title: string, metaLines: string[]): number {
  const bandHeight = 92;
  doc.setFillColor(...BRAND_GREEN);
  doc.rect(0, 0, pageWidth, bandHeight, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text("SailingLoc", PAGE_MARGIN, 40);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(210, 226, 219);
  doc.text("Location de bateaux entre particuliers", PAGE_MARGIN, 56);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(title, pageWidth - PAGE_MARGIN, 38, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(210, 226, 219);
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
  doc.setTextColor(...ACCENT_GREEN);
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

  doc.setFillColor(...BRAND_GREEN);
  doc.roundedRect(x, y, width, height, 5, 5, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(210, 226, 219);
  doc.text(label.toUpperCase(), x + paddingX, y + 18);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(255, 255, 255);
  doc.text(amount, x + paddingX, y + 37);
  return height;
}

function drawFooter(doc: jsPDF, pageWidth: number, pageHeight: number) {
  const y = pageHeight - 46;
  doc.setDrawColor(...SOFT_BORDER);
  doc.line(PAGE_MARGIN, y, pageWidth - PAGE_MARGIN, y);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(
    "SailingLoc — plateforme de location de bateaux entre particuliers. Ce document tient lieu de facture pour la prestation de location réservée via SailingLoc.",
    PAGE_MARGIN,
    y + 14,
    { maxWidth: pageWidth - PAGE_MARGIN * 2 }
  );
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
export function generateReservationInvoicePdf(
  reservation: ReservationAPI,
  tenant: TenantInfo,
  paiements: PaiementAPI[] = [],
  boat?: BoatAPI | null
): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const number = invoiceNumber(reservation.id, reservation.dateReservation);
  const issuedAt = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  let y = drawBrandBand(doc, pageWidth, "FACTURE", [`N° ${number}`, `Émise le ${issuedAt}`]);

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
  doc.setTextColor(...BRAND_GREEN);
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
    headStyles: { fillColor: BRAND_GREEN, textColor: 255, fontStyle: "bold" },
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
export function generateReservationsInvoicesPdf(
  reservations: ReservationAPI[],
  tenant: TenantInfo,
  paiementsByReservation?: Record<number, PaiementAPI[]>
): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const issuedAt = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  let y = drawBrandBand(doc, pageWidth, "RÉCAPITULATIF", [`Généré le ${issuedAt}`]);

  const tenantLines = [tenant.name, tenant.email].filter((v): v is string => Boolean(v));
  if (tenantLines.length > 0) {
    y += drawInfoCard(doc, PAGE_MARGIN, y, pageWidth - PAGE_MARGIN * 2, "Locataire", tenantLines) + 26;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND_GREEN);
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
    headStyles: { fillColor: BRAND_GREEN, textColor: 255, fontStyle: "bold" },
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
