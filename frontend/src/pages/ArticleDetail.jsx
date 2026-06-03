import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getArticle, deleteArticle, favoriteArticle, unfavoriteArticle } from '../api/client';
import { useAuth } from '../context/AuthContext';
import CommentList from '../components/CommentList';

export default function ArticleDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchArticle = () => {
    setLoading(true);
    getArticle(slug)
      .then(res => setArticle(res.data.article))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  const handleFavorite = async () => {
    try {
      if (article.favorited) {
        const res = await unfavoriteArticle(slug);
        setArticle(res.data.article);
      } else {
        const res = await favoriteArticle(slug);
        setArticle(res.data.article);
      }
    } catch (err) {
      console.error('收藏操作失败', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('确定删除这篇文章吗？')) return;
    try {
      await deleteArticle(slug);
      navigate('/');
    } catch (err) {
      console.error('删除失败', err);
    }
  };

  const isAuthor = user && article && user.username === article.author.username;

  if (loading) return <div className="loading">加载中...</div>;
  if (!article) return null;

  return (
    <div className="article-detail">
      <div className="article-header">
        <h1>{article.title}</h1>
        <div className="article-meta-bar">
          <Link to={`/profile/${article.author.username}`} className="author-info">
            <img
              src={article.author.image || 'https://api.dicebear.com/7.x/initials/svg?seed=' + article.author.username}
              alt={article.author.username}
              className="avatar"
            />
            <div>
              <span className="author-name">{article.author.username}</span>
              <span className="date">{new Date(article.createdAt).toLocaleDateString('zh-CN')}</span>
            </div>
          </Link>
          <div className="article-actions">
            {isAuthor ? (
              <>
                <Link to={`/editor/${article.slug}`} className="btn-secondary">编辑</Link>
                <button onClick={handleDelete} className="btn-danger">删除</button>
              </>
            ) : (
              <button
                className={`btn-favorite ${article.favorited ? 'active' : ''}`}
                onClick={handleFavorite}
              >
                {article.favorited ? '❤ 已收藏' : '🤍 收藏'} ({article.favoritesCount})
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="article-body" dangerouslySetInnerHTML={{ __html: article.body }} />

      {article.tagList.length > 0 && (
        <div className="article-tags">
          {article.tagList.map(tag => (
            <Link key={tag} to={`/?tag=${tag}`} className="tag">{tag}</Link>
          ))}
        </div>
      )}

      <hr />
      <CommentList slug={slug} />
    </div>
  );
}
