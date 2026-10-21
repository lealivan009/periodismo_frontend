import { NavLink, Outlet } from "react-router-dom";
import { canPublish } from "../api/types";
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
          {isAdmin ? (
            <>
              <NavLink to="/app" end>
                Gestión
              </NavLink>
              <NavLink to="/diario">Diario</NavLink>
              <NavLink to="/admin/verify-journalists">Verificación</NavLink>
              <NavLink to="/app/users">Usuarios</NavLink>
              <NavLink to="/app/settings" title="Configuración del sistema">
                Sistema
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/" end>
                Portada
              </NavLink>
              <NavLink to="/app" end>
                Panel
              </NavLink>
              {user && canPublish(user) ? <NavLink to="/app/estadisticas">Estadísticas</NavLink> : null}
              {isJournalist ? <NavLink to="/app/redaccion">Redacción</NavLink> : null}
            </>
          )}
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
