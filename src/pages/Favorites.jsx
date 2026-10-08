import QuoteList from '../components/QuoteList.jsx'
import { listFavoriteQuotes } from '../lib/storage.js'
import { useLibrary } from '../lib/useLibrary.js'

export default function Favorites() {
  useLibrary()
  const favorites = listFavoriteQuotes()

  return (
    <div className="stack">
      <h2>즐겨찾기</h2>
      <QuoteList quotes={favorites} showBook />
    </div>
  )
}
