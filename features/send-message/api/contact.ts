const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/support@dsp-dev-o24a-g1.cloud";

const SUBJECT_LABELS: Record<string, string> = {
  resa: "Réservation",
  pay: "Paiement",
  doc: "Documents",
  assur: "Assurance",
  prop: "Espace propriétaire",
  other: "Autre",
};

export interface ContactPayload {
  subject: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  booking?: string;
  message: string;
  attachment?: File;
}

export interface ContactResult {
  success: boolean;
  error?: string;
}

/**
 * Envoi 100% front, sans backend ni clé API : relais via FormSubmit.co.
 * Le premier envoi déclenche un mail d'activation à support@dsp-dev-o24a-g1.cloud
 * (lien à confirmer une fois) ; les envois suivants partent normalement.
 * La pièce jointe nécessite un envoi en multipart/form-data (pas de JSON) :
 * on laisse le navigateur poser le Content-Type avec sa boundary.
 */
export async function sendContactMessage(
  payload: ContactPayload
): Promise<ContactResult> {
  const subjectLabel = SUBJECT_LABELS[payload.subject] ?? payload.subject;

  const formData = new FormData();
  formData.append("_subject", `[Contact] ${subjectLabel} — ${payload.firstName} ${payload.lastName}`);
  formData.append("_template", "table");
  formData.append("_captcha", "false");
  formData.append("_replyto", payload.email);
  formData.append(
    "_autoresponse",
    `Bonjour ${payload.firstName},\n\nNous avons bien reçu votre message et vous répondrons sous 24-48h ouvrées.\n\nÀ bientôt,\nL'équipe SailingLoc`
  );
  formData.append("Sujet", subjectLabel);
  formData.append("Prénom", payload.firstName);
  formData.append("Nom", payload.lastName);
  formData.append("Email", payload.email);
  formData.append("Téléphone", payload.phone ?? "");
  formData.append("Référence réservation", payload.booking ?? "");
  formData.append("Message", payload.message);
  if (payload.attachment) {
    formData.append("attachment", payload.attachment, payload.attachment.name);
  }

  try {
    const res = await fetch(FORMSUBMIT_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });

    if (!res.ok) {
      return {
        success: false,
        error: "Une erreur est survenue. Veuillez réessayer.",
      };
    }

    return { success: true };
  } catch {
    return {
      success: false,
      error: "Impossible d'envoyer le message. Vérifiez votre connexion.",
    };
  }
}
