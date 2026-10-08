import BackupBox from '../components/BackupBox.jsx'
import BookList from '../components/BookList.jsx'
import PasteBox from '../components/PasteBox.jsx'
import QuoteList from '../components/QuoteList.jsx'
import {
  clearLibrary,
  getSnapshot,
  listBooks,
  listFavoriteQuotes,
  listRecentQuotes,
  loadMock,
  mockIsActive,
} from '../lib/storage.js'
import { useLibrary } from '../lib/useLibrary.js'

export default function Home() {
  useLibrary()
  const books = listBooks()
  const recent = listRecentQuotes(5)
  const { quotes } = getSnapshot()
  const favorites = listFavoriteQuotes()
  const heroQuote = favorites[0] ?? recent[0] ?? null

  return (
    <div className="stack">
      {mockIsActive() && (
        <section className="panel">
          <p className="hint">
            드래그 연습용 목업입니다. 같은 제목이 여러 장으로 흩어져 있습니다.
            책을 연 뒤 손잡이를 같은 제목 위에 놓아 보세요.
          </p>
          <div className="row">
            <button type="button" onClick={loadMock}>
              목업 다시 섞기
            </button>
            <button type="button" onClick={clearLibrary}>
              목업 지우기
            </button>
          </div>
        </section>
      )}

      {/* 히어로 배너 */}
      {heroQuote && (
        <div className="hero-banner">
          <div className="hero-label">
            {favorites.length > 0 ? '★ 즐겨찾기 문구' : '최근 문구'}
          </div>
          <blockquote className="hero-quote">"{heroQuote.text}"</blockquote>
          {heroQuote.book && (
            <div className="hero-book">
              <span className="hero-dot" />
              {heroQuote.book.title}
              {heroQuote.book.author ? ` · ${heroQuote.book.author}` : ''}
            </div>
          )}
        </div>
      )}

      {/* 통계 바 */}
      {books.length > 0 && (
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-num">{books.length}</span>
            <span className="stat-label">권의 책</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">{quotes.length}</span>
            <span className="stat-label">개의 문구</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">{favorites.length}</span>
            <span className="stat-label">즐겨찾기</span>
          </div>
        </div>
      )}

      <PasteBox />

      <section>
        <h2>최근 문구</h2>
        <QuoteList quotes={recent} showBook />
        {recent.length > 0 && <div className="ornament">✦ ✦ ✦</div>}
      </section>

      <section>
        <h2>책</h2>
        <BookList books={books} />
      </section>

      <BackupBox />
    </div>
  )
}
