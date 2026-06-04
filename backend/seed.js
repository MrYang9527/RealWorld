/**
 * 数据库种子脚本 —— 填充初始用户和文章数据
 * 用 Node.js 直接写入，确保 UTF-8 编码正确
 */
const bcrypt = require('bcryptjs');
const { getDb } = require('./src/db');
const { slugify } = require('./src/utils/slug');

const db = getDb();

console.log('🌱 开始播种数据...\n');

// ===== 用户数据 =====
const users = [
  { username: '张三', email: 'zhangsan@qq.com', password: '123456', bio: '前端开发爱好者，喜欢研究新技术', image: '' },
  { username: '李四', email: 'lisi@163.com', password: '123456', bio: '后端工程师，专注于Node.js和数据库', image: '' },
  { username: '王小明', email: 'wangxm@gmail.com', password: '123456', bio: '全栈开发者，热爱开源社区', image: '' },
  { username: '程序员小A', email: 'coderA@test.com', password: '123456', bio: '每天都在写bug和修bug的路上', image: '' },
  { username: '产品经理老张', email: 'pmzhang@test.com', password: '123456', bio: '不懂技术但热爱技术的产品经理', image: '' },
  { username: 'AliceChen', email: 'alice@example.com', password: '123456', bio: 'CS专业大三学生，正在学习全栈开发', image: '' },
  { username: 'BobWang', email: 'bob@example.com', password: '123456', bio: 'Software engineer, love open source', image: '' },
];

const userMap = {};
for (const u of users) {
  const hashed = bcrypt.hashSync(u.password, 10);
  const result = db.prepare('INSERT INTO users (username, email, password, bio, image) VALUES (?, ?, ?, ?, ?)')
    .run(u.username, u.email, hashed, u.bio, u.image);
  userMap[u.username] = result.lastInsertRowid;
  console.log(`  ✅ 用户: ${u.username} (${u.email})`);
}

console.log(`\n📝 创建文章...\n`);

// ===== 文章数据 =====
const articles = [
  {
    author: '张三',
    title: 'JavaScript异步编程完全指南',
    description: '从回调函数到Promise再到async/await，一篇文章搞懂JS异步编程的所有知识点',
    body: `## 前言\n\nJavaScript的异步编程是前端开发中最重要的话题之一。掌握异步编程，你才能真正理解JavaScript的执行机制。\n\n## 1. 回调函数时代\n\n最早的时候，JavaScript通过回调函数来处理异步操作。比如一个简单的setTimeout：\n\n\`\`\`javascript\nsetTimeout(() => {\n  console.log('2秒后执行');\n}, 2000);\n\`\`\`\n\n但回调函数有一个致命的问题——回调地狱（Callback Hell）。当多个异步操作需要按顺序执行时，代码会变得难以维护。\n\n## 2. Promise的诞生\n\nES6引入了Promise，它代表一个异步操作的最终结果。Promise有三种状态：pending、fulfilled、rejected。\n\n\`\`\`javascript\nfetch('/api/data')\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));\n\`\`\`\n\nPromise解决了回调地狱的问题，让异步代码可以通过链式调用变得扁平化。\n\n## 3. async/await时代\n\nES2017引入了async/await语法，让异步代码看起来像同步代码：\n\n\`\`\`javascript\nasync function loadData() {\n  try {\n    const res = await fetch('/api/data');\n    const data = await res.json();\n    console.log(data);\n  } catch (err) {\n    console.error(err);\n  }\n}\n\`\`\`\n\n## 总结\n\n从回调到Promise再到async/await，JavaScript异步编程的演进让代码越来越优雅。理解这些概念是成为优秀前端开发者的必经之路。`,
    tagList: ['JavaScript', '异步编程', 'Promise', 'async/await'],
  },
  {
    author: '李四',
    title: 'Node.js后端开发最佳实践（2026版）',
    description: '总结了在Node.js后端开发中应该遵循的最佳实践，包括项目结构、错误处理、日志和安全性',
    body: `## 项目结构\n\n一个好的项目结构能让你的代码更易于维护。推荐使用分层架构：\n\n\`\`\`\n├── src/\n│   ├── routes/       # 路由层\n│   ├── middleware/   # 中间件\n│   ├── models/       # 数据模型\n│   └── utils/        # 工具函数\n\`\`\`\n\n## 错误处理\n\n永远不要忽略错误处理。Express 5.x中，同步错误不会自动传递给错误处理中间件，需要在每个路由中使用try-catch。\n\n\`\`\`javascript\napp.get('/api/data', async (req, res, next) => {\n  try {\n    const data = await fetchData();\n    res.json(data);\n  } catch (err) {\n    next(err);\n  }\n});\n\`\`\`\n\n## 安全性\n\n1. 永远不要存储明文密码，使用bcrypt进行哈希\n2. 使用helmet中间件设置安全HTTP头\n3. 验证所有用户输入（express-validator）\n4. 使用参数化查询防止SQL注入\n\n## 日志\n\n好的日志能帮助快速定位问题。推荐使用winston或pino作为日志库，记录请求信息和错误栈。\n\n## 总结\n\n好的实践来自于踩过的坑。希望这些经验能帮你少走弯路。`,
    tagList: ['Node.js', '后端开发', '最佳实践'],
  },
  {
    author: '王小明',
    title: 'React 19新特性详解：Server Components与Actions',
    description: 'React 19带来了许多令人兴奋的新特性，本文详细介绍了Server Components和Server Actions的使用方法',
    body: `## React 19简介\n\nReact 19是一个重大更新，其中最引人注目的特性是Server Components和Actions。\n\n## Server Components\n\nServer Components在服务端渲染，不会发送JavaScript到客户端，可以显著减小bundle大小。\n\n\`\`\`jsx\n// 这是一个Server Component（默认）\nasync function ArticleList() {\n  const articles = await db.query('SELECT * FROM articles');\n  return (\n    <div>\n      {articles.map(a => <ArticleCard key={a.id} article={a} />)}\n    </div>\n  );\n}\n\`\`\`\n\n## Server Actions\n\nServer Actions允许你在React组件中直接调用服务端函数，无需手动创建API路由。\n\n\`\`\`jsx\nasync function createPost(formData) {\n  'use server';\n  const title = formData.get('title');\n  await db.insert('articles', { title });\n}\n\`\`\`\n\n## 使用建议\n\nServer Components适合数据获取和静态内容渲染，而Client Components适合需要交互的部分。合理划分两者的边界是使用React 19的关键。`,
    tagList: ['React', 'JavaScript', '前端'],
  },
  {
    author: '程序员小A',
    title: '我踩过的5个CSS布局大坑',
    description: '分享在实际开发中遇到的CSS布局问题和解决方案，帮你避免掉进同样的坑里',
    body: `## 坑1：margin塌陷\n\n当父元素和第一个子元素都有margin-top时，margin会"穿透"父元素。\n\n解决方案：给父元素加overflow: hidden或padding-top。\n\n## 坑2：Flexbox中min-width问题\n\nFlex子元素默认min-width为auto，可能导致内容溢出。设置min-width: 0可以解决。\n\n## 坑3：z-index不生效\n\nz-index只对定位元素（position不为static）生效。还要注意层叠上下文的影响。\n\n## 坑4：100vh不等于视口高度\n\n在移动端浏览器中，100vh包含了地址栏的高度。可以用dvh（dynamic viewport height）替代。\n\n## 坑5：grid gap的百分比陷阱\n\n在CSS Grid中，gap使用百分比值的行为可能不符合预期。建议使用固定值如px或rem。\n\n希望这些经验能帮到你！踩坑不可怕，踩多了就成长了。`,
    tagList: ['CSS', '前端', '布局'],
  },
  {
    author: '产品经理老张',
    title: '非技术背景如何与开发团队高效协作',
    description: '作为一个不懂代码的产品经理，我总结了几条与工程师愉快合作的经验',
    body: `## 1. 学会写清晰的需求文档\n\n好的需求文档应该包含：\n- 背景：为什么要做这个功能\n- 用户故事：作为XX用户，我想要XX功能，以便XX\n- 验收标准：什么算"完成"\n\n## 2. 理解技术成本\n\n即使不懂代码，也要知道什么功能改动大、什么改动小。多和工程师沟通，了解系统架构。\n\n## 3. 优先级管理\n\n用MoSCoW方法：Must have、Should have、Could have、Won't have。\n\n## 4. 接受"技术债"\n\n有时候快速上线比代码优美更重要。理解"技术债"的概念，和团队一起制定偿还计划。\n\n## 5. 测试很重要\n\n在把需求交给开发之前，先自己走一遍流程。发现问题比开发完成后改要便宜得多。`,
    tagList: ['团队协作', '产品管理', '软技能'],
  },
  {
    author: 'AliceChen',
    title: '我的全栈学习路线图（2026年）',
    description: '作为一名计算机专业学生，分享我在学习全栈开发过程中的路线图和资源推荐',
    body: `## 第一阶段：打好基础（1-3个月）\n\n- HTML/CSS基础：学会布局、定位、响应式\n- JavaScript基础：变量、函数、DOM操作、事件\n- Git基础：commit、branch、merge、pull request\n\n## 第二阶段：前端深入（2-3个月）\n\n- React或Vue选一个深入学习\n- 状态管理（Context API / Redux / Pinia）\n- 路由和组件设计模式\n\n## 第三阶段：后端入门（2-3个月）\n\n- Node.js + Express基础\n- 数据库：SQL基础 + SQLite或PostgreSQL\n- RESTful API设计\n- JWT认证\n\n## 第四阶段：项目实战（持续）\n\n- 做一个完整的全栈项目（就像RealWorld）\n- 部署上线\n- 持续迭代\n\n## 推荐资源\n\n- MDN Web Docs：最好的前端参考\n- freeCodeCamp：免费的编程学习平台\n- GitHub：多看优秀项目的源码\n\n最重要的建议：多写代码，少看视频！`,
    tagList: ['学习路线', '全栈', '入门教程'],
  },
  {
    author: '张三',
    title: '前端性能优化的10个实用技巧',
    description: '从代码分割到图片优化，10个经过验证的前端性能优化方案，让你的应用加载速度提升50%',
    body: `## 1. 代码分割（Code Splitting）\n\n使用动态import按需加载：\n\n\`\`\`javascript\nconst HeavyComponent = lazy(() => import('./HeavyComponent'));\n\`\`\`\n\n## 2. 图片懒加载\n\n使用loading="lazy"属性或IntersectionObserver。\n\n## 3. 合理使用缓存\n\n设置合适的Cache-Control头，使用Service Worker做离线缓存。\n\n## 4. 减小打包体积\n\n使用tree-shaking，移除未使用的代码。\n\n## 5. 使用CDN\n\n静态资源放在CDN上，加快全球访问速度。\n\n## 6-10. 更多技巧\n\n- 虚拟列表处理长列表\n- 防抖节流优化频繁操作\n- 预加载关键资源\n- 压缩图片和字体\n- 使用Web Worker处理计算密集型任务`,
    tagList: ['前端', '性能优化', 'JavaScript'],
  },
  {
    author: '李四',
    title: 'SQLite在小型项目中的最佳实践',
    description: '为什么SQLite是个人项目和小型应用的最佳选择？本文从实践角度分析SQLite的优势和使用技巧',
    body: `## 为什么选择SQLite？\n\n1. 零配置：不需要安装数据库服务\n2. 轻量级：整个数据库就是一个文件\n3. 可靠：支持ACID事务\n4. 便携：备份就是复制文件\n\n## 开启WAL模式\n\n\`\`\`sql\nPRAGMA journal_mode = WAL;\n\`\`\`\n\nWAL模式让读写可以并发进行，大幅提升性能。\n\n## 开启外键约束\n\n\`\`\`sql\nPRAGMA foreign_keys = ON;\n\`\`\`\n\nSQLite默认不检查外键约束，需要手动开启。\n\n## 适合的场景\n\n- 个人博客\n- 小型Web应用\n- 桌面应用\n- 移动App的本地存储\n- 原型开发\n\n## 不适合的场景\n\n- 高并发写入\n- 需要网络访问的数据库\n- 超大数据量（TB级）`,
    tagList: ['SQLite', '数据库', '后端开发'],
  },
];

const articleIds = [];
for (const a of articles) {
  const slug = slugify(a.title);
  const result = db.prepare(
    'INSERT INTO articles (slug, title, description, body, author_id) VALUES (?, ?, ?, ?, ?)'
  ).run(slug, a.title, a.description, a.body, userMap[a.author]);
  articleIds.push(result.lastInsertRowid);

  // 标签
  for (const tagName of a.tagList) {
    let tag = db.prepare('SELECT id FROM tags WHERE name = ?').get(tagName);
    if (!tag) {
      const r = db.prepare('INSERT INTO tags (name) VALUES (?)').run(tagName);
      tag = { id: r.lastInsertRowid };
    }
    db.prepare('INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)').run(result.lastInsertRowid, tag.id);
  }

  console.log(`  📄 [${a.author}] ${a.title}`);
}

// ===== 评论数据 =====
console.log(`\n💬 创建评论...\n`);

const comments = [
  { article: 0, author: '李四', body: '写得非常好！Promise和async/await的对比特别清晰，终于理解了两者的关系。' },
  { article: 0, author: '王小明', body: '建议补充一下Event Loop的内容，对理解异步执行机制很有帮助。' },
  { article: 0, author: 'AliceChen', body: '作为初学者，这篇文章帮我理清了异步编程的思路，感谢！' },
  { article: 1, author: '程序员小A', body: '项目结构那部分写得太实用了，我之前的项目就是没有分层导致后面很难维护。' },
  { article: 1, author: '张三', body: '补充一点：除了helmet，还可以用rate-limit做接口限流，防止恶意请求。' },
  { article: 2, author: '程序员小A', body: 'React 19的Server Components确实是个大变革，正在学习中。' },
  { article: 2, author: '李四', body: 'Server Actions看起来像是前端和后端的边界在消失，很有意思的趋势。' },
  { article: 3, author: '王小明', body: '哈哈哈，margin塌陷这个问题我遇到过，当时debug了好久才找到原因。' },
  { article: 3, author: '产品经理老张', body: '完全看不懂但感觉好厉害的样子😂' },
  { article: 4, author: 'AliceChen', body: '作为CS学生，第三点"接受技术债"对我启发很大，学校项目总是追求完美。' },
  { article: 4, author: '程序员小A', body: '难得看到一个PM能这样理解开发团队，希望能和更多这样的PM合作。' },
  { article: 5, author: '张三', body: '学习路线很全面！建议在第一阶段加一个"学会用Google和StackOverflow"，这技能比任何框架都重要。' },
  { article: 5, author: '王小明', body: '同在学全栈，共勉！另外推荐The Odin Project，免费且高质量。' },
  { article: 6, author: 'AliceChen', body: '第8条Web Worker我还没用过，查了一下确实是个好东西，学习了！' },
  { article: 7, author: '张三', body: 'SQLite做小项目真的很方便，我一个side project用的就是SQLite。' },
  { article: 7, author: '王小明', body: '补充：SQLite的FTS5全文搜索也很强大，做博客搜索功能很好用。' },
];

const commentAuthors = ['李四', '王小明', 'AliceChen', '程序员小A', '张三', '产品经理老张'];
for (const c of comments) {
  db.prepare('INSERT INTO comments (body, article_id, author_id) VALUES (?, ?, ?)')
    .run(c.body, articleIds[c.article], userMap[c.author]);
}
console.log(`  ✅ ${comments.length} 条评论已创建`);

// ===== 收藏数据 =====
console.log(`\n⭐ 创建收藏关系...\n`);
const favorites = [
  { user: '李四', article: 0 },
  { user: '王小明', article: 0 },
  { user: 'AliceChen', article: 0 },
  { user: '程序员小A', article: 1 },
  { user: '张三', article: 1 },
  { user: '产品经理老张', article: 1 },
  { user: '张三', article: 2 },
  { user: '程序员小A', article: 2 },
  { user: 'AliceChen', article: 2 },
  { user: '王小明', article: 3 },
  { user: '李四', article: 3 },
  { user: '张三', article: 4 },
  { user: '程序员小A', article: 4 },
  { user: '王小明', article: 5 },
  { user: '李四', article: 5 },
  { user: '产品经理老张', article: 5 },
  { user: 'AliceChen', article: 6 },
  { user: '李四', article: 6 },
  { user: '程序员小A', article: 7 },
  { user: '张三', article: 7 },
];
for (const f of favorites) {
  db.prepare('INSERT OR IGNORE INTO favorites (user_id, article_id) VALUES (?, ?)')
    .run(userMap[f.user], articleIds[f.article]);
}
console.log(`  ✅ ${favorites.length} 条收藏已创建`);

// ===== 关注关系 =====
console.log(`\n👥 创建关注关系...\n`);
const follows = [
  ['李四', '张三'],
  ['王小明', '张三'],
  ['程序员小A', '张三'],
  ['产品经理老张', '张三'],
  ['AliceChen', '张三'],
  ['张三', '李四'],
  ['王小明', '李四'],
  ['程序员小A', '李四'],
  ['AliceChen', '李四'],
  ['张三', '王小明'],
  ['李四', '王小明'],
  ['程序员小A', '王小明'],
  ['张三', '程序员小A'],
  ['王小明', '程序员小A'],
  ['AliceChen', '王小明'],
  ['AliceChen', '程序员小A'],
  ['产品经理老张', '李四'],
  ['产品经理老张', '王小明'],
];
for (const [follower, followee] of follows) {
  db.prepare('INSERT OR IGNORE INTO follows (follower_id, followee_id) VALUES (?, ?)')
    .run(userMap[follower], userMap[followee]);
}
console.log(`  ✅ ${follows.length} 条关注已创建`);

// ===== 统计 =====
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
const articleCount = db.prepare('SELECT COUNT(*) as count FROM articles').get().count;
const commentCount = db.prepare('SELECT COUNT(*) as count FROM comments').get().count;
const tagCount = db.prepare('SELECT COUNT(*) as count FROM tags').get().count;
const favoriteCount = db.prepare('SELECT COUNT(*) as count FROM favorites').get().count;
const followCount = db.prepare('SELECT COUNT(*) as count FROM follows').get().count;

console.log(`\n📊 ========== 数据统计 ==========`);
console.log(`  用户: ${userCount} 人`);
console.log(`  文章: ${articleCount} 篇`);
console.log(`  评论: ${commentCount} 条`);
console.log(`  标签: ${tagCount} 个`);
console.log(`  收藏: ${favoriteCount} 条`);
console.log(`  关注: ${followCount} 对`);
console.log(`================================\n`);
console.log('✅ 种子数据填充完成！');
