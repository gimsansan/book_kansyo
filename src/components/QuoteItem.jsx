import { useState } from 'react'
import { Link } from 'react-router-dom'
import Highlight from './Highlight.jsx'
import { deleteQuote, updateQuote } from '../lib/storage.js'

function formatDate(value) {
  return new Date(value).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function QuoteItem({
  quote,
  query = '',
  showBook = false,
  dragHandle = null,
}) {
  const [page, setPage] = useState(quote.page || '')
  const [note, setNote] = useState(quote.note || '')
  const [favorite, setFavorite] = useState(quote.favorite || false)
  const setHandleRef = dragHandle?.setActivatorNodeRef

  function savePage() {
    if (page !== (quote.page || '')) updateQuote(quote.id, { page })
  }

  function saveNote() {
    if (note !== (quote.note || '')) updateQuote(quote.id, { note })
  }

  function toggleFavorite() {
    const next = !favorite
    setFavorite(next)
    updateQuote(quote.id, { favorite: next })
  }

  function onDelete() {
    if (window.confirm('이 문구를 삭제할까요?')) deleteQuote(quote.id)
  }

  return (
    <article className="quote">
      <p className="quote-text">
        <Highlight text={quote.text} query={query} />
      </p>
      <div className="quote-meta">
        <time>{formatDate(quote.created_at)}</time>
        {showBook && quote.book && (
          <Link to={`/book/${quote.book.id}`}>
            {quote.book.title}
            {quote.book.author ? ` · ${quote.book.author}` : ''}
          </Link>
        )}
      </div>
      <div className="quote-edit">
        <label>
          페이지
          <input
            value={page}
            placeholder="다시 볼 페이지"
            onChange={(event) => setPage(event.target.value)}
            onBlur={savePage}
          />
        </label>
        <label>
          메모
          <textarea
            rows={2}
            value={note}
            placeholder="내 생각"
            onChange={(event) => setNote(event.target.value)}
            onBlur={saveNote}
          />
        </label>
      </div>
      {query && quote.note && (
        <p className="note-hit">
          메모: <Highlight text={quote.note} query={query} />
        </p>
      )}
      <div className="quote-tools">
        {dragHandle && (
          <button
            ref={setHandleRef}
            type="button"
            className="drag-handle"
            aria-label="끌어서 이동"
            {...dragHandle.attributes}
            {...dragHandle.listeners}
          >
            ⋮⋮
          </button>
        )}
        <button
          type="button"
          className="text-button star-button"
          aria-pressed={favorite}
          onClick={toggleFavorite}
          aria-label={favorite ? '즐겨찾기 해제' : '즐겨찾기'}
        >
          {favorite ? '★' : '☆'}
        </button>
        <button type="button" className="text-button" onClick={onDelete}>
          삭제
        </button>
      </div>
    </article>
  )
}
