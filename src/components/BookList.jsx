import { useState } from 'react'
import { Link } from 'react-router-dom'

function formatDate(value) {
  return new Date(value).toLocaleString('ko-KR', {
    year: '2-digit',
    month: 'short',
    day: 'numeric',
  })
}

const PAGE_SIZE = 5

const SPINE_COLORS = [
  '#8b2e1a', '#c9902a', '#5a7a5a', '#2a5a7a', '#7a2a5a',
  '#4a6a3a', '#7a5a2a', '#2a4a7a', '#6a3a7a', '#3a6a5a',
]

function spineColor(id) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return SPINE_COLORS[hash % SPINE_COLORS.length]
}

export default function BookList({ books }) {
  const [page, setPage] = useState(1)

  if (books.length === 0) {
    return (
      <div className="empty-state">
        <svg width="140" height="100" viewBox="0 0 140 100" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="88" width="140" height="6" rx="3" fill="#e8d8c0"/>
          <rect x="0" y="8" width="4" height="80" fill="#e8d8c0"/>
          <rect x="136" y="8" width="4" height="80" fill="#e8d8c0"/>
          <rect x="12" y="28" width="16" height="60" rx="2" fill="#e8d8c0" opacity="0.6"/>
          <rect x="32" y="38" width="12" height="50" rx="2" fill="#e8d8c0" opacity="0.4"/>
          <rect x="48" y="22" width="18" height="66" rx="2" fill="#e8d8c0" opacity="0.5"/>
          <rect x="76" y="32" width="14" height="56" rx="2" fill="none" stroke="#e8d8c0" strokeWidth="1.5" strokeDasharray="4 3"/>
          <rect x="96" y="20" width="18" height="68" rx="2" fill="none" stroke="#e8d8c0" strokeWidth="1.5" strokeDasharray="4 3"/>
          <rect x="120" y="36" width="12" height="52" rx="2" fill="none" stroke="#e8d8c0" strokeWidth="1.5" strokeDasharray="4 3"/>
          <text x="70" y="72" fontSize="18" fill="#c9902a" textAnchor="middle" opacity="0.5">✦</text>
        </svg>
        <p className="empty-state-title">아직 책이 없어요</p>
        <p className="empty-state-desc">책에서 문구를 공유하면<br/>자동으로 책이 만들어집니다</p>
      </div>
    )
  }

  const totalPages = Math.ceil(books.length / PAGE_SIZE)
  const start = (page - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE
  const paged = books.slice(start, end)

  const goToPrevious = () => setPage((p) => Math.max(1, p - 1))
  const goToNext = () => setPage((p) => Math.min(totalPages, p + 1))

  return (
    <>
      <ul className="book-list">
        {paged.map((book) => (
          <li key={book.id}>
            <Link to={`/book/${book.id}`}>
              <span className="book-spine" style={{ background: spineColor(book.id) }} />
              <strong>{book.title}</strong>
              <span>{book.author || '저자 없음'}</span>
              <em>{book.quoteCount}개</em>
              <time>{formatDate(book.created_at)}</time>
            </Link>
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <div className="row pagination">
          <button
            type="button"
            className="text-button"
            onClick={goToPrevious}
            disabled={page === 1}
          >
            이전
          </button>
          <p className="hint" style={{ margin: '0 0.5rem', fontSize: '0.9rem' }}>
            {page} / {totalPages}
          </p>
          <button
            type="button"
            className="text-button"
            onClick={goToNext}
            disabled={page === totalPages}
          >
            다음
          </button>
        </div>
      )}
    </>
  )
}
