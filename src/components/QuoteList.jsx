import QuoteItem from './QuoteItem.jsx'

export default function QuoteList({ quotes, query = '', showBook = false }) {
  if (quotes.length === 0) {
    return <p className="empty">저장된 문구가 없습니다.</p>
  }

  return (
    <div className="quote-list">
      {quotes.map((quote) => (
        <QuoteItem
          key={quote.id}
          quote={quote}
          query={query}
          showBook={showBook}
        />
      ))}
    </div>
  )
}
