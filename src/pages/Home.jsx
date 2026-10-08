import BackupBox from '../components/BackupBox.jsx'
import BookList from '../components/BookList.jsx'
import PasteBox from '../components/PasteBox.jsx'
import QuoteList from '../components/QuoteList.jsx'
import {
  clearLibrary,
  getSnapshot,
  listBooks,
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
      {books.length > 0 && (
        <p className="hint stats">책 {books.length}권 · 문구 {quotes.length}개</p>
      )}
      <PasteBox />
      <section>
        <h2>최근 문구</h2>
        <QuoteList quotes={recent} showBook />
      </section>
      <section>
        <h2>책</h2>
        <BookList books={books} />
      </section>
      <BackupBox />
    </div>
  )
}
