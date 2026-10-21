import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, mediaUrl } from "../api/client";
import type { ArticleStatus, Category } from "../api/types";
import { canPublish } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { Field } from "../components/AuthForm";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { RichTextEditor } from "../components/RichTextEditor";

export function EditorPage() {
  const { id } = useParams();
  const isNew = !id || id === "nueva";
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("<p></p>");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<ArticleStatus>("DRAFT");
  const [cover, setCover] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .listCategories()
      .then((items) => {
        if (cancelled) {
          return;
        }
        setCategories(items);
        const sports = items.find((item) => item.slug === "deportes");
        if (sports) {
          setCategoryId((current) => current || sports.id);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudieron cargar las categorías");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isNew || !id) {
      return;
    }
    let cancelled = false;
    api
      .getArticle(id)
      .then((article) => {
        if (cancelled) {
          return;
        }
        setTitle(article.title);
        setExcerpt(article.excerpt ?? "");
        setContent(article.content || "<p></p>");
        setCategoryId(article.categoryId);
        setStatus(article.status);
        setCover(article.coverImageUrl);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudo abrir la nota");
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
  }, [id, isNew]);

  if (!user || !canPublish(user)) {
    return (
      <section className="session-card">
        <h1>Editor</h1>
        <p className="lede">Publicar está habilitado solo para periodistas verificados.</p>
        <Link to="/app/redaccion">Volver a redacción</Link>
      </section>
    );
  }

  async function persist(nextContent = content) {
    const payload = {
      title: title.trim(),
      content: nextContent,
      excerpt: excerpt.trim(),
      categoryId,
    };
    if (isNew || !id) {
      const created = await api.createArticle(payload);
      navigate(`/app/redaccion/${created.id}`, { replace: true });
      return created;
    }
    return api.updateArticle(id, payload);
  }

  async function onSave() {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const saved = await persist();
      setStatus(saved.status);
      setNotice("Borrador guardado");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  async function onPublish() {
    setSaving(true);
    setError(null);
    try {
      const saved = await persist();
      const published = await api.publishArticle(saved.id);
      setStatus(published.status);
      setNotice("Nota publicada");
      setConfirmPublish(false);
      navigate(`/nota/${published.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo publicar");
      setConfirmPublish(false);
    } finally {
      setSaving(false);
    }
  }

  async function onCover(file: File) {
    if (isNew || !id) {
      setError("Guardá el borrador antes de subir la tapa");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await api.uploadCover(id, file);
      setCover(updated.coverImageUrl);
      setNotice("Tapa actualizada");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la tapa");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="lede">Cargando editor…</p>;
  }

  const coverSrc = mediaUrl(cover);

  return (
    <>
      <section className="session-card">
        <Link className="text-btn" to="/app/redaccion">
          ← Redacción
        </Link>
        <p className="eyebrow">{status === "PUBLISHED" ? "Publicada" : status === "ARCHIVED" ? "Archivada" : "Borrador"}</p>
        <h1>{isNew ? "Nueva nota" : "Editar nota"}</h1>
        {error ? <p className="alert">{error}</p> : null}
        {notice ? <p className="alert ok">{notice}</p> : null}
        <Field id="title" label="Título" value={title} onChange={setTitle} />
        <Field id="excerpt" label="Copete" value={excerpt} onChange={setExcerpt} required={false} />
        <label className="field" htmlFor="category">
          <span className="field-label">Categoría</span>
          <select id="category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <p className="field-label">Texto</p>
        <RichTextEditor key={isNew ? "nueva" : id} id="content" initialValue={content} onChange={setContent} />
        <label className="field" htmlFor="cover">
          <span className="field-label">Imagen de tapa</span>
          <input
            id="cover"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) {
                void onCover(file);
              }
            }}
          />
        </label>
        {coverSrc ? <img key={coverSrc} className="article-cover" src={coverSrc} alt="" /> : null}
        <div className="form-actions">
          <button type="button" className="btn-ghost" disabled={saving} onClick={() => void onSave()}>
            {saving ? "Guardando…" : "Guardar borrador"}
          </button>
          <button type="button" className="btn-primary btn-inline" disabled={saving} onClick={() => setConfirmPublish(true)}>
            Publicar
          </button>
        </div>
      </section>
      <ConfirmDialog
        open={confirmPublish}
        busy={saving}
        title="Publicar nota"
        description="Va a quedar visible en la portada y se avisa a quienes estén suscriptos."
        confirmLabel="Publicar"
        onCancel={() => setConfirmPublish(false)}
        onConfirm={() => void onPublish()}
      />
    </>
  );
}
