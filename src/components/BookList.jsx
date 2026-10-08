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
