import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { SiteFooter } from "./SiteFooter";
import { UserMenu } from "./UserMenu";

export function AppShell() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const isJournalist = user?.role === "JOURNALIST";

  return (
    <div className="app-shell">
      <header className="app-nav">
        <NavLink to="/" className="app-brand">
          <strong>Enfoque Digital</strong>
        </NavLink>
        <nav className="app-links">
          <NavLink to="/" end>
            Portada
          </NavLink>
          <NavLink to="/app" end>
            Panel
          </NavLink>
          {isJournalist ? <NavLink to="/app/redaccion">Redacción</NavLink> : null}
          {isAdmin ? <NavLink to="/admin/verify-journalists">Verificación</NavLink> : null}
          {isAdmin ? <NavLink to="/app/users">Usuarios</NavLink> : null}
          {isAdmin ? (
            <NavLink to="/app/settings" title="Configuración del sistema">
              Sistema
            </NavLink>
          ) : null}
        </nav>
        <UserMenu />
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
