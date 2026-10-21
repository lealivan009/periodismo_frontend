import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, mediaUrl } from "../api/client";
import { formatViews, journalistPath, type Article } from "../api/types";

export function ArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      return;
    }
    let cancelled = false;
    api
      .getArticleBySlug(slug)
      .then((next) => {
        if (!cancelled) {
          setArticle(next);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se encontró la nota");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!article || article.status !== "PUBLISHED") {
      return;
    }
    let cancelled = false;
    api
      .recordView(article.slug, visitorId())
      .then((result) => {
        if (!cancelled) {
          setArticle((current) => (current ? { ...current, viewCount: result.viewCount } : current));
        }
      })
      .catch(() => {
        // La nota se lee igual si el contador no responde.
      });
    return () => {
      cancelled = true;
    };
  }, [article?.id, article?.slug, article?.status]);

  if (error) {
    return (
      <section className="session-card">
        <p className="alert">{error}</p>
        <Link to="/">Volver a la portada</Link>
      </section>
    );
  }

  if (!article) {
    return <p className="lede">Cargando nota…</p>;
  }

  const cover = mediaUrl(article.coverImageUrl);

  return (
    <article className="session-card article-layout">
      <p className="eyebrow">
        <Link to={`/categoria/${article.categorySlug}`}>{article.categoryName}</Link>
      </p>
      <h1>{article.title}</h1>
      <p className="news-card-meta">
        <Link to={journalistPath({ id: article.authorId, username: article.authorUsername })}>
          {article.authorName}
        </Link>
        <span>{formatViews(article.viewCount)}</span>
        {article.publishedAt ? <span>{new Date(article.publishedAt).toLocaleString("es-AR")}</span> : null}
      </p>
      {cover ? <img className="article-cover" src={cover} alt="" /> : null}
      {article.excerpt ? <p className="lede">{article.excerpt}</p> : null}
      <div className="article-body" dangerouslySetInnerHTML={{ __html: article.content }} />
    </article>
  );
}

function visitorId() {
  const key = "pv-visitor";
  const current = localStorage.getItem(key);
  if (current) {
    return current;
  }
  const next = crypto.randomUUID();
  localStorage.setItem(key, next);
  return next;
}
