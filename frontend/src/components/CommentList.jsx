import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getComments, addComment, deleteComment } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function CommentList({ slug }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = () => {
    getComments(slug)
      .then(res => setComments(res.data.comments))
      .catch(console.error);
  };

  useEffect(() => {
    fetchComments();
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      await addComment(slug, body);
      setBody('');
      fetchComments();
    } catch (err) {
      console.error('评论失败', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(slug, commentId);
      fetchComments();
    } catch (err) {
      console.error('删除评论失败', err);
    }
  };

  return (
    <div className="comments-section">
      <h4>评论 ({comments.length})</h4>
      {user ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="写下你的评论..."
            rows={3}
          />
          <button type="submit" disabled={submitting || !body.trim()}>
            {submitting ? '提交中...' : '发表评论'}
          </button>
        </form>
      ) : (
        <p className="comment-hint">
          <Link to="/login">登录</Link>后可以评论
        </p>
      )}
      <div className="comment-list">
        {comments.map(comment => (
          <div key={comment.id} className="comment-card">
            <div className="comment-meta">
              <Link to={`/profile/${comment.author.username}`} className="author-info">
                <img
                  src={comment.author.image || 'https://api.dicebear.com/7.x/initials/svg?seed=' + comment.author.username}
                  alt={comment.author.username}
                  className="avatar-small"
                />
                <span>{comment.author.username}</span>
              </Link>
              <span className="date">{new Date(comment.createdAt).toLocaleDateString('zh-CN')}</span>
              {user && user.username === comment.author.username && (
                <button onClick={() => handleDelete(comment.id)} className="btn-delete">删除</button>
              )}
            </div>
            <p className="comment-body">{comment.body}</p>
          </div>
        ))}
        {comments.length === 0 && <p className="empty">暂无评论</p>}
      </div>
    </div>
  );
}
