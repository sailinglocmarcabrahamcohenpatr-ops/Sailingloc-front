import { NextResponse } from "next/server";
import type { ContactPayload } from "@/features/send-message";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<ContactPayload>;

    if (!body.email || !body.message || !body.firstName) {
      return NextResponse.json(
        { error: "Champs requis manquants (prénom, email, message)." },
        { status: 400 }
      );
    }

    // TODO: Intégrer un provider email (Resend, SendGrid, Mailjet…)
    // await resend.emails.send({
    //   from: "SailingLoc <no-reply@sailingloc.com>",
    //   to: process.env.CONTACT_EMAIL_TO!,
    //   subject: `[Contact] ${body.subject} — ${body.firstName} ${body.lastName}`,
    //   html: `<p>${body.message}</p>`,
    // });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
