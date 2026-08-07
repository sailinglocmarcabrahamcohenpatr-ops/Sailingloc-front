import "./contact.css";

export default function ContactLoading() {
  return (
    <div className="skeleton-page" aria-busy="true" aria-label="Chargement…">
      <div className="skeleton skeleton-hero-full" aria-hidden="true" />
      <div className="container" style={{ paddingBlock: "64px" }}>
        <div className="contact-grid">
          <div className="skeleton skeleton-form-card" aria-hidden="true" />
          <div className="skeleton skeleton-sidebar" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
