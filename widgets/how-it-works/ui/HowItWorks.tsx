const steps = [
  {
    number: "1",
    icon: "fa-magnifying-glass",
    title: "Cherchez",
    description:
      "Choisissez votre destination, vos dates et le type de bateau idéal parmi des centaines d'annonces vérifiées.",
  },
  {
    number: "2",
    icon: "fa-shield-halved",
    title: "Réservez",
    description:
      "Confirmez votre réservation en ligne en toute sécurité. Paiement sécurisé et assurance incluse.",
  },
  {
    number: "3",
    icon: "fa-compass",
    title: "Naviguez",
    description:
      "Prenez le large et profitez de votre aventure nautique. Notre équipe reste disponible 24h/24.",
  },
];

export default function HowItWorks() {
  return (
    <section
      className="section-py how-section"
      id="comment-ca-marche"
      aria-labelledby="how-title"
    >
      <div className="container">
        <div
          className="section-hd fade-in"
          style={{
            justifyContent: "center",
            textAlign: "center",
            flexDirection: "column",
            gap: "12px",
            marginBottom: "48px",
          }}
        >
          <h2 className="section-title" id="how-title">
            Comment ça marche
          </h2>
          <p style={{ color: "var(--text-2)", maxWidth: "520px", margin: "0 auto" }}>
            Louez un bateau en 3 étapes simples et partez naviguer où vous voulez.
          </p>
        </div>
        <div className="how-grid">
          {steps.map((step) => (
            <div key={step.number} className="how-card fade-in">
              <div className="how-number" aria-hidden="true">{step.number}</div>
              <div className="how-icon">
                <i className={`fa-solid ${step.icon}`} aria-hidden="true" />
              </div>
              <h4>{step.title}</h4>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
