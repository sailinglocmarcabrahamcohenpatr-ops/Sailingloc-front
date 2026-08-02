import type { Metadata } from "next";
import { LocaleLink as Link } from "@/shared/i18n";
import { getDictionary, getRequestLocale } from "@/shared/i18n/get-dictionary";
import { LoginForm } from "@/features/auth";

interface PageProps {
  searchParams: Promise<{ registered?: string; redirect?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getRequestLocale()).loginPage;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function ConnexionPage({ searchParams }: PageProps) {
  const { registered, redirect: redirectTo } = await searchParams;
  const t = getDictionary(await getRequestLocale()).loginPage;

  return (
    <div className="auth-card">
      {registered === "1" && (
        <div className="auth-success" role="alert">
          <i className="fa-solid fa-envelope-circle-check" aria-hidden="true" />
          {t.registeredSuccess}
        </div>
      )}

      <div className="auth-card-header">
        <h1>{t.heading}</h1>
        <p className="auth-card-sub">{t.sub}</p>
      </div>
      <LoginForm redirectTo={redirectTo} />
      <p className="auth-card-create">
        {t.noAccount}{" "}
        <Link href="/inscription" className="auth-link">{t.createAccount}</Link>
      </p>
    </div>
  );
}
