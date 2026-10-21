import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, mediaUrl } from "../api/client";
import { displayName, journalistPath, type JournalistCard } from "../api/types";
import { matchesJournalist } from "../components/JournalistSearch";
import { SocialLinks } from "../components/SocialLinks";
import { VerifiedBadge } from "../components/VerifiedBadge";

export function JournalistsPage() {
  const [params] = useSearchParams();
  const query = params.get("q")?.trim() ?? "";
  const [journalists, setJournalists] = useState<JournalistCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .listJournalists()
      .then((items) => {
        if (!cancelled) {
          setJournalists(items);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudieron cargar los periodistas");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = journalists.filter((journalist) => matchesJournalist(journalist, query));

  return (
    <>
      <section className="session-card">
        <p className="eyebrow">Buscador</p>
        <h1>{query ? `Resultados para “${query}”` : "Periodistas verificados"}</h1>
        <p className="lede">
          {query
            ? "Coincidencias por nombre, usuario, especialidad o descripción."
            : "Solo se muestran periodistas verificados."}
        </p>
      </section>
      {error ? <p className="alert">{error}</p> : null}
      {loading ? <p className="lede">Cargando…</p> : null}
      {!loading && journalists.length === 0 ? (
        <section className="session-card">
          <p className="lede">Cuando se apruebe el primer periodista, va a aparecer en este listado.</p>
        </section>
      ) : null}
      {!loading && journalists.length > 0 && visible.length === 0 ? (
        <section className="session-card">
          <p className="lede">No hay periodistas con ese nombre.</p>
        </section>
      ) : null}
      {visible.length > 0 ? (
        <div className="journalist-grid">
          {visible.map((journalist) => {
            const photo = mediaUrl(journalist.avatarUrl);
            const initials = `${journalist.firstName?.[0] ?? ""}${journalist.lastName?.[0] ?? ""}`.toUpperCase();
            return (
              <article key={journalist.id} className="journalist-card">
                <Link className="journalist-card-link" to={journalistPath(journalist)}>
                  <div className="journalist-card-head">
                    {photo ? (
                      <img className="journalist-card-photo" src={photo} alt="" />
                    ) : (
                      <span className="avatar journalist-card-photo" aria-hidden>
                        {initials || "P"}
                      </span>
                    )}
                    <div>
                      <p className="eyebrow">{journalist.specialty || "Periodista"}</p>
                      <h2>
                        {displayName(journalist)}
                        <VerifiedBadge />
                      </h2>
                      {journalist.username ? <p className="profile-handle">@{journalist.username}</p> : null}
                      <p className="news-card-meta journalist-card-stats">
                        <span>{journalist.followers} seguidores</span>
                        <span>{journalist.subscribers} suscriptores</span>
                      </p>
                    </div>
                  </div>
                  {journalist.bio ? <p className="profile-description">{journalist.bio}</p> : null}
                </Link>
                <SocialLinks xUrl={journalist.xUrl} instagramUrl={journalist.instagramUrl} facebookUrl={journalist.facebookUrl} />
              </article>
            );
          })}
        </div>
      ) : null}
    </>
  );
}
