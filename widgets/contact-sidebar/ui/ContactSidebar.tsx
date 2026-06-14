const contacts = [
  {
    icon: "fa-envelope",
    label: "Email",
    value: "contact@sailingloc.com",
    sub: "Réponse sous 24-48h ouvrées",
    badge: { text: "Rapide", class: "badge-green" },
  },
  {
    icon: "fa-phone",
    label: "Téléphone",
    value: "+33 1 23 45 67 89",
    sub: "Lun–Ven · 9h00 – 18h00",
    badge: { text: "Lun–Ven", class: "badge-orange" },
  },
  {
    icon: "fa-brands fa-whatsapp",
    label: "WhatsApp",
    value: "+33 6 12 34 56 78",
    sub: "Réponse rapide en journée",
  },
  {
    icon: "fa-clock",
    label: "Horaires d'ouverture",
    value: "Lun–Ven : 9h – 18h",
    sub: "Sam : 9h – 13h",
  },
];

export default function ContactSidebar() {
  return (
    <aside className="contact-sidebar">
      <div className="contact-info-card">
        <h4>
          <i className="fa-solid fa-circle-info" style={{ color: "var(--primary)" }} aria-hidden="true" />{" "}
          Nous contacter directement
        </h4>
        {contacts.map((c) => (
          <div key={c.label} className="contact-info-item">
            <div className="contact-info-icon">
              <i className={c.icon} aria-hidden="true" />
            </div>
            <div className="contact-info-text">
              <small>{c.label}</small>
              <strong>{c.value}</strong>
              <p>{c.sub}</p>
            </div>
            {c.badge && (
              <div className={`contact-info-badge ${c.badge.class}`}>{c.badge.text}</div>
            )}
          </div>
        ))}
      </div>

      <div className="urgence-card" role="region" aria-label="Aide d'urgence">
        <div className="urgence-card-title">
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
          Aide d'urgence
        </div>
        {[
          { label: "Urgence en mer", value: "CROSS : 196" },
          { label: "Assistance SailingLoc 24h/7j", value: "+33 8 00 XX XX XX" },
          { label: "WhatsApp urgences", value: "+33 6 XX XX XX XX" },
        ].map((row) => (
          <div key={row.label} className="urgence-row">
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </div>
        ))}
        <p style={{ fontSize: ".75rem", color: "#991B1B", marginTop: "12px", lineHeight: 1.6 }}>
          En cas de danger immédiat en mer, composez le <strong>196</strong> (CROSS) ou le{" "}
          <strong>15</strong> (SAMU) depuis terre.
        </p>
      </div>

      <div className="contact-info-card">
        <h4>
          <i className="fa-solid fa-share-nodes" style={{ color: "var(--primary)" }} aria-hidden="true" />{" "}
          Suivez-nous
        </h4>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {[
            { icon: "fa-brands fa-facebook", label: "Facebook" },
            { icon: "fa-brands fa-instagram", label: "Instagram" },
            { icon: "fa-brands fa-x-twitter", label: "Twitter / X" },
          ].map((sn) => (
            <a
              key={sn.label}
              href="#"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "10px 16px",
                borderRadius: "var(--radius)",
                border: "1.5px solid var(--border)",
                fontSize: ".8125rem",
                fontWeight: 600,
                color: "var(--text)",
                transition: "var(--transition)",
              }}
            >
              <i className={sn.icon} style={{ fontSize: "1.1rem" }} aria-hidden="true" />
              {sn.label}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
