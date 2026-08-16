import type { Metadata } from "next";
import { getDictionary, getRequestLocale } from "@/shared/i18n/get-dictionary";
import { RegisterForm } from "@/features/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getRequestLocale()).registerPage;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function InscriptionPage() {
  const t = getDictionary(await getRequestLocale()).registerPage;

  return (
    <div className="auth-card auth-card-wide">
      <div className="auth-card-header">
        <h1>{t.heading}</h1>
        <p className="auth-card-sub">{t.sub}</p>
      </div>
      <RegisterForm />
    </div>
  );
}
