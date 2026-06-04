# RealWorld 全栈博客系统

> 计算机科学与技术专业 · 课程项目  
> 基于 RealWorld 规范的前后端分离 Web 应用  
> 使用 AI 工具（Claude Code）辅助开发

---

## 项目简介

RealWorld 是一个类 Medium 的博客平台，支持用户注册登录、文章发布管理、评论互动、收藏点赞、用户关注等核心功能。

**在线 Demo：** 前后端均需本地启动

---

## 运行步骤

### 环境要求

- **Node.js** >= 18.x（开发使用 v24.13.0）
- **npm** >= 9.x（开发使用 v11.6.2）
- **Git**（版本控制）

### 1. 克隆项目

```bash
git clone <项目地址>
cd realworld-project
```

### 2. 启动后端

```bash
cd backend
npm install
npm start
```

后端运行在 **http://localhost:3000**

API 基础路径：`http://localhost:3000/api`

### 3. 启动前端

新开一个终端窗口：

```bash
cd frontend
npm install
npm run dev
```

前端运行在 **http://localhost:5173**

### 4. 测试

- 打开浏览器访问 http://localhost:5173
- 注册新账号
- 发布文章、添加评论、收藏文章
- 查看个人主页

---

## 技术选型说明

### 后端

| 技术 | 版本 | 用途 |
|-----|------|------|
| Node.js | 24.x | JavaScript 运行时 |
| Express | 5.x | Web 框架 |
| better-sqlite3 | 12.x | 嵌入式数据库（零配置） |
| jsonwebtoken | 9.x | JWT 身份认证 |
| bcryptjs | 3.x | 密码哈希 |
| express-validator | 7.x | 请求参数验证 |

**选择理由：**
- SQLite 零配置，无需安装数据库服务，解压即用
- Express 生态最成熟，学习资料丰富
- 纯 JS 技术栈，前后端统一语言

### 前端

| 技术 | 版本 | 用途 |
|-----|------|------|
| React | 19.x | UI 框架 |
| Vite | 8.x | 构建工具 |
| React Router | 7.x | 客户端路由 |
| Axios | 1.x | HTTP 客户端 |

**选择理由：**
- Vite 开发体验极好（热更新秒级）
- React 是业界主流，课程也在学习
- Context API 管理状态，不引入额外依赖

---

## 项目结构说明

```
realworld-project/
├── backend/                    # 后端工程
│   ├── src/
│   │   ├── index.js            # Express 入口
│   │   ├── db.js               # 数据库初始化
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT 认证中间件
│   │   ├── routes/
│   │   │   ├── users.js        # 用户API（注册/登录/资料）
│   │   │   ├── articles.js     # 文章API（CRUD/收藏/评论）
│   │   │   ├── profiles.js     # 用户资料API（查看/关注）
│   │   │   └── tags.js         # 标签API
│   │   └── utils/
│   │       └── slug.js         # URL Slug 生成工具
│   └── package.json
├── frontend/                   # 前端工程
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js       # Axios + API 函数
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # 认证状态管理
│   │   ├── components/         # 通用组件
│   │   │   ├── Layout.jsx      # 全局布局
│   │   │   ├── ArticleCard.jsx  # 文章卡片
│   │   │   ├── Tags.jsx        # 标签侧边栏
│   │   │   ├── CommentList.jsx  # 评论列表
│   │   │   ├── Pagination.jsx   # 分页
│   │   │   └── PrivateRoute.jsx # 路由守卫
│   │   └── pages/              # 页面组件
│   │       ├── Home.jsx        # 首页
│   │       ├── Login.jsx       # 登录
│   │       ├── Register.jsx    # 注册
│   │       ├── ArticleDetail.jsx # 文章详情
│   │       ├── ArticleEditor.jsx # 文章编辑
│   │       ├── Profile.jsx     # 用户主页
│   │       └── Settings.jsx    # 个人设置
│   └── package.json
├── docs/                       # 文档
│   ├── ai-usage.md             # AI 使用记录
│   └── architecture.md         # 项目架构说明
├── README.md                   # 本文件
└── .gitignore
```

---

## 核心功能

- [x] 用户注册 / 登录（JWT 认证）
- [x] 文章发布 / 编辑 / 删除
- [x] 文章列表（支持按标签/作者/收藏筛选 + 分页）
- [x] 文章详情页
- [x] 评论发表 / 删除
- [x] 文章收藏 / 取消收藏
- [x] 用户关注 / 取消关注
- [x] 个人主页（我的文章 / 收藏文章）
- [x] 用户资料编辑
- [x] 热门标签展示

---

## AI 使用总结

### 成功经验

1. **框架搭建效率极高** — AI 在几分钟内生成了完整的 Express + React 项目骨架，人工搭建可能需要半天
2. **API 设计规范** — AI 遵循 RESTful 规范生成了所有 API 端点，命名和返回格式都很标准
3. **表单验证** — express-validator 的验证链式调用 AI 处理得很完善，各种边界条件都考虑到了
4. **组件拆分合理** — AI 对 React 组件的拆分思路清晰（Layout/ArticleCard/Pagination等），符合最佳实践

### 失败案例

详见 [docs/ai-usage.md](./docs/ai-usage.md)，3个典型案例：

1. **Express 5.x 错误处理中间件失效** — AI 不了解版本间异步错误处理的差异
2. **React Router v7 API 变更** — AI 使用了已废弃的 `component` prop
3. **CSS 全局样式污染** — AI 的粗粒度样式影响了不相关的组件

### 心得

AI 是很好的"副驾驶"但**不能替代"主驾驶"的判断**。整个项目中：
- AI 生成代码约占 60-70%，但关键逻辑（权限校验、边界处理、错误恢复）都是手动补充的
- AI 在框架层面表现好，在细节和版本适配方面需要人工把控
- 每次 AI 输出我都逐行 review，不盲目信任

### AI 工具使用统计

| 功能 | AI 生成 | 手动修改 | 修改比例 |
|-----|--------|---------|---------|
| 后端 API | ~600行 | ~200行 | 25% |
| 前端组件 | ~600行 | ~350行 | 37% |
| CSS 样式 | ~200行 | ~350行 | 64% |
| 文档 | ~100行 | ~250行 | 71% |

**总手动干预比例：约 35%** — 说明 AI 辅助开发时仍有大量工作需要人工完成。

---

## 许可证

本项目仅用于课程学习目的。
