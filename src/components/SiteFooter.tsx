import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { Category } from "../api/types";
const SECTION_ORDER = [
  "politica",
  "economia",
  "sociedad",
  "internacional",
  "deportes",
  "cultura",
  "espectaculos",
  "tecnologia",
];

function bySection(left: Category, right: Category) {
  const leftIndex = SECTION_ORDER.indexOf(left.slug);
  const rightIndex = SECTION_ORDER.indexOf(right.slug);
  return (leftIndex === -1 ? SECTION_ORDER.length : leftIndex) - (rightIndex === -1 ? SECTION_ORDER.length : rightIndex);
}

export function SiteFooter() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let cancelled = false;
    api
      .listCategories()
      .then((items) => {
        if (!cancelled) {
          setCategories([...items].sort(bySection));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCategories([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <strong>Enfoque Digital</strong>
            <p>
              Información confiable, escrita por quien sabe del tema. Periodistas, médicos, ingenieros, docentes y
              otros profesionales.
            </p>
        </div>
        {categories.length > 0 ? (
          <div>
            <p className="site-footer-label">Secciones</p>
            <nav aria-label="Secciones">
              {categories.map((category) => (
                <Link key={category.id} to={`/categoria/${category.slug}`}>
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>
        ) : null}
        <div>
          <p className="site-footer-label">El diario</p>
          <nav aria-label="El diario">
            <Link to="/">Portada</Link>
            <Link to="/profesionales">Profesionales</Link>
          </nav>
        </div>
      </div>
      <p className="site-footer-copy">© {new Date().getFullYear()} Enfoque Digital</p>
    </footer>
  );
}
