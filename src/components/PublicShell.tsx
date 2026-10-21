import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { api } from "../api/client";
import type { Category } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { JournalistSearch } from "./JournalistSearch";
import { SiteFooter } from "./SiteFooter";
import { UserMenu } from "./UserMenu";

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

export function PublicShell() {
  const { user, loading } = useAuth();
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
    <div className="app-shell">
      <header className="app-nav">
        <NavLink to="/" className="app-brand" end>
          <strong>Enfoque Digital</strong>
        </NavLink>
        <nav className="app-links">
          <NavLink to="/" end>
            Portada
          </NavLink>
          {categories.map((category) => (
            <NavLink key={category.id} to={`/categoria/${category.slug}`}>
              {category.name}
            </NavLink>
          ))}
        </nav>
        <div className="nav-tools">
          <JournalistSearch />
          {loading ? null : user ? (
            <UserMenu />
          ) : (
            <div className="public-auth">
              <Link to="/login">Entrar</Link>
              <Link className="btn-ghost" to="/register">
                Crear cuenta
              </Link>
            </div>
          )}
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
