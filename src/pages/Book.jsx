import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PasteBox from '../components/PasteBox.jsx'
import SortableQuotes from '../components/SortableQuotes.jsx'
import {
  deleteBook,
  getBook,
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
  const [title, setTitle] = useState(book?.title ?? '')
  const [author, setAuthor] = useState(book?.author ?? '')
  const [message, setMessage] = useState('')

  useEffect(() => {
    setTitle(book?.title ?? '')
    setAuthor(book?.author ?? '')
  }, [book])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 3000)
    return () => clearTimeout(timer)
  }, [message])

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
    const result = updateBook(book.id, { title, author })
    setMessage(result.ok ? '저장했습니다.' : result.error)
  }

  function onDeleteBook() {
    if (window.confirm('이 책과 포함된 문구를 모두 삭제할까요?')) {
      deleteBook(book.id)
      navigate('/', { replace: true })
    }
  }

  return (
    <div className="stack">
      <Link className="back" to="/">
        홈
      </Link>
      <form className="panel book-head" onSubmit={onSaveBook}>
        <label className="field">
          <span>제목</span>
          <input
            value={title}
            onChange={(event) => {
              setTitle(event.target.value)
              setMessage('')
            }}
          />
        </label>
        <label className="field">
          <span>저자</span>
          <input
            value={author}
            onChange={(event) => {
              setAuthor(event.target.value)
              setMessage('')
            }}
          />
        </label>
        <div className="book-actions">
          <button type="submit" disabled={!title.trim()}>
            책 정보 저장
          </button>
          <button
            type="button"
            className="text-button delete-book-btn"
            onClick={onDeleteBook}
          >
            책 삭제
          </button>
        </div>
        {message && <p className="status">{message}</p>}
      </form>
      <PasteBox
        label="이 책에 문구 추가"
        initialDraft={{ title: book.title, author: book.author, text: '', ok: true }}
      />
      <h2>문구 {quotes.length}개</h2>
      {quotes.length > 1 && (
        <p className="hint">손잡이를 끌어 이 책 안에서 순서를 바꿉니다.</p>
      )}
      <SortableQuotes bookId={id} quotes={quotes} />
    </div>
  )
}
