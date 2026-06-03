import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="container">
          <Link to="/" className="logo">RealWorld</Link>
          <ul className="nav-links">
            <li><Link to="/">首页</Link></li>
            {user ? (
              <>
                <li><Link to="/editor"><i className="icon-edit"></i> 写文章</Link></li>
                <li><Link to={`/profile/${user.username}`}>{user.username}</Link></li>
                <li><button onClick={handleLogout} className="btn-link">退出</button></li>
              </>
            ) : (
              <>
                <li><Link to="/login">登录</Link></li>
                <li><Link to="/register">注册</Link></li>
              </>
            )}
          </ul>
        </div>
      </nav>
      <main className="container">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container">
          <p>RealWorld 项目 — 计算机科学与技术专业 课程作业</p>
        </div>
      </footer>
    </div>
  );
}
