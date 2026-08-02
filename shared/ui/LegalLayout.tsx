import type { ReactNode } from "react";

export interface LegalTocItem {
  id: string;
  label: string;
}

interface LegalLayoutProps {
  icon: string;
  tag: string;
  title: string;
  description: string;
  updated: string;
  toc: LegalTocItem[];
  children: ReactNode;
}

export default function LegalLayout({ icon, tag, title, description, updated, toc, children }: LegalLayoutProps) {
  return (
    <>
      <section className="legal-hero">
        <div className="container">
          <div className="legal-hero-tag">
            <i className={`fa-solid ${icon}`} aria-hidden="true" /> {tag}
          </div>
          <h1>{title}</h1>
          <p className="legal-hero-sub">{description}</p>
          <div className="legal-hero-updated">
            <i className="fa-regular fa-clock" aria-hidden="true" /> Dernière mise à jour : {updated}
          </div>
        </div>
      </section>

      <div className="container legal-wrap">
        <nav className="legal-toc" aria-label="Sommaire">
          <h5>Sommaire</h5>
          <ul>
            {toc.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="legal-content">{children}</div>
      </div>
    </>
  );
}
