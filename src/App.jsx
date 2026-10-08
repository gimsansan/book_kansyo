import { NavLink, Route, Routes } from 'react-router-dom'
import StorageNotice from './components/StorageNotice.jsx'
import Book from './pages/Book.jsx'
import Home from './pages/Home.jsx'
import Search from './pages/Search.jsx'
import Share from './pages/Share.jsx'

export default function App() {
  return (
    <div className="app">
      <header className="top">
        <h1>독서 노트</h1>
        <nav>
          <NavLink to="/" end>
            홈
          </NavLink>
          <NavLink to="/search">검색</NavLink>
        </nav>
      </header>
      <main>
        <StorageNotice />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book/:id" element={<Book />} />
          <Route path="/search" element={<Search />} />
          <Route path="/share" element={<Share />} />
        </Routes>
      </main>
    </div>
  )
}
