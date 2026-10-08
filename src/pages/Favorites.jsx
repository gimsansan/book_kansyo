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
        <div className="empty-state">
          <svg width="120" height="110" viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
            <path d="M60,8 L69,36 L98,36 L75,53 L84,81 L60,64 L36,81 L45,53 L22,36 L51,36 Z"
              fill="none" stroke="#e8d8c0" strokeWidth="2.5" strokeLinejoin="round"/>
            <path d="M18,22 L20,28 L26,28 L21,32 L23,38 L18,34 L13,38 L15,32 L10,28 L16,28 Z"
              fill="#e8d8c0" opacity="0.5"/>
            <path d="M100,18 L102,24 L108,24 L103,28 L105,34 L100,30 L95,34 L97,28 L92,24 L98,24 Z"
              fill="#e8d8c0" opacity="0.4"/>
            <path d="M96,72 L97.5,76 L102,76 L98.5,78.5 L100,82.5 L96,80 L92,82.5 L93.5,78.5 L90,76 L94.5,76 Z"
              fill="#e8d8c0" opacity="0.5"/>
            <circle cx="60" cy="54" r="6" fill="#c9902a" opacity="0.25"/>
            <circle cx="60" cy="54" r="3" fill="#c9902a" opacity="0.4"/>
            <line x1="60" y1="44" x2="60" y2="42" stroke="#c9902a" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
            <line x1="60" y1="64" x2="60" y2="66" stroke="#c9902a" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
            <line x1="50" y1="54" x2="48" y2="54" stroke="#c9902a" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
            <line x1="70" y1="54" x2="72" y2="54" stroke="#c9902a" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
          </svg>
          <p className="empty-state-title">즐겨찾기한 문구가 없어요</p>
          <p className="empty-state-desc">마음에 드는 문구의 ☆ 버튼을 누르면<br/>여기에 모입니다</p>
        </div>
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
