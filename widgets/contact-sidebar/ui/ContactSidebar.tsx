import { getDictionary, getRequestLocale } from "@/shared/i18n/get-dictionary";
import "./contact-sidebar.css";

const CONTACT_ICONS = ["fa-envelope", "fa-phone", "fa-brands fa-whatsapp", "fa-clock"];
const BADGE_CLASSES = ["badge-green", "badge-orange", "", ""];
const SOCIAL = [
  { icon: "fa-brands fa-facebook", label: "Facebook" },
  { icon: "fa-brands fa-instagram", label: "Instagram" },
  { icon: "fa-brands fa-x-twitter", label: "Twitter / X" },
];

export default async function ContactSidebar() {
  const t = getDictionary(await getRequestLocale()).contactPage;

  return (
    <aside className="contact-sidebar">
      <div className="contact-info-card">
        <h4>
          <i className="fa-solid fa-circle-info" style={{ color: "var(--primary)" }} aria-hidden="true" />{" "}
          {t.sidebarTitle}
        </h4>
        {t.contacts.map((c, i) => (
          <div key={i} className="contact-info-item">
            <div className="contact-info-icon">
              <i className={CONTACT_ICONS[i]} aria-hidden="true" />
            </div>
            <div className="contact-info-text">
              <small>{c.label}</small>
              <strong>{c.value}</strong>
              <p>{c.sub}</p>
            </div>
            {c.badgeText && (
              <div className={`contact-info-badge ${BADGE_CLASSES[i]}`}>{c.badgeText}</div>
            )}
          </div>
        ))}
      </div>

      <div className="urgence-card" role="region" aria-label={t.urgenceAria}>
        <div className="urgence-card-title">
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
          {t.urgenceTitle}
        </div>
        {t.urgenceRows.map((row) => (
          <div key={row.label} className="urgence-row">
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </div>
        ))}
        <p style={{ fontSize: ".75rem", color: "#991B1B", marginTop: "12px", lineHeight: 1.6 }}>
          {t.urgenceWarning}
        </p>
      </div>

      <div className="contact-info-card">
        <h4>
          <i className="fa-solid fa-share-nodes" style={{ color: "var(--primary)" }} aria-hidden="true" />{" "}
          {t.socialTitle}
        </h4>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {SOCIAL.map((sn) => (
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
