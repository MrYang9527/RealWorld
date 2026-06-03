import { Link } from 'react-router-dom';
import { useState } from 'react';
import { favoriteArticle, unfavoriteArticle } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ArticleCard({ article, onUpdate }) {
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(article.favorited);
  const [favoritesCount, setFavoritesCount] = useState(article.favoritesCount);
  const [loading, setLoading] = useState(false);

  const handleFavorite = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (favorited) {
        const res = await unfavoriteArticle(article.slug);
        setFavorited(false);
        setFavoritesCount(res.data.article.favoritesCount);
      } else {
        const res = await favoriteArticle(article.slug);
        setFavorited(true);
        setFavoritesCount(res.data.article.favoritesCount);
      }
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('收藏操作失败', err);
    } finally {
      setLoading(false);
    }
  };

  const date = new Date(article.createdAt).toLocaleDateString('zh-CN');

  return (
    <div className="article-card">
      <div className="article-meta">
        <Link to={`/profile/${article.author.username}`} className="author-info">
          <img src={article.author.image || 'https://api.dicebear.com/7.x/initials/svg?seed=' + article.author.username} alt={article.author.username} className="avatar" />
          <span className="author-name">{article.author.username}</span>
        </Link>
        <span className="date">{date}</span>
        <button
          className={`btn-favorite ${favorited ? 'active' : ''}`}
          onClick={handleFavorite}
          disabled={loading}
        >
          ❤ {favoritesCount}
        </button>
      </div>
      <Link to={`/article/${article.slug}`} className="article-preview">
        <h3 className="article-title">{article.title}</h3>
        <p className="article-description">{article.description}</p>
        <div className="article-footer">
          <span>阅读更多...</span>
          {article.tagList.length > 0 && (
            <div className="tag-list">
              {article.tagList.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
