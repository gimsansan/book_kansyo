import { useState } from 'react'
import QuoteItem from './QuoteItem.jsx'

const PAGE_SIZE = 5

export default function QuoteList({ quotes, query = '', showBook = false }) {
  const [page, setPage] = useState(1)

  if (quotes.length === 0) {
    return <p className="empty">저장된 문구가 없습니다.</p>
  }

  const totalPages = Math.ceil(quotes.length / PAGE_SIZE)
  const paged = quotes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <>
      <div className="quote-list">
        {paged.map((quote) => (
          <QuoteItem
            key={quote.id}
            quote={quote}
            query={query}
            showBook={showBook}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="row pagination">
          <button
            type="button"
            className="text-button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
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
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            다음
          </button>
        </div>
      )}
    </>
  )
}
