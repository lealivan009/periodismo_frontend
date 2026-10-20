import type { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <aside className="brand-panel">
        <div className="brand-mark">AB</div>
        <p className="brand-kicker">Auth Base</p>
        <h2>Un acceso limpio, listo para reutilizar.</h2>
        <p>
          Login genérico con JWT, refresh tokens y una API desacoplada. Copiá este
          proyecto y conectá el resto de tu producto.
        </p>
        <ul className="brand-points">
          <li>Quarkus + MySQL</li>
          <li>React + Vite</li>
          <li>Listo para Railway</li>
        </ul>
      </aside>
      <main className="form-panel">{children}</main>
    </div>
  );
}
