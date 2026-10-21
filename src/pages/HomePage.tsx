import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, mediaUrl } from "../api/client";
import { displayName, roleLabel, type AppNotification, type User } from "../api/types";
import { useAuth } from "../auth/AuthContext";

function profileScore(user: User) {
  const fields = [
    user.firstName,
    user.lastName,
    user.phone,
    user.documentNumber,
    user.birthDate,
    user.street,
    user.city,
    user.province,
    user.postalCode,
    user.avatarUrl,
  ];
  const filled = fields.filter((value) => Boolean(value && String(value).trim())).length;
  return Math.round((filled / fields.length) * 100);
}

export function HomePage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    let cancelled = false;
    api
      .listNotifications()
      .then((items) => {
        if (!cancelled) {
          setNotifications(items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNotifications([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!user) {
    return null;
  }

  const score = profileScore(user);
  const photo = mediaUrl(user.avatarUrl);
  const incomplete = score < 100;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <>
      <section className="session-card hero-home">
        <div className="hero-home-copy">
          <p className="eyebrow">Inicio</p>
          <h1>
            {greeting}, {user.firstName}
          </h1>
          <p className="lede">
            Tu panel. Desde acá vas a la portada, a tu perfil y, si sos periodista verificado, a la redacción.
          </p>
        </div>
        <div className="hero-home-side">
          {photo ? (
            <img className="avatar-photo xl" src={photo} alt="" />
          ) : (
            <span className="avatar xl" aria-hidden>
              {(user.firstName?.[0] ?? "").toUpperCase()}
              {(user.lastName?.[0] ?? "").toUpperCase()}
            </span>
          )}
          <p className="hero-home-email">{user.email}</p>
          <span className="pill on">{roleLabel(user.role)}</span>
        </div>
      </section>

      {incomplete ? (
        <section className="session-card callout-card">
          <div>
            <h2>Completá tu perfil</h2>
            <p className="lede">
              Llevás un {score}% de tus datos. Cuanto más completo, mejor queda listo para el producto.
            </p>
            <div className="progress-track" aria-hidden>
              <span className="progress-fill" style={{ width: `${score}%` }} />
            </div>
          </div>
          <Link className="btn-primary btn-inline" to="/app/profile">
            Ir al perfil
          </Link>
        </section>
      ) : null}

      {notifications.length > 0 ? (
        <section className="session-card">
          <h2>Avisos</h2>
          <ul className="category-list">
            {notifications.map((item) => (
              <li key={item.id}>
                <span>
                  {item.authorName} publicó{" "}
                  <Link to={`/nota/${item.articleSlug}`}>{item.articleTitle}</Link>
                </span>
                {!item.read ? (
                  <button
                    type="button"
                    className="text-btn"
                    onClick={() => {
                      void api.markNotificationRead(item.id).then((next) => {
                        setNotifications((current) => current.map((entry) => (entry.id === next.id ? next : entry)));
                      });
                    }}
                  >
                    Marcar leído
                  </button>
                ) : (
                  <span className="hint-inline">Leído</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="home-grid">
        <Link className="home-tile" to="/">
          <span className="home-tile-icon" aria-hidden>
            ▣
          </span>
          <strong>Portada</strong>
          <p>Notas publicadas por periodistas verificados.</p>
        </Link>
        <Link className="home-tile" to="/app/profile">
          <span className="home-tile-icon" aria-hidden>
            ◇
          </span>
          <strong>Mi perfil</strong>
          <p>Nombre, documento, celular y domicilio.</p>
        </Link>
        <Link className="home-tile" to="/app/account">
          <span className="home-tile-icon" aria-hidden>
            ▣
          </span>
          <strong>Cuenta y seguridad</strong>
          <p>Cambiá tu contraseña y revisá el estado de la cuenta.</p>
        </Link>
        {user.role === "JOURNALIST" ? (
          <Link className="home-tile" to="/app/redaccion">
            <span className="home-tile-icon" aria-hidden>
              ✎
            </span>
            <strong>Redacción</strong>
            <p>Borradores y publicación, cuando tu cuenta esté aprobada.</p>
          </Link>
        ) : null}
        {user.role === "ADMIN" ? (
          <>
            <Link className="home-tile" to="/app/users">
              <span className="home-tile-icon" aria-hidden>
                ▤
              </span>
              <strong>Usuarios</strong>
              <p>Administrá altas, roles y estados.</p>
            </Link>
            <Link className="home-tile" to="/admin/verify-journalists">
              <span className="home-tile-icon" aria-hidden>
                ✓
              </span>
              <strong>Verificación</strong>
              <p>Aprobá periodistas y archivá notas.</p>
            </Link>
          </>
        ) : null}
      </section>

      <section className="session-card">
        <h2>Resumen</h2>
        <dl className="meta">
          <div>
            <dt>Nombre</dt>
            <dd>{displayName(user)}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Estado</dt>
            <dd>{user.enabled === false ? "Inactivo" : "Activo"}</dd>
          </div>
        </dl>
      </section>
    </>
  );
}
