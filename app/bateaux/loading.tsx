export default function BoatsLoading() {
  return (
    <div className="skeleton-page" aria-busy="true" aria-label="Chargement des bateaux…">
      <div className="container">
        <div className="boats-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-card" aria-hidden="true">
              <div className="skeleton skeleton-img" />
              <div className="skeleton-body">
                <div className="skeleton skeleton-line skeleton-title" />
                <div className="skeleton skeleton-line" />
                <div className="skeleton skeleton-line skeleton-short" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
