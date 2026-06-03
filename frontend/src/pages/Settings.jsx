import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateUser } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user, updateUserContext } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setBio(user.bio || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    try {
      const updates = { username, email, bio };
      if (password) updates.password = password;

      const res = await updateUser(updates);
      updateUserContext(res.data.user);
      navigate(`/profile/${res.data.user.username}`);
    } catch (err) {
      const data = err.response?.data;
      setErrors(data?.errors?.body || ['更新失败']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="auth-form">
        <h2>编辑资料</h2>

        {errors.length > 0 && (
          <div className="errors">
            {errors.map((msg, i) => <p key={i}>{msg}</p>)}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>用户名</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>邮箱</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>个人简介</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="介绍一下自己..." />
          </div>
          <div className="form-group">
            <label>新密码（不修改则留空）</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="留空则不修改" />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '保存中...' : '保存修改'}
          </button>
        </form>
      </div>
    </div>
  );
}
