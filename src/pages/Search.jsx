import { useState } from 'react'
import QuoteList from '../components/QuoteList.jsx'
import SearchBar from '../components/SearchBar.jsx'
import { searchQuotes } from '../lib/storage.js'
import { useLibrary } from '../lib/useLibrary.js'

export default function Search() {
  useLibrary()
  const [query, setQuery] = useState('')
  const results = searchQuotes(query)

  return (
    <div className="stack">
      <SearchBar value={query} onChange={setQuery} />
      {query.trim() ? (
        <>
          <p className="hint">{results.length}개</p>
          <QuoteList quotes={results} query={query.trim()} showBook />
        </>
      ) : (
        <p className="empty">검색어를 입력하세요.</p>
      )}
    </div>
  )
}
