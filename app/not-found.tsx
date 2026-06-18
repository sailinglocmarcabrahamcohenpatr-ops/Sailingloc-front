import Link from "next/link";

export default function NotFound() {
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
      <div style={{ fontSize: "4rem", color: "var(--primary)" }}><i className="fa-solid fa-anchor" aria-hidden="true" /></div>
      <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", color: "var(--text)" }}>
        Page introuvable
      </h1>
      <p style={{ color: "var(--text-2)", maxWidth: "400px", lineHeight: 1.7 }}>
        Nous n'avons pas trouvé la page que vous cherchez. Elle a peut-être été déplacée ou n'existe
        plus.
      </p>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/" className="btn btn-primary">
          <i className="fa-solid fa-house" aria-hidden="true" /> Retour à l'accueil
        </Link>
        <Link href="/bateaux" className="btn btn-outline">
          <i className="fa-solid fa-sailboat" aria-hidden="true" /> Voir les bateaux
        </Link>
      </div>
    </div>
  );
}
