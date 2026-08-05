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
}

export interface ContactResult {
  success: boolean;
  error?: string;
}

/**
 * Envoi 100% front, sans backend ni clé API : relais via FormSubmit.co.
 * Le premier envoi déclenche un mail d'activation à support@dsp-dev-o24a-g1.cloud
 * (lien à confirmer une fois) ; les envois suivants partent normalement.
 */
export async function sendContactMessage(
  payload: ContactPayload
): Promise<ContactResult> {
  const subjectLabel = SUBJECT_LABELS[payload.subject] ?? payload.subject;

  try {
    const res = await fetch(FORMSUBMIT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        _subject: `[Contact] ${subjectLabel} — ${payload.firstName} ${payload.lastName}`,
        _template: "table",
        _captcha: "false",
        _replyto: payload.email,
        _autoresponse: `Bonjour ${payload.firstName},\n\nNous avons bien reçu votre message et vous répondrons sous 24-48h ouvrées.\n\nÀ bientôt,\nL'équipe SailingLoc`,
        Sujet: subjectLabel,
        Prénom: payload.firstName,
        Nom: payload.lastName,
        Email: payload.email,
        Téléphone: payload.phone ?? "",
        "Référence réservation": payload.booking ?? "",
        Message: payload.message,
      }),
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
