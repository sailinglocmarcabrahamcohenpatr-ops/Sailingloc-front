import { LocaleLink as Link } from "@/shared/i18n";
import { getDictionary, getRequestLocale } from "@/shared/i18n/get-dictionary";

export default async function NotFound() {
  const t = getDictionary(await getRequestLocale()).notFound;

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        textAlign: "center",
        padding: "80px 24px",
        gap: "24px",
      }}
    >
      <div style={{ fontSize: "4rem", color: "var(--primary)" }}>
        <i className="fa-solid fa-anchor" aria-hidden="true" />
      </div>
      <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", color: "var(--text)" }}>
        {t.heading}
      </h1>
      <p style={{ color: "var(--text-2)", maxWidth: "400px", lineHeight: 1.7 }}>
        {t.sub}
      </p>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/" className="btn btn-primary">
          <i className="fa-solid fa-house" aria-hidden="true" /> {t.btnHome}
        </Link>
        <Link href="/bateaux" className="btn btn-outline">
          <i className="fa-solid fa-sailboat" aria-hidden="true" /> {t.btnBoats}
        </Link>
      </div>
    </div>
  );
}
