import { NextResponse } from "next/server";
import { Resend } from "resend";

interface ConfirmPayload {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  boatName: string;
  boatLocation: string;
  startDate: string;
  endDate: string;
  guests: number;
  days: number;
  pricePerDay: number;
  subtotal: number;
  serviceFee: number;
  total: number;
  ref: string;
}

function formatDateFR(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatPrice(amount: number): string {
  return amount.toLocaleString("fr-FR") + " €";
}

function buildEmailHtml(data: ConfirmPayload): string {
  const { firstName, lastName, boatName, boatLocation, startDate, endDate, guests, days, pricePerDay, subtotal, serviceFee, total, ref } = data;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirmation de réservation — SailingLoc</title>
</head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:Arial,Helvetica,sans-serif;color:#1A202C;">

  <!-- Header -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B1929;">
    <tr>
      <td align="center" style="padding:24px;">
        <span style="color:#FFFFFF;font-size:22px;font-weight:800;letter-spacing:-0.5px;">⚓ SailingLoc</span>
      </td>
    </tr>
  </table>

  <!-- Success banner -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1866F2;">
    <tr>
      <td align="center" style="padding:32px 24px;">
        <div style="background:rgba(255,255,255,0.15);border-radius:50%;width:56px;height:56px;margin:0 auto 16px;display:inline-block;line-height:56px;text-align:center;font-size:24px;">✓</div>
        <h1 style="color:#FFFFFF;margin:0 0 8px;font-size:24px;font-weight:800;">Demande de réservation envoyée&nbsp;!</h1>
        <p style="color:rgba(255,255,255,0.8);margin:0;font-size:15px;">Bonjour ${firstName}, votre demande a bien été reçue.</p>
      </td>
    </tr>
  </table>

  <!-- Main content -->
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Booking reference -->
          <tr>
            <td align="center" style="background:#EEF3FE;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
              <p style="color:#637083;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 6px;">Référence de réservation</p>
              <p style="color:#0B1929;font-size:28px;font-weight:800;margin:0;letter-spacing:0.05em;">${ref}</p>
            </td>
          </tr>

          <tr><td style="height:24px;"></td></tr>

          <!-- Boat info -->
          <tr>
            <td style="background:#FFFFFF;border-radius:12px;border:1px solid #E2E8F0;padding:24px;">
              <p style="color:#637083;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px;">Votre réservation</p>
              <h2 style="color:#0B1929;font-size:18px;font-weight:800;margin:0 0 6px;">${boatName}</h2>
              <p style="color:#637083;font-size:14px;margin:0 0 20px;">📍 ${boatLocation}</p>

              <!-- Dates -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;margin-bottom:16px;">
                <tr>
                  <td width="50%" style="padding:14px 16px;border-right:1px solid #E2E8F0;">
                    <p style="color:#637083;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 4px;">Arrivée</p>
                    <p style="color:#1A202C;font-size:14px;font-weight:700;margin:0;">${formatDateFR(startDate)}</p>
                  </td>
                  <td width="50%" style="padding:14px 16px;">
                    <p style="color:#637083;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 4px;">Départ</p>
                    <p style="color:#1A202C;font-size:14px;font-weight:700;margin:0;">${formatDateFR(endDate)}</p>
                  </td>
                </tr>
              </table>

              <p style="color:#637083;font-size:14px;margin:0 0 20px;">
                👥 <strong style="color:#1A202C;">${guests} passager${guests > 1 ? "s" : ""}</strong> · ${days} nuit${days > 1 ? "s" : ""}
              </p>

              <!-- Price breakdown -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border-radius:8px;padding:16px;">
                <tr>
                  <td style="padding:4px 0;color:#637083;font-size:14px;">${formatPrice(pricePerDay)} × ${days} nuit${days > 1 ? "s" : ""}</td>
                  <td align="right" style="padding:4px 0;color:#1A202C;font-size:14px;font-weight:700;">${formatPrice(subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;color:#637083;font-size:14px;">Frais de service SailingLoc</td>
                  <td align="right" style="padding:4px 0;color:#1A202C;font-size:14px;font-weight:700;">${formatPrice(serviceFee)}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;color:#637083;font-size:14px;">Assurance incluse</td>
                  <td align="right" style="padding:4px 0;color:#10B981;font-size:14px;font-weight:700;">Offerte</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:8px 0 4px;border-top:1px solid #E2E8F0;"></td>
                </tr>
                <tr>
                  <td style="padding:4px 0;color:#0B1929;font-size:16px;font-weight:800;">Total</td>
                  <td align="right" style="padding:4px 0;color:#1866F2;font-size:18px;font-weight:800;">${formatPrice(total)}</td>
                </tr>
              </table>

              <p style="color:#637083;font-size:12px;margin:12px 0 0;font-style:italic;">
                ℹ️ Votre paiement ne sera encaissé qu'après confirmation du propriétaire.
              </p>
            </td>
          </tr>

          <tr><td style="height:24px;"></td></tr>

          <!-- Next steps -->
          <tr>
            <td style="background:#FFFFFF;border-radius:12px;border:1px solid #E2E8F0;padding:24px;">
              <p style="color:#0B1929;font-size:16px;font-weight:800;margin:0 0 16px;">Ce qui se passe maintenant</p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td valign="top" width="36" style="padding-right:12px;">
                    <div style="background:#1866F2;color:#FFFFFF;border-radius:50%;width:28px;height:28px;font-weight:800;font-size:13px;text-align:center;line-height:28px;">1</div>
                  </td>
                  <td style="padding-bottom:16px;color:#637083;font-size:14px;line-height:1.6;">
                    Un e-mail de confirmation vous a été envoyé avec tous les détails de votre demande.
                  </td>
                </tr>
                <tr>
                  <td valign="top" width="36" style="padding-right:12px;">
                    <div style="background:#1866F2;color:#FFFFFF;border-radius:50%;width:28px;height:28px;font-weight:800;font-size:13px;text-align:center;line-height:28px;">2</div>
                  </td>
                  <td style="padding-bottom:16px;color:#637083;font-size:14px;line-height:1.6;">
                    Le propriétaire a <strong style="color:#1A202C;">24&nbsp;h</strong> pour confirmer. Votre paiement ne sera encaissé qu'après sa validation.
                  </td>
                </tr>
                <tr>
                  <td valign="top" width="36" style="padding-right:12px;">
                    <div style="background:#1866F2;color:#FFFFFF;border-radius:50%;width:28px;height:28px;font-weight:800;font-size:13px;text-align:center;line-height:28px;">3</div>
                  </td>
                  <td style="color:#637083;font-size:14px;line-height:1.6;">
                    Une fois confirmé, vous recevrez les coordonnées exactes du port et les instructions de check-in.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr><td style="height:24px;"></td></tr>

          <!-- Contact -->
          <tr>
            <td align="center" style="padding:16px 0;">
              <p style="color:#637083;font-size:13px;margin:0;">
                Une question ? Contactez notre support 7j/7 à
                <a href="mailto:support@sailingloc.com" style="color:#1866F2;font-weight:700;">support@sailingloc.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

  <!-- Footer -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B1929;">
    <tr>
      <td align="center" style="padding:24px;">
        <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0 0 4px;">⚓ SailingLoc — Location de bateaux en Méditerranée</p>
        <p style="color:rgba(255,255,255,0.35);font-size:11px;margin:0;">© 2026 SailingLoc. Tous droits réservés.</p>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<ConfirmPayload>;

    if (!body.email || !body.ref || !body.boatName) {
      return NextResponse.json({ error: "Données manquantes." }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn("[reservation/confirm] RESEND_API_KEY non configurée — email non envoyé.");
      return NextResponse.json({ success: true, skipped: true });
    }

    const payload = body as ConfirmPayload;
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM ?? "SailingLoc <onboarding@resend.dev>",
      to: payload.email,
      subject: `${payload.ref} — Votre réservation ${payload.boatName} est en cours de traitement`,
      html: buildEmailHtml(payload),
    });

    if (error) {
      console.error("[reservation/confirm] Resend error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[reservation/confirm] Unexpected error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
