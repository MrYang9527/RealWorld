import { useState, useEffect } from 'react';
import { getArticles, getFeed } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ArticleCard from '../components/ArticleCard';
import Tags from '../components/Tags';
import Pagination from '../components/Pagination';

const LIMIT = 10;

export default function Home() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [selectedTag, setSelectedTag] = useState(null);
  const [tab, setTab] = useState('global'); // 'global' | 'feed'
  const [loading, setLoading] = useState(false);

  const fetchArticles = () => {
    setLoading(true);
    const params = { limit: LIMIT, offset };

    let request;
    if (tab === 'feed' && user) {
      request = getFeed(params);
    } else if (selectedTag) {
      request = getArticles({ ...params, tag: selectedTag });
    } else {
      request = getArticles(params);
    }

    request
      .then(res => {
        setArticles(res.data.articles);
        setCount(res.data.articlesCount);
      })
      .catch(err => console.error('获取文章失败', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchArticles();
  }, [offset, selectedTag, tab]);

  const handleTagSelect = (tag) => {
    setSelectedTag(tag);
    setOffset(0);
    if (tag) setTab('global');
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setOffset(0);
    if (newTab === 'feed') setSelectedTag(null);
  };

  const handlePageChange = (newOffset) => {
    setOffset(newOffset);
    window.scrollTo(0, 0);
  };

  return (
    <div className="home-page">
      <div className="main-content">
        <div className="feed-tabs">
          {user && (
            <button
              className={`tab-btn ${tab === 'feed' ? 'active' : ''}`}
              onClick={() => handleTabChange('feed')}
            >
              我的关注
            </button>
          )}
          <button
            className={`tab-btn ${tab === 'global' ? 'active' : ''}`}
            onClick={() => handleTabChange('global')}
          >
            全部文章
          </button>
          {selectedTag && (
            <span className="tag-filter"># {selectedTag}</span>
          )}
        </div>

        {loading ? (
          <div className="loading">加载文章中...</div>
        ) : articles.length === 0 ? (
          <div className="empty">暂无文章</div>
        ) : (
          <>
            {articles.map(article => (
              <ArticleCard key={article.slug} article={article} onUpdate={fetchArticles} />
            ))}
            <Pagination total={count} limit={LIMIT} offset={offset} onPageChange={handlePageChange} />
          </>
        )}
      </div>
      <aside className="sidebar">
        <Tags selectedTag={selectedTag} onSelectTag={handleTagSelect} />
      </aside>
    </div>
  );
}
