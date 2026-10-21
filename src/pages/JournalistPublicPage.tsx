import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, mediaUrl } from "../api/client";
import { displayName, journalistPath, type JournalistProfile, type RelationState } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { ArticleCard } from "../components/ArticleCard";
import { SocialLinks } from "../components/SocialLinks";
import { VerifiedBadge } from "../components/VerifiedBadge";

export function JournalistPublicPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<JournalistProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<"follow" | "subscribe" | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }
    let cancelled = false;
    setProfile(null);
    setError(null);
    api
      .getJournalist(id)
      .then((next) => {
        if (!cancelled) {
          setProfile(next);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setProfile(null);
          setError(err instanceof Error ? err.message : "No se encontró el perfil");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id, user?.id]);

  useEffect(() => {
    if (!profile?.username || !id) {
      return;
    }
    const samePerson = id === profile.id || id.toLowerCase() === profile.username.toLowerCase();
    if (samePerson && id !== profile.username) {
      navigate(journalistPath(profile), { replace: true });
    }
  }, [id, navigate, profile]);

  useEffect(() => {
    if (!notice) {
      return;
    }
    const timer = window.setTimeout(() => setNotice(null), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  async function toggle(kind: "follow" | "subscribe") {
    if (!profile) {
      return;
    }
    setBusy(kind);
    setNotice(null);
    try {
      const next: RelationState =
        kind === "follow"
          ? profile.following
            ? await api.unfollow(profile.id)
            : await api.follow(profile.id)
          : profile.subscribed
            ? await api.unsubscribe(profile.id)
            : await api.subscribe(profile.id);
      setProfile({ ...profile, ...next });
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "No se pudo actualizar");
    } finally {
      setBusy(null);
    }
  }

  if (error && !profile) {
    return (
      <section className="session-card">
        <p className="alert">{error}</p>
        <Link to="/periodistas">Volver al listado</Link>
      </section>
    );
  }

  if (!profile) {
    return <p className="lede">Cargando perfil…</p>;
  }

  const photo = mediaUrl(profile.avatarUrl);
  const ownProfile = user?.id === profile.id;
  const loginNext = `/login?next=${encodeURIComponent(journalistPath(profile))}`;

  return (
    <>
      <section className="session-card profile-hero">
        <div className="profile-hero-row">
          {photo ? (
            <img className="avatar-photo xl" src={photo} alt="" />
          ) : (
            <span className="avatar xl" aria-hidden>
              {(profile.firstName?.[0] ?? "").toUpperCase()}
              {(profile.lastName?.[0] ?? "").toUpperCase()}
            </span>
          )}
          <div>
            <p className="eyebrow">{profile.specialty || "Profesional"}</p>
            <h1>
              {displayName(profile)}
              <VerifiedBadge />
            </h1>
            {profile.username ? <p className="profile-handle">@{profile.username}</p> : null}
          </div>
        </div>
        <div className="profile-hero-body">
            {profile.bio ? <p className="profile-description">{profile.bio}</p> : null}
            <SocialLinks xUrl={profile.xUrl} instagramUrl={profile.instagramUrl} facebookUrl={profile.facebookUrl} />
            <p className="news-card-meta">
              <span>{notesLabel(profile.articleCount ?? profile.articles.length)}</span>
              <span>{profile.followers} seguidores</span>
              <span>{profile.subscribers} suscriptores</span>
            </p>
            {ownProfile ? null : (
              <div className="form-actions">
                {user ? (
                  <>
                    <button
                      type="button"
                      className="btn-primary btn-inline"
                      disabled={busy !== null}
                      onClick={() => toggle("follow")}
                    >
                      {profile.following ? "Dejar de seguir" : "Seguir"}
                    </button>
                    <button
                      type="button"
                      className="btn-ghost btn-inline"
                      disabled={busy !== null}
                      onClick={() => toggle("subscribe")}
                    >
                      {profile.subscribed ? "Cancelar suscripción" : "Suscribirse"}
                    </button>
                  </>
                ) : (
                  <Link className="btn-primary btn-inline" to={loginNext}>
                    Entrá para seguir
                  </Link>
                )}
              </div>
            )}
            {notice ? (
              <p className="alert inline-alert" role="status">
                <span>{notice}</span>
                <button type="button" className="alert-close" onClick={() => setNotice(null)} aria-label="Cerrar aviso">
                  ×
                </button>
              </p>
            ) : null}
        </div>
      </section>
      <h2 className="section-title">Notas publicadas</h2>
      {profile.articles.length === 0 ? (
        <p className="lede">Todavía no publicó notas.</p>
      ) : (
        <div className="news-grid">
          {profile.articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </>
  );
}

function notesLabel(count: number) {
  return count === 1 ? "1 nota" : `${count} notas`;
}
