import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { canPublish, formatViews, journalistPath, type AuthorStats } from "../api/types";
import { useAuth } from "../auth/AuthContext";

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export function DashboardPage() {
  const { id: subjectId } = useParams();
  const viewingOther = Boolean(subjectId);
  const { user } = useAuth();
  const [stats, setStats] = useState<AuthorStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || (!viewingOther && !canPublish(user))) {
      return;
    }
    let cancelled = false;
    const request = viewingOther && subjectId ? api.adminAuthorStats(subjectId) : api.authorStats();
    request
      .then((next) => {
        if (!cancelled) {
          setStats(next);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudieron cargar las estadísticas");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user, subjectId, viewingOther]);

  if (!viewingOther && (!user || !canPublish(user))) {
    return (
      <section className="session-card">
        <h1>Estadísticas</h1>
        <p className="lede">Van a estar disponibles cuando tu cuenta pueda publicar.</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="session-card">
        <h1>Estadísticas</h1>
        <p className="alert">{error}</p>
      </section>
    );
  }

  if (!stats) {
    return <p className="lede">Cargando estadísticas…</p>;
  }

  const peak = Math.max(1, ...stats.months.map((month) => month.views));

  return (
    <>
      <section className="session-card">
        {viewingOther ? (
          <Link className="text-btn" to={`/app/users/${subjectId}`}>
            ← Ficha
          </Link>
        ) : null}
        <p className="eyebrow">{viewingOther ? "Profesional" : "Tu actividad"}</p>
        <h1>{viewingOther ? stats.authorName : "Estadísticas"}</h1>
        {viewingOther && stats.authorUsername ? <p className="profile-handle">@{stats.authorUsername}</p> : null}
        <p className="lede">Cada persona suma una sola vista por nota. Si vuelve a entrar, no se vuelve a contar.</p>
        {viewingOther && stats.publicProfile && subjectId ? (
          <p>
            <Link to={journalistPath({ id: subjectId, username: stats.authorUsername })}>Ver perfil público</Link>
          </p>
        ) : null}
        <ul className="profile-stats">
          <li>
            <strong>{stats.totalViews}</strong>
            <span>{stats.totalViews === 1 ? "vista" : "vistas"}</span>
          </li>
          <li>
            <strong>{stats.viewsThisMonth}</strong>
            <span>este mes</span>
          </li>
          <li>
            <strong>{stats.publishedArticles}</strong>
            <span>{stats.publishedArticles === 1 ? "nota" : "notas"}</span>
          </li>
          <li>
            <strong>{stats.followers}</strong>
            <span>{stats.followers === 1 ? "seguidor" : "seguidores"}</span>
          </li>
          <li>
            <strong>{stats.subscribers}</strong>
            <span>{stats.subscribers === 1 ? "suscriptor" : "suscriptores"}</span>
          </li>
        </ul>
      </section>

      <section className="session-card">
        <h2>Vistas por mes</h2>
        <p className="lede">Personas distintas que leyeron en cada mes. El total de arriba también incluye las vistas anteriores.</p>
        <div className="month-chart" role="img" aria-label="Vistas de los últimos 12 meses">
          {stats.months.map((month) => (
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
        <h2>Por nota</h2>
        {stats.articles.length === 0 ? (
          <p className="lede">Cuando publiques, las vistas de cada nota aparecen acá.</p>
        ) : (
          <div className="table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Nota</th>
                  <th>Vistas</th>
                </tr>
              </thead>
              <tbody>
                {stats.articles.map((article) => (
                  <tr key={article.id}>
                    <td>
                      <Link to={`/nota/${article.slug}`}>{article.title}</Link>
                    </td>
                    <td>{formatViews(article.views)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
