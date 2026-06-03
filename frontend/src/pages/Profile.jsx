import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProfile, followUser, unfollowUser, getArticles } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ArticleCard from '../components/ArticleCard';

export default function Profile() {
  const { username } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [articles, setArticles] = useState([]);
  const [tab, setTab] = useState('my'); // 'my' | 'favorited'
  const [following, setFollowing] = useState(false);

  const fetchProfile = () => {
    getProfile(username).then(res => {
      setProfile(res.data.profile);
      setFollowing(res.data.profile.following);
    }).catch(console.error);
  };

  const fetchArticles = () => {
    const params = tab === 'my' ? { author: username } : { favorited: username };
    getArticles(params).then(res => {
      setArticles(res.data.articles);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchProfile();
    fetchArticles();
  }, [username, tab]);

  const handleFollow = async () => {
    try {
      if (following) {
        const res = await unfollowUser(username);
        setFollowing(res.data.profile.following);
      } else {
        const res = await followUser(username);
        setFollowing(res.data.profile.following);
      }
    } catch (err) {
      console.error('关注操作失败', err);
    }
  };

  if (!profile) return <div className="loading">加载中...</div>;

  const isSelf = user && user.username === username;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <img
          src={profile.image || 'https://api.dicebear.com/7.x/initials/svg?seed=' + profile.username}
          alt={profile.username}
          className="avatar-large"
        />
        <h2>{profile.username}</h2>
        <p className="bio">{profile.bio || '这个人很懒，什么都没写...'}</p>
        <div className="profile-actions">
          {isSelf ? (
            <Link to="/settings" className="btn-secondary">编辑资料</Link>
          ) : (
            <button
              className={`btn-primary ${following ? 'following' : ''}`}
              onClick={handleFollow}
            >
              {following ? '✓ 已关注' : '+ 关注'}
            </button>
          )}
        </div>
      </div>

      <div className="profile-tabs">
        <button className={`tab-btn ${tab === 'my' ? 'active' : ''}`} onClick={() => setTab('my')}>
          我的文章
        </button>
        <button className={`tab-btn ${tab === 'favorited' ? 'active' : ''}`} onClick={() => setTab('favorited')}>
          收藏的文章
        </button>
      </div>

      <div className="profile-articles">
        {articles.length === 0 ? (
          <p className="empty">暂无文章</p>
        ) : (
          articles.map(article => (
            <ArticleCard key={article.slug} article={article} />
          ))
        )}
      </div>
    </div>
  );
}
