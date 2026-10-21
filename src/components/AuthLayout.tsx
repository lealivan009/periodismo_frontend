import type { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <aside className="brand-panel">
        <p className="brand-kicker">Enfoque Digital</p>
        <h2>Información confiable, de profesionales.</h2>
        <p>
          Lo que leés lo publicó alguien que sabe del tema, no una opinión al pasar. Puede ser un periodista, un
          médico, un ingeniero, un docente u otro profesional.
        </p>
        <ul className="brand-points">
          <li>Registro de lector o periodista</li>
          <li>Notas de profesionales</li>
          <li>Seguidores y suscripciones</li>
        </ul>
      </aside>
      <main className="form-panel">{children}</main>
    </div>
  );
}
