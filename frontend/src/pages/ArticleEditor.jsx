import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createArticle, updateArticle, getArticle } from '../api/client';

export default function ArticleEditor() {
  const { slug } = useParams();
  const isEdit = !!slug;
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [body, setBody] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tagList, setTagList] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      getArticle(slug).then(res => {
        const a = res.data.article;
        setTitle(a.title);
        setDescription(a.description);
        setBody(a.body);
        setTagList(a.tagList);
      }).catch(() => navigate('/'));
    }
  }, [slug]);

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tagList.includes(tagInput.trim())) {
        setTagList([...tagList, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setTagList(tagList.filter(t => t !== tag));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    try {
      const data = { title, description, body, tagList };
      if (isEdit) {
        await updateArticle(slug, data);
      } else {
        const res = await createArticle(data);
        const newSlug = res.data.article.slug;
        navigate(`/article/${newSlug}`);
        return;
      }
      navigate(`/article/${slug}`);
    } catch (err) {
      const data = err.response?.data;
      setErrors(data?.errors?.body || ['操作失败']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editor-page">
      <h2>{isEdit ? '编辑文章' : '写文章'}</h2>

      {errors.length > 0 && (
        <div className="errors">
          {errors.map((msg, i) => <p key={i}>{msg}</p>)}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>标题</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="文章标题"
            required
          />
        </div>
        <div className="form-group">
          <label>摘要</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="简短描述这篇文章..."
            required
          />
        </div>
        <div className="form-group">
          <label>正文</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="写点什么..."
            rows={15}
            required
          />
        </div>
        <div className="form-group">
          <label>标签（回车添加）</label>
          <div className="tag-input-wrapper">
            {tagList.map(tag => (
              <span key={tag} className="tag editable">
                {tag}
                <button type="button" onClick={() => handleRemoveTag(tag)}>×</button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="输入标签后按回车"
            />
          </div>
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? '保存中...' : '发布文章'}
        </button>
      </form>
    </div>
  );
}
