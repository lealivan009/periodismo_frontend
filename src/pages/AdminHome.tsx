import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { formatViews, journalistPath, type AdminOverview } from "../api/types";

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export function AdminHome() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .adminOverview()
      .then((next) => {
        if (!cancelled) {
          setOverview(next);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudo cargar el rendimiento");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <section className="session-card">
        <h1>Gestión</h1>
        <p className="alert">{error}</p>
      </section>
    );
  }

  if (!overview) {
    return <p className="lede">Cargando gestión…</p>;
  }

  const peak = Math.max(1, ...overview.months.map((month) => month.views));

  return (
    <>
      <section className="session-card">
        <p className="eyebrow">Gestión</p>
        <h1>Rendimiento del diario</h1>
        <p className="lede">Vistas de todo el diario, profesionales y lo que falta revisar.</p>
        <ul className="profile-stats">
          <li>
            <strong>{overview.totalViews}</strong>
            <span>{overview.totalViews === 1 ? "vista" : "vistas"}</span>
          </li>
          <li>
            <strong>{overview.viewsThisMonth}</strong>
            <span>este mes</span>
          </li>
          <li>
            <strong>{overview.publishedArticles}</strong>
            <span>{overview.publishedArticles === 1 ? "nota" : "notas"}</span>
          </li>
          <li>
            <strong>{overview.professionals}</strong>
            <span>{overview.professionals === 1 ? "profesional" : "profesionales"}</span>
          </li>
          <li>
            <strong>{overview.pendingProfessionals}</strong>
            <span>en revisión</span>
          </li>
          <li>
            <strong>{overview.readers}</strong>
            <span>{overview.readers === 1 ? "lector" : "lectores"}</span>
          </li>
        </ul>
      </section>

      <section className="session-card">
        <h2>Vistas por mes</h2>
        <p className="lede">Personas distintas que leyeron una nota en cada mes.</p>
        <div className="month-chart" role="img" aria-label="Vistas del diario en los últimos 12 meses">
          {overview.months.map((month) => (
            <div className="month-col" key={`${month.year}-${month.month}`}>
              <span className="month-col-value">{month.views > 0 ? month.views : ""}</span>
              <span className="month-col-track">
                <span
                  className={month.views > 0 ? "month-col-fill" : "month-col-fill empty"}
                  style={{ height: `${Math.max(month.views > 0 ? 12 : 4, Math.round((month.views / peak) * 120))}px` }}
                />
              </span>
              <span className="month-col-label">{MONTHS[month.month - 1]}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="session-card">
        <h2>Profesionales</h2>
        {overview.ranking.length === 0 ? (
          <p className="lede">Cuando publiquen, el rendimiento de cada uno aparece acá.</p>
        ) : (
          <div className="table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Profesional</th>
                  <th>Notas</th>
                  <th>Vistas</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {overview.ranking.map((person) => (
                  <tr key={person.id}>
                    <td>
                      {person.publicProfile ? (
                        <Link to={journalistPath(person)}>{person.name}</Link>
                      ) : (
                        person.name
                      )}
                      {person.username ? <div className="hint-inline">@{person.username}</div> : null}
                    </td>
                    <td>{person.articles}</td>
                    <td>{formatViews(person.views)}</td>
                    <td className="actions">
                      <Link className="text-btn" to={`/app/users/${person.id}`}>
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="home-grid">
        <Link className="home-tile" to="/app/users">
          <strong>Usuarios</strong>
          <p>Altas, roles y el estado de cada cuenta.</p>
        </Link>
        <Link className="home-tile" to="/admin/verify-journalists">
          <strong>Verificación</strong>
          <p>Profesionales que esperan revisión y notas para archivar.</p>
        </Link>
        <Link className="home-tile" to="/app/settings">
          <strong>Sistema</strong>
          <p>Configuración general del diario.</p>
        </Link>
        <Link className="home-tile" to="/diario">
          <strong>Diario</strong>
          <p>La portada pública, con todas las notas publicadas.</p>
        </Link>
      </section>
    </>
  );
}
