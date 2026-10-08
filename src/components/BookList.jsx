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
    return <p className="empty">아직 저장한 책이 없습니다.</p>
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
