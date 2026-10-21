import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api } from "../api/client";
import { displayName, type ArticleSummary, type Category, type JournalistApplication } from "../api/types";
import { Field } from "../components/AuthForm";

function formatDate(value: string) {
  return new Date(value).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
}

export function VerifyJournalistsPage() {
  const [applications, setApplications] = useState<JournalistApplication[]>([]);
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ url: string; type: string; name: string } | null>(null);
  const [categoryName, setCategoryName] = useState("");

  const load = useCallback(async () => {
    const [pending, published, allCategories] = await Promise.all([
      api.listApplications("PENDING"),
      api.adminArticles(),
      api.adminCategories(),
    ]);
    setApplications(pending);
    setArticles(published);
    setCategories(allCategories);
  }, []);

  useEffect(() => {
    let cancelled = false;
    load()
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudo cargar el panel");
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
  }, [load]);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview]);

  async function run(id: string, action: () => Promise<unknown>, message: string) {
    setActing(id);
    setError(null);
    setNotice(null);
    try {
      await action();
      await load();
      setNotice(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo completar la acción");
    } finally {
      setActing(null);
    }
  }

  async function openDocument(application: JournalistApplication) {
    setActing(application.id);
    setError(null);
    try {
      const blob = await api.degreeDocument(application.id);
      if (preview) {
        URL.revokeObjectURL(preview.url);
      }
      setPreview({
        url: URL.createObjectURL(blob),
        type: blob.type,
        name: displayName(application),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo abrir el documento");
    } finally {
      setActing(null);
    }
  }

  async function onCreateCategory(event: FormEvent) {
    event.preventDefault();
    if (!categoryName.trim()) {
      return;
    }
    setError(null);
    try {
      await api.createCategory(categoryName.trim());
      setCategoryName("");
      await load();
      setNotice("Categoría creada");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la categoría");
    }
  }

  return (
    <>
      <section className="session-card">
        <p className="eyebrow">Administración</p>
        <h1>Verificación de periodistas</h1>
        <p className="lede">Revisá el título antes de habilitar la publicación.</p>
        {error ? <p className="alert">{error}</p> : null}
        {notice ? <p className="alert ok">{notice}</p> : null}
        {loading ? <p className="lede">Cargando…</p> : null}
        {!loading && applications.length === 0 ? <p className="lede">No hay solicitudes pendientes.</p> : null}
        {applications.length > 0 ? (
          <div className="table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Especialidad</th>
                  <th>Alta</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id}>
                    <td>{displayName(application)}</td>
                    <td>{application.email}</td>
                    <td>{application.specialty || "—"}</td>
                    <td>{formatDate(application.createdAt)}</td>
                    <td className="actions">
                      <button
                        type="button"
                        className="text-btn"
                        disabled={acting === application.id || !application.hasDocument}
                        onClick={() => void openDocument(application)}
                      >
                        Ver título
                      </button>
                      <button
                        type="button"
                        className="text-btn"
                        disabled={acting === application.id}
                        onClick={() => void run(application.id, () => api.approveJournalist(application.id), "Periodista aprobado")}
                      >
                        Aprobar
                      </button>
                      <button
                        type="button"
                        className="text-btn danger"
                        disabled={acting === application.id}
                        onClick={() => void run(application.id, () => api.rejectJournalist(application.id), "Solicitud rechazada")}
                      >
                        Rechazar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {preview ? (
          <div className="doc-preview">
            <strong>{preview.name}</strong>
            {preview.type.startsWith("image/") ? (
              <img src={preview.url} alt="Título profesional" />
            ) : (
              <iframe title="Título profesional" src={preview.url} />
            )}
          </div>
        ) : null}
      </section>

      <section className="session-card">
        <h2>Notas publicadas</h2>
        <p className="lede">Archivar las saca de la portada sin borrarlas.</p>
        {articles.length === 0 ? <p className="lede">No hay notas publicadas.</p> : null}
        {articles.length > 0 ? (
          <div className="table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Autor</th>
                  <th>Categoría</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id}>
                    <td>{article.title}</td>
                    <td>{article.authorName}</td>
                    <td>{article.categoryName}</td>
                    <td className="actions">
                      <button
                        type="button"
                        className="text-btn danger"
                        disabled={acting === article.id}
                        onClick={() => void run(article.id, () => api.adminArchiveArticle(article.id), "Nota archivada")}
                      >
                        Archivar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section className="session-card">
        <h2>Categorías</h2>
        <p className="lede">Las secciones del diario. Las nuevas aparecen en el editor y en la barra.</p>
        <ul className="category-list">
          {categories.map((category) => (
            <li key={category.id}>
              <span>
                {category.name} <small>/categoria/{category.slug}</small>
              </span>
              <button
                type="button"
                className="text-btn"
                onClick={() =>
                  void run(
                    category.id,
                    () => api.updateCategory(category.id, { active: !category.active }),
                    category.active ? "Categoría ocultada" : "Categoría activada"
                  )
                }
              >
                {category.active ? "Ocultar" : "Activar"}
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={onCreateCategory}>
          <Field id="categoryName" label="Nueva categoría" value={categoryName} onChange={setCategoryName} required={false} />
          <button className="btn-primary btn-inline" type="submit">
            Agregar
          </button>
        </form>
      </section>
    </>
  );
}
