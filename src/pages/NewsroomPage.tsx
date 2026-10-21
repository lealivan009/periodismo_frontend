import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { formatDateTime, formatViews } from "../api/types";
import type { Article } from "../api/types";
import { canPublish, verificationLabel } from "../api/types";
import { useAuth } from "../auth/AuthContext";

const statusLabel: Record<Article["status"], string> = {
  DRAFT: "Borrador",
  PUBLISHED: "Publicada",
  ARCHIVED: "Archivada",
};

export function NewsroomPage() {
  const { user, replaceDegree } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [degree, setDegree] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const approved = user ? canPublish(user) : false;

  useEffect(() => {
    if (!approved) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    api
      .myArticles()
      .then((items) => {
        if (!cancelled) {
          setArticles(items);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudieron cargar las notas");
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
  }, [approved]);

  if (!user || user.role !== "JOURNALIST") {
    return (
      <section className="session-card">
        <h1>Redacción</h1>
        <p className="lede">Esta sección es para cuentas de periodista.</p>
        <Link to="/register">Solicitar una cuenta de periodista</Link>
      </section>
    );
  }

  async function onDegree(event: FormEvent) {
    event.preventDefault();
    if (!degree) {
      setError("Adjuntá el título o la matrícula");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      await replaceDegree(degree);
      setNotice("Documento enviado. La solicitud volvió a pendiente.");
      setDegree(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir el documento");
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <section className="session-card">
        <p className="eyebrow">Redacción</p>
        <h1>Tus notas</h1>
        <p className="lede">Estado: {verificationLabel(user.verificationStatus)}.</p>
        {approved ? (
          <Link className="btn-primary btn-inline" to="/app/redaccion/nueva">
            Nueva nota
          </Link>
        ) : (
          <p className="lede">
            {user.verificationStatus === "REJECTED"
              ? "La verificación fue rechazada. Podés cargar el título de nuevo."
              : "Cuando un administrador apruebe tu título vas a poder publicar."}
          </p>
        )}
      </section>

      {!approved && user.verificationStatus !== "APPROVED" ? (
        <form className="session-card" onSubmit={onDegree}>
          <h2>Título o matrícula</h2>
          <p className="lede">PDF, JPG, PNG o WEBP. Máximo 8 MB.</p>
          {error ? <p className="alert">{error}</p> : null}
          {notice ? <p className="alert ok">{notice}</p> : null}
          <label className="field" htmlFor="degree">
            <span className="field-label">Archivo</span>
            <input
              id="degree"
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              onChange={(event) => setDegree(event.target.files?.[0] ?? null)}
            />
          </label>
          <button className="btn-primary btn-inline" type="submit" disabled={uploading}>
            {uploading ? "Enviando…" : "Enviar documento"}
          </button>
        </form>
      ) : null}

      {approved ? (
        <section className="session-card">
          {error ? <p className="alert">{error}</p> : null}
          {loading ? <p className="lede">Cargando…</p> : null}
          {!loading && articles.length === 0 ? <p className="lede">Todavía no tenés notas.</p> : null}
          {articles.length > 0 ? (
            <div className="table-wrap">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Estado</th>
                    <th>Vistas</th>
                    <th>Actualizada</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr key={article.id}>
                      <td>{article.title}</td>
                      <td>{statusLabel[article.status]}</td>
                      <td>{formatViews(article.viewCount)}</td>
                      <td>{formatDateTime(article.updatedAt)}</td>
                      <td className="actions">
                        <Link className="text-btn" to={`/app/redaccion/${article.id}`}>
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      ) : null}
    </>
  );
}
