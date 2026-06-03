import { useEffect, useState } from 'react';
import { getTags } from '../api/client';

export default function Tags({ selectedTag, onSelectTag }) {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    getTags()
      .then(res => setTags(res.data.tags))
      .catch(() => setTags([]));
  }, []);

  if (tags.length === 0) return null;

  return (
    <div className="tags-sidebar">
      <h4>热门标签</h4>
      <div className="tags">
        <button
          className={`tag ${!selectedTag ? 'active' : ''}`}
          onClick={() => onSelectTag(null)}
        >
          全部
        </button>
        {tags.map(tag => (
          <button
            key={tag}
            className={`tag ${selectedTag === tag ? 'active' : ''}`}
            onClick={() => onSelectTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
