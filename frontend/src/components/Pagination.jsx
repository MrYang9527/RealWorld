export default function Pagination({ total, limit, offset, onPageChange }) {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="pagination">
      {pages.map((page, idx) =>
        page === '...' ? (
          <span key={`dots-${idx}`} className="page-dots">...</span>
        ) : (
          <button
            key={page}
            className={`page-btn ${page === currentPage ? 'active' : ''}`}
            onClick={() => onPageChange((page - 1) * limit)}
          >
            {page}
          </button>
        )
      )}
    </div>
  );
}
