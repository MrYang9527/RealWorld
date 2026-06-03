function slugify(title) {
  // 生成URL友好的slug：转拼音风格（保留英文和数字，空格转连字符）
  return title
    .toLowerCase()
    .replace(/[^\w\s\-]/g, '')    // 移除特殊字符
    .replace(/[\s_]+/g, '-')       // 空格和下划线转连字符
    .replace(/-+/g, '-')           // 多个连字符合并
    .replace(/^-|-$/g, '')         // 移除首尾连字符
    + '-' + Date.now().toString(36).slice(-4); // 加随机后缀防重名
}

module.exports = { slugify };
