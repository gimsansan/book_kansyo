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
          {results.length === 0 ? (
            <div className="empty-search">
              <p className="empty">"{query}"에 대한 결과가 없습니다.</p>
              <button type="button" className="text-button" onClick={() => setQuery('')}>
                검색어 지우기
              </button>
            </div>
          ) : (
            <QuoteList quotes={results} query={query.trim()} showBook />
          )}
        </>
      ) : (
        <p className="empty">검색어를 입력하세요.</p>
      )}
    </div>
  )
}
