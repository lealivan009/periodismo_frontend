import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { api } from "../api/client";
import type { ArticleSummary } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { ArticleCard } from "../components/ArticleCard";

export function FrontPage() {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const paper = pathname === "/diario" || Boolean(slug);
  const personal = Boolean(user) && user?.role !== "ADMIN" && !paper;
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const nextArticles = await api.listArticles(slug, personal);
        if (!cancelled) {
          setArticles(nextArticles);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudo cargar la portada");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug, personal, user?.id]);

  if (user?.role === "ADMIN" && !paper) {
    return <Navigate to="/app" replace />;
  }

  return (
    <>
      {error ? <p className="alert">{error}</p> : null}
      {loading ? <p className="lede">Cargando notas…</p> : null}
      {!loading && articles.length === 0 ? (
        <section className="session-card">
          {personal ? (
            <>
              <h2>Todavía no hay notas para vos</h2>
              <p className="lede">Seguí a los profesionales que te interesan para ver sus notas en la portada.</p>
              <p>
                <Link to="/profesionales">Ver profesionales</Link>
              </p>
            </>
          ) : (
            <>
              <h2>Todavía no hay notas publicadas</h2>
              <p className="lede">Cuando un profesional publique, las notas van a aparecer acá.</p>
            </>
          )}
        </section>
      ) : (
        <div className="news-grid">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </>
  );
}
