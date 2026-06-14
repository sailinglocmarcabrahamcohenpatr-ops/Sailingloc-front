export default function ProductLoading() {
  return (
    <div className="skeleton-page" aria-busy="true" aria-label="Chargement du bateau…">
      <div className="container product-layout">
        <div className="product-main">
          <div className="skeleton skeleton-gallery" aria-hidden="true" />
          <div className="skeleton-body">
            <div className="skeleton skeleton-line skeleton-title" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line skeleton-short" />
          </div>
        </div>
        <aside className="skeleton-aside" aria-hidden="true">
          <div className="skeleton skeleton-booking-card" />
        </aside>
      </div>
    </div>
  );
}
