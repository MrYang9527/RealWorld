import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ArticleDetail from './pages/ArticleDetail';
import ArticleEditor from './pages/ArticleEditor';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="article/:slug" element={<ArticleDetail />} />
            <Route path="editor" element={
              <PrivateRoute><ArticleEditor /></PrivateRoute>
            } />
            <Route path="editor/:slug" element={
              <PrivateRoute><ArticleEditor /></PrivateRoute>
            } />
            <Route path="profile/:username" element={<Profile />} />
            <Route path="settings" element={
              <PrivateRoute><Settings /></PrivateRoute>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
