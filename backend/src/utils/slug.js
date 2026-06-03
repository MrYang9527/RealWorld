function slugify(title) {
  // 生成URL友好的slug
  let base = title
    .toLowerCase()
    .replace(/[^\w\s\-]/g, '')    // 移除特殊字符（中文等非ASCII字符也会被移除）
    .replace(/[\s_]+/g, '-')       // 空格和下划线转连字符
    .replace(/-+/g, '-')           // 多个连字符合并
    .replace(/^-|-$/g, '');        // 移除首尾连字符

  // 如果标题全是中文等非ASCII字符，base会为空，使用时间戳作为前缀
  if (!base) {
    base = 'article';
  }

  return base + '-' + Date.now().toString(36).slice(-4); // 加随机后缀防重名
}

module.exports = { slugify };
