import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// 请求拦截：自动附加 token
client.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// ---- 认证 ----
export const loginUser = (email, password) =>
  client.post('/users/login', { user: { email, password } });

export const registerUser = (username, email, password) =>
  client.post('/users', { user: { username, email, password } });

export const getCurrentUser = () => client.get('/user');

export const updateUser = (userData) => client.put('/user', { user: userData });

// ---- 文章 ----
export const getArticles = (params = {}) =>
  client.get('/articles', { params });

export const getFeed = (params = {}) =>
  client.get('/articles/feed', { params });

export const getArticle = (slug) =>
  client.get(`/articles/${slug}`);

export const createArticle = (article) =>
  client.post('/articles', { article });

export const updateArticle = (slug, article) =>
  client.put(`/articles/${slug}`, { article });

export const deleteArticle = (slug) =>
  client.delete(`/articles/${slug}`);

export const favoriteArticle = (slug) =>
  client.post(`/articles/${slug}/favorite`);

export const unfavoriteArticle = (slug) =>
  client.delete(`/articles/${slug}/favorite`);

// ---- 评论 ----
export const getComments = (slug) =>
  client.get(`/articles/${slug}/comments`);

export const addComment = (slug, body) =>
  client.post(`/articles/${slug}/comments`, { comment: { body } });

export const deleteComment = (slug, commentId) =>
  client.delete(`/articles/${slug}/comments/${commentId}`);

// ---- 标签 ----
export const getTags = () => client.get('/tags');

// ---- 个人资料 ----
export const getProfile = (username) =>
  client.get(`/profiles/${username}`);

export const followUser = (username) =>
  client.post(`/profiles/${username}/follow`);

export const unfollowUser = (username) =>
  client.delete(`/profiles/${username}/follow`);

export default client;
