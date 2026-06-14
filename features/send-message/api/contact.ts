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

export async function sendContactMessage(
  payload: ContactPayload
): Promise<ContactResult> {
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      return {
        success: false,
        error: data.error ?? "Une erreur est survenue. Veuillez réessayer.",
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
