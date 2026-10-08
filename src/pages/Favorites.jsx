import QuoteList from '../components/QuoteList.jsx'
import { listFavoriteQuotes } from '../lib/storage.js'
import { useLibrary } from '../lib/useLibrary.js'

export default function Favorites() {
  useLibrary()
  const favorites = listFavoriteQuotes()

  const groups = favorites.reduce((acc, quote) => {
    const key = quote.book?.id ?? '__none__'
    const label = quote.book ? `${quote.book.title} · ${quote.book.author}` : '책 없음'
    if (!acc[key]) acc[key] = { label, quotes: [] }
    acc[key].quotes.push(quote)
    return acc
  }, {})

  return (
    <div className="stack">
      <h2>즐겨찾기</h2>
      {favorites.length === 0 ? (
        <p className="empty">즐겨찾기한 문구가 없습니다.</p>
      ) : (
        Object.values(groups).map((group) => (
          <section key={group.label}>
            <p className="hint favorites-book-label">{group.label}</p>
            <QuoteList quotes={group.quotes} />
          </section>
        ))
      )}
    </div>
  )
}
