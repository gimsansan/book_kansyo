import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import SortableQuotes from '../components/SortableQuotes.jsx'
import {
  getBook,
  listBooks,
  listQuotesByBook,
  updateBook,
} from '../lib/storage.js'
import { useLibrary } from '../lib/useLibrary.js'

export default function Book() {
  useLibrary()
  const { id } = useParams()
  const navigate = useNavigate()
  const book = getBook(id)
  const quotes = listQuotesByBook(id)
  const otherBooks = listBooks().filter((item) => item.id !== id)
  const [title, setTitle] = useState(book?.title ?? '')
  const [author, setAuthor] = useState(book?.author ?? '')

  useEffect(() => {
    setTitle(book?.title ?? '')
    setAuthor(book?.author ?? '')
  }, [book])

  if (!book) {
    return (
      <div className="stack">
        <p className="empty">책을 찾지 못했습니다.</p>
        <Link to="/">홈으로</Link>
      </div>
    )
  }

  function onSaveBook(event) {
    event.preventDefault()
    const nextId = updateBook(book.id, { title, author })
    if (nextId !== book.id) navigate(`/book/${nextId}`, { replace: true })
  }

  return (
    <div className="stack">
      <Link className="back" to="/">
        홈
      </Link>
      <form className="panel book-head" onSubmit={onSaveBook}>
        <label className="field">
          <span>제목</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label className="field">
          <span>저자</span>
          <input
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
          />
        </label>
        <button type="submit">책 정보 저장</button>
      </form>
      <h2>문구 {quotes.length}개</h2>
      {quotes.length > 1 && (
        <p className="hint">손잡이를 끌어 이 책 안에서 순서를 바꿉니다.</p>
      )}
      <SortableQuotes bookId={id} quotes={quotes} otherBooks={otherBooks} />
    </div>
  )
}
