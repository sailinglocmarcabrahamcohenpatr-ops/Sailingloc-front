import type { Metadata } from "next";
import { getDictionary, getRequestLocale } from "@/shared/i18n/get-dictionary";
import { ForgotPasswordForm } from "@/features/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getRequestLocale()).forgotPasswordPage;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function ForgotPasswordPage() {
  const t = getDictionary(await getRequestLocale()).forgotPasswordPage;

  return (
    <div className="auth-card">
      <div className="auth-card-header">
        <div className="auth-card-icon"><i className="fa-solid fa-lock" aria-hidden="true" /></div>
        <h1>{t.heading}</h1>
        <p>{t.sub}</p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
