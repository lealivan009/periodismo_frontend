import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { UserMenu } from "./UserMenu";

export function AppShell() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="app-shell">
      <header className="app-nav">
        <NavLink to="/app" className="app-brand" end>
          <span className="brand-mark sm">AB</span>
          <strong>Auth Base</strong>
        </NavLink>
        <nav className="app-links">
          <NavLink to="/app" end>
            Inicio
          </NavLink>
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
    </div>
  );
}
