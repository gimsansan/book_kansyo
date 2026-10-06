import { Link } from 'react-router-dom'

export default function BookList({ books }) {
  if (books.length === 0) {
    return <p className="empty">아직 저장한 책이 없습니다.</p>
  }

  return (
    <ul className="book-list">
      {books.map((book) => (
        <li key={book.id}>
          <Link to={`/book/${book.id}`}>
            <strong>{book.title}</strong>
            <span>{book.author || '저자 없음'}</span>
            <em>{book.quoteCount}개</em>
          </Link>
        </li>
      ))}
    </ul>
  )
}
