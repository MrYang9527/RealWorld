# 项目结构说明

> RealWorld 全栈博客系统 · 架构文档

---

## 一、整体架构

```
┌─────────────────────────────────────────────────────┐
│                    浏览器 (Browser)                    │
│              React SPA (localhost:5173)               │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP (Axios + JWT Token)
                      ▼
┌─────────────────────────────────────────────────────┐
│              Express API Server (localhost:3000)       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │  users   │ │ articles │ │ profiles │ │  tags   │ │
│  │  routes  │ │  routes  │ │  routes  │ │ routes  │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬────┘ │
│       └─────────────┴────────────┴────────────┘      │
│                        │                              │
│                   ┌────▼────┐                         │
│                   │ SQLite  │                         │
│                   │  (WAL)  │                         │
│                   └─────────┘                         │
└─────────────────────────────────────────────────────┘
```

### 前后端交互方式

- **协议：** HTTP/1.1
- **数据格式：** JSON
- **认证方式：** JWT Token（Header: `Authorization: Token <token>`）
- **跨域处理：** 后端 CORS 中间件放开所有来源
- **API 风格：** RESTful

### 数据流

1. 用户在浏览器操作 → React 组件触发事件
2. 调用 Axios 封装的 API 函数 → 自动附加 JWT Token
3. HTTP 请求到达 Express 服务器 → 路由匹配
4. 中间件链处理（CORS → JSON解析 → 认证 → 验证 → 业务逻辑）
5. better-sqlite3 执行 SQL → 返回结果
6. Express 返回 JSON 响应 → React 更新状态 → 页面重新渲染

---

## 二、后端架构

### 2.1 目录结构

```
backend/
├── package.json
├── realworld.db              # SQLite 数据库文件（自动生成）
└── src/
    ├── index.js              # 入口文件：Express 应用配置、路由挂载
    ├── db.js                 # 数据库单例：连接管理、表初始化
    ├── middleware/
    │   └── auth.js           # 认证中间件：JWT验证（必需/可选两种模式）
    ├── routes/
    │   ├── users.js          # 用户路由：注册/登录/获取/更新当前用户
    │   ├── articles.js       # 文章路由：CRUD + 收藏 + 评论
    │   ├── profiles.js       # 用户资料路由：查看/关注/取消关注
    │   └── tags.js           # 标签路由：获取所有标签
    └── utils/
        └── slug.js           # 工具函数：文章标题 → URL slug
```

### 2.2 模块划分

| 模块 | 职责 | 依赖 |
|-----|------|-----|
| `index.js` | 应用启动、中间件配置、路由注册 | 所有路由模块 |
| `db.js` | 数据库连接池、表结构初始化 | better-sqlite3 |
| `middleware/auth.js` | JWT Token 解析与验证 | jsonwebtoken |
| `routes/users.js` | 用户认证与资料管理 | db, auth, bcryptjs, express-validator |
| `routes/articles.js` | 文章增删改查、收藏、评论 | db, auth, slug, express-validator |
| `routes/profiles.js` | 用户资料查看、关注管理 | db, auth |
| `routes/tags.js` | 标签列表查询 | db |
| `utils/slug.js` | URL友好标识生成 | 无 |

### 2.3 数据库表设计

共 6 张业务表 + 1 张关联表：

| 表名 | 说明 | 主要字段 |
|-----|------|---------|
| `users` | 用户 | id, username, email, password(hash), bio, image |
| `articles` | 文章 | id, slug(unique), title, description, body, author_id(FK) |
| `tags` | 标签 | id, name(unique) |
| `article_tags` | 文章-标签关联 | article_id(FK), tag_id(FK) — 联合主键 |
| `comments` | 评论 | id, body, article_id(FK), author_id(FK) |
| `favorites` | 收藏 | user_id(FK), article_id(FK) — 联合主键 |
| `follows` | 关注 | follower_id(FK), followee_id(FK) — 联合主键 |

### 2.4 API 接口清单

#### 认证相关
| 方法 | 路径 | 认证 | 说明 |
|-----|------|-----|------|
| POST | `/api/users` | 无 | 用户注册 |
| POST | `/api/users/login` | 无 | 用户登录 |
| GET | `/api/user` | 必需 | 获取当前用户 |
| PUT | `/api/user` | 必需 | 更新当前用户 |

#### 文章相关
| 方法 | 路径 | 认证 | 说明 |
|-----|------|-----|------|
| GET | `/api/articles` | 可选 | 文章列表（支持 tag/author/favorited/limit/offset） |
| GET | `/api/articles/feed` | 必需 | 关注用户的文章 |
| GET | `/api/articles/:slug` | 可选 | 文章详情 |
| POST | `/api/articles` | 必需 | 创建文章 |
| PUT | `/api/articles/:slug` | 必需 | 更新文章（仅作者） |
| DELETE | `/api/articles/:slug` | 必需 | 删除文章（仅作者） |

#### 收藏相关
| 方法 | 路径 | 认证 | 说明 |
|-----|------|-----|------|
| POST | `/api/articles/:slug/favorite` | 必需 | 收藏文章 |
| DELETE | `/api/articles/:slug/favorite` | 必需 | 取消收藏 |

#### 评论相关
| 方法 | 路径 | 认证 | 说明 |
|-----|------|-----|------|
| GET | `/api/articles/:slug/comments` | 可选 | 获取评论列表 |
| POST | `/api/articles/:slug/comments` | 必需 | 发表评论 |
| DELETE | `/api/articles/:slug/comments/:id` | 必需 | 删除评论（仅作者） |

#### 用户资料相关
| 方法 | 路径 | 认证 | 说明 |
|-----|------|-----|------|
| GET | `/api/profiles/:username` | 可选 | 获取用户资料 |
| POST | `/api/profiles/:username/follow` | 必需 | 关注用户 |
| DELETE | `/api/profiles/:username/follow` | 必需 | 取消关注 |

#### 标签相关
| 方法 | 路径 | 认证 | 说明 |
|-----|------|-----|------|
| GET | `/api/tags` | 无 | 获取所有标签 |

---

## 三、前端架构

### 3.1 目录结构

```
frontend/
├── package.json
├── index.html
├── vite.config.js
└── src/
    ├── main.jsx              # React 入口
    ├── App.jsx               # 路由配置
    ├── index.css             # 全局样式
    ├── api/
    │   └── client.js         # Axios 封装 + 所有API调用函数
    ├── context/
    │   └── AuthContext.jsx   # 认证上下文（user状态、login/logout）
    ├── components/
    │   ├── Layout.jsx         # 全局布局（导航栏+页脚）
    │   ├── ArticleCard.jsx   # 文章卡片
    │   ├── Tags.jsx           # 标签侧边栏
    │   ├── CommentList.jsx    # 评论区
    │   ├── Pagination.jsx     # 分页组件
    │   └── PrivateRoute.jsx   # 路由守卫
    └── pages/
        ├── Home.jsx           # 首页（文章列表+标签）
        ├── Login.jsx          # 登录页
        ├── Register.jsx       # 注册页
        ├── ArticleDetail.jsx  # 文章详情页
        ├── ArticleEditor.jsx  # 文章编辑/发布
        ├── Profile.jsx        # 用户主页
        └── Settings.jsx       # 个人设置
```

### 3.2 组件树

```
<BrowserRouter>
  <AuthProvider>
    <Layout>                          ← 导航栏 + <Outlet/> + 页脚
      ├── <Home>                      ← 首页
      │   ├── <ArticleCard />×N       ← 文章卡片列表
      │   ├── <Tags />                ← 标签侧边栏
      │   └── <Pagination />          ← 分页
      ├── <Login />                   ← 登录表单
      ├── <Register />                ← 注册表单
      ├── <ArticleDetail>             ← 文章详情
      │   └── <CommentList />         ← 评论区
      ├── <ArticleEditor />           ← 文章编辑（PrivateRoute包裹）
      ├── <Profile />                 ← 用户主页
      │   └── <ArticleCard />×N
      └── <Settings />                ← 设置页（PrivateRoute包裹）
  </AuthProvider>
</BrowserRouter>
```

### 3.3 状态管理

采用 React Context API 管理认证状态：

- **AuthContext：** 提供 `user`、`loading`、`login()`、`logout()`、`updateUserContext()`
- **Token 持久化：** localStorage 存储，Axios 拦截器自动注入
- **页面级状态：** 各页面使用 useState/useEffect 管理自身数据

---

## 四、技术选型及原因

### 4.1 后端

| 技术 | 版本 | 选型原因 |
|-----|------|---------|
| Node.js | 24.x | 前后端统一语言，降低学习成本 |
| Express | 5.x | Node.js 最主流的 Web 框架，生态成熟，教学资源丰富 |
| better-sqlite3 | 12.x | 零配置嵌入式数据库，无需安装 MySQL/PostgreSQL，方便老师直接运行 |
| jsonwebtoken | 9.x | JWT 认证标准方案，无状态、可扩展 |
| bcryptjs | 3.x | 纯 JS 实现的密码哈希，无需编译 node-gyp |
| express-validator | 7.x | 声明式输入验证，链式调用 API 简洁 |

**为什么不选其他方案？**
- **MySQL/PostgreSQL：** 需要额外安装数据库服务，增加同学和老师的运行成本
- **Prisma/TypeORM：** 对于作业规模过度设计，原生 SQL 更直观
- **Koa/Fastify：** 相对小众，不利于同学间交流

### 4.2 前端

| 技术 | 版本 | 选型原因 |
|-----|------|---------|
| React | 19.x | 业界最主流的前端框架，课程也在学 |
| Vite | 8.x | 极快的开发服务器和构建速度 |
| React Router | 7.x | React 官方推荐的路由方案 |
| Axios | 1.x | 比 fetch 更好的 API（拦截器、超时、自动转换） |

**为什么不选其他方案？**
- **Vue：** 也是好选择，但本次想练习 React
- **Next.js：** SSR/SSG 对博客有益，但对作业来说复杂度太高
- **Tailwind CSS：** 想手写 CSS 加深理解，而不是依赖工具类
- **Redux/Zustand：** 项目状态不复杂，Context API 足够

### 4.3 开发工具

| 工具 | 用途 |
|-----|------|
| Claude Code | AI 辅助编程（代码生成、调试、文档） |
| Git | 版本控制 |
| npm | 包管理 |
| VS Code | 代码编辑器 |

---

## 五、安全措施

1. **密码哈希：** bcryptjs + salt rounds=10，不存储明文密码
2. **JWT 过期：** 7天过期，减少 Token 泄露风险
3. **输入验证：** express-validator 对所有用户输入做校验
4. **权限控制：** 
   - 文章/评论只能由作者编辑和删除
   - 收藏/关注需要登录
5. **SQL 注入防护：** better-sqlite3 使用参数化查询（`?` 占位符）
6. **CORS：** 开发阶段放开，生产环境需限制来源

---

## 六、项目可扩展点

如果继续完善，可以增加：
- [ ] 文章正文支持 Markdown 渲染
- [ ] 图片上传功能
- [ ] 用户头像上传
- [ ] 文章搜索（全文检索）
- [ ] 通知系统（被关注、被评论）
- [ ] 单元测试 + E2E 测试
- [ ] Docker 容器化部署
- [ ] CI/CD 自动部署
