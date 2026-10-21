import { Link } from "react-router-dom";
import { mediaUrl } from "../api/client";
import { formatViews, journalistPath, type ArticleSummary } from "../api/types";

export function ArticleCard({ article }: { article: ArticleSummary }) {
  const cover = mediaUrl(article.coverImageUrl);
  return (
    <article className="news-card">
      {cover ? <img src={cover} alt="" /> : <div className="news-card-fallback" aria-hidden />}
      <div className="news-card-body">
        <p className="eyebrow">{article.categoryName}</p>
        <h2>
          <Link to={`/nota/${article.slug}`}>{article.title}</Link>
        </h2>
        {article.excerpt ? <p>{article.excerpt}</p> : null}
        <p className="news-card-meta">
          <Link to={journalistPath({ id: article.authorId, username: article.authorUsername })}>
            {article.authorName}
          </Link>
          <span>{formatViews(article.viewCount)}</span>
          {article.publishedAt ? <span>{formatDate(article.publishedAt)}</span> : null}
        </p>
      </div>
    </article>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
}
