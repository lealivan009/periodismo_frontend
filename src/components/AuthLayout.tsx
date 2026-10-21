import type { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <aside className="brand-panel">
        <div className="brand-mark">PV</div>
        <p className="brand-kicker">Periódico</p>
        <h2>Solo publica quien está verificado.</h2>
        <p>
          Lectores, periodistas con título revisado y un administrador que aprueba cada solicitud.
          Las secciones arrancan con Política, Economía, Deportes y las demás categorías del diario.
        </p>
        <ul className="brand-points">
          <li>Registro de lector o periodista</li>
          <li>Verificación del título</li>
          <li>Notas, seguidores y suscripciones</li>
        </ul>
      </aside>
      <main className="form-panel">{children}</main>
    </div>
  );
}
