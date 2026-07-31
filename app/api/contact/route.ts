import { NextResponse } from "next/server";
import { Resend } from "resend";
import { CONTACT_SUBJECTS, type ContactPayload } from "@/features/send-message";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildEmailHtml(body: ContactPayload): string {
  const subjectLabel =
    CONTACT_SUBJECTS.find((s) => s.id === body.subject)?.label ?? body.subject;

  return `<!DOCTYPE html>
<html lang="fr">
<body style="font-family:Arial,Helvetica,sans-serif;color:#1A202C;">
  <h2>Nouveau message — ${escapeHtml(subjectLabel)}</h2>
  <p><strong>De :</strong> ${escapeHtml(body.firstName)} ${escapeHtml(body.lastName)} (${escapeHtml(body.email)})</p>
  ${body.phone ? `<p><strong>Téléphone :</strong> ${escapeHtml(body.phone)}</p>` : ""}
  ${body.booking ? `<p><strong>N° de réservation :</strong> ${escapeHtml(body.booking)}</p>` : ""}
  <p><strong>Message :</strong></p>
  <p>${escapeHtml(body.message).replace(/\n/g, "<br/>")}</p>
</body>
</html>`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<ContactPayload>;

    if (!body.email || !body.message || !body.firstName) {
      return NextResponse.json(
        { error: "Champs requis manquants (prénom, email, message)." },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn("[contact] RESEND_API_KEY non configurée — email non envoyé.");
      return NextResponse.json({ success: true, skipped: true });
    }

    const payload = body as ContactPayload;
    const resend = new Resend(process.env.RESEND_API_KEY);
    const subjectLabel =
      CONTACT_SUBJECTS.find((s) => s.id === payload.subject)?.label ?? payload.subject;

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM ?? "SailingLoc <onboarding@resend.dev>",
      to: process.env.CONTACT_EMAIL_TO ?? "contact@sailingloc.com",
      replyTo: payload.email,
      subject: `[Contact] ${subjectLabel} — ${payload.firstName} ${payload.lastName}`,
      html: buildEmailHtml(payload),
    });

    if (error) {
      console.error("[contact] Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    return NextResponse.json(
      { error: "Erreur serveur. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
