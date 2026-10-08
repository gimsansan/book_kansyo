import { buildMockLibrary } from './mockData.js'

const KEY = 'book-kansyo-v1'
const MOCK_FLAG = 'book-kansyo-mock-v1'

const listeners = new Set()
let snapshot = read()
let writeError = ''

function read() {
  try {
    if (typeof localStorage === 'undefined') return { books: [], quotes: [] }
    const raw = localStorage.getItem(KEY)
    if (!raw) return { books: [], quotes: [] }
    const data = JSON.parse(raw)
    return {
      books: Array.isArray(data.books) ? data.books : [],
      quotes: Array.isArray(data.quotes) ? data.quotes : [],
    }
  } catch {
    return { books: [], quotes: [] }
  }
}

// 사파리 비공개 모드나 저장 공간 부족이면 setItem이 던진다.
// 화면은 그대로 돌아가야 하므로, 실패했다는 사실만 남기고 넘어간다.
function emit(next) {
  snapshot = next
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
      writeError = ''
    } catch {
      writeError = '브라우저 저장소에 쓰지 못했습니다. 지금 JSON으로 내보내 두세요.'
    }
  }
  listeners.forEach((listener) => listener())
}

export function getWriteError() {
  return writeError
}

export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSnapshot() {
  return snapshot
}

export function mockIsActive() {
  return typeof localStorage !== 'undefined' && localStorage.getItem(MOCK_FLAG) === '1'
}

export function loadMock() {
  emit(buildMockLibrary())
  if (typeof localStorage !== 'undefined') localStorage.setItem(MOCK_FLAG, '1')
}

export function clearLibrary() {
  emit({ books: [], quotes: [] })
  if (typeof localStorage !== 'undefined') localStorage.setItem(MOCK_FLAG, 'off')
}

export function ensureDragMock() {
  if (typeof localStorage === 'undefined') return
  const flag = localStorage.getItem(MOCK_FLAG)
  if (flag === '1' || flag === 'off') return
  loadMock()
}

function uid() {
  return crypto.randomUUID()
}

export function listBooks() {
  const { books, quotes } = snapshot
  return books
    .map((book) => ({
      ...book,
      quoteCount: quotes.filter((quote) => quote.book_id === book.id).length,
    }))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export function getBook(id) {
  return snapshot.books.find((book) => book.id === id) ?? null
}

function hasPosition(quote) {
  return Number.isFinite(quote.position)
}

export function orderedQuotes(quotes) {
  return [...quotes].sort((a, b) => {
    const aPos = hasPosition(a)
    const bPos = hasPosition(b)
    if (aPos && bPos && a.position !== b.position) return a.position - b.position
    if (aPos !== bPos) return aPos ? -1 : 1
    return a.created_at.localeCompare(b.created_at)
  })
}

export function listQuotesByBook(bookId) {
  return orderedQuotes(snapshot.quotes.filter((quote) => quote.book_id === bookId))
}

export function listRecentQuotes(limit = 5) {
  const { books, quotes } = snapshot
  return [...quotes]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit)
    .map((quote) => ({
      ...quote,
      book: books.find((book) => book.id === quote.book_id) ?? null,
    }))
}

export function addQuote({ title, author, text, raw }) {
  const data = {
    books: snapshot.books.map((book) => ({ ...book })),
    quotes: snapshot.quotes.map((quote) => ({ ...quote })),
  }
  const nextTitle = title.trim()
  const nextAuthor = author.trim()
  if (!nextTitle) throw new Error('제목이 필요합니다.')
  const body = text.trim()
  let book = data.books.find(
    (item) => item.title === nextTitle && item.author === nextAuthor,
  )
  const now = new Date().toISOString()

  if (!book) {
    book = {
      id: uid(),
      title: nextTitle,
      author: nextAuthor,
      created_at: now,
    }
    data.books.push(book)
  }

  const duplicate = data.quotes.find(
    (quote) => quote.book_id === book.id && quote.text.trim() === body,
  )
  if (duplicate) return { book, quote: duplicate, duplicate: true }

  const siblings = orderedQuotes(
    data.quotes.filter((quote) => quote.book_id === book.id),
  )
  const rank = new Map(siblings.map((quote, index) => [quote.id, index]))
  data.quotes = data.quotes.map((quote) =>
    rank.has(quote.id) ? { ...quote, position: rank.get(quote.id) } : quote,
  )

  const quote = {
    id: uid(),
    book_id: book.id,
    text: body,
    page: '',
    note: '',
    raw: raw ?? '',
    position: siblings.length,
    created_at: now,
  }
  data.quotes.push(quote)
  emit(data)
  return { book, quote, duplicate: false }
}

export function reorderQuotes(bookId, orderedIds) {
  const rank = new Map(orderedIds.map((id, index) => [id, index]))
  const quotes = snapshot.quotes.map((quote) => {
    if (quote.book_id !== bookId || !rank.has(quote.id)) return quote
    return { ...quote, position: rank.get(quote.id) }
  })
  emit({ books: snapshot.books, quotes })
}

export function updateQuote(id, patch) {
  const quotes = snapshot.quotes.map((quote) => {
    if (quote.id !== id) return quote
    return {
      ...quote,
      ...(patch.page !== undefined ? { page: patch.page } : {}),
      ...(patch.note !== undefined ? { note: patch.note } : {}),
      ...(patch.text !== undefined ? { text: patch.text } : {}),
    }
  })
  emit({ books: snapshot.books, quotes })
}

export function deleteQuote(id) {
  const quotes = snapshot.quotes.filter((quote) => quote.id !== id)
  emit({ books: snapshot.books, quotes })
}

export function deleteBook(id) {
  const books = snapshot.books.filter((book) => book.id !== id)
  const quotes = snapshot.quotes.filter((quote) => quote.book_id !== id)
  emit({ books, quotes })
}

// 병합하지 않는다: 같은 제목·저자의 다른 책이 있으면 저장을 막는다
export function updateBook(id, { title, author }) {
  const nextTitle = title.trim()
  const nextAuthor = author.trim()
  if (!nextTitle) return { ok: false, error: '제목을 입력하세요.' }
  const other = snapshot.books.find(
    (book) =>
      book.id !== id && book.title === nextTitle && book.author === nextAuthor,
  )
  if (other) return { ok: false, error: '같은 제목·저자의 책이 이미 있어요.' }

  const books = snapshot.books.map((book) =>
    book.id === id ? { ...book, title: nextTitle, author: nextAuthor } : book,
  )
  emit({ books, quotes: snapshot.quotes })
  return { ok: true }
}

export function searchQuotes(query) {
  const needle = query.trim().toLowerCase()
  if (!needle) return []
  const { books, quotes } = snapshot
  return quotes
    .map((quote) => ({
      ...quote,
      book: books.find((book) => book.id === quote.book_id) ?? null,
    }))
    .filter((item) => {
      const book = item.book
      return (
        item.text.toLowerCase().includes(needle) ||
        (item.note || '').toLowerCase().includes(needle) ||
        (book?.title || '').toLowerCase().includes(needle) ||
        (book?.author || '').toLowerCase().includes(needle)
      )
    })
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export function exportJson() {
  return JSON.stringify(snapshot, null, 2)
}

function parseBackup(json) {
  const data = JSON.parse(json)
  if (!data || !Array.isArray(data.books) || !Array.isArray(data.quotes)) {
    throw new Error('백업 형식이 아닙니다.')
  }
  return data
}

// 가져오기 뒤에는 목업이 아니다.
// 플래그를 내리지 않으면 홈에 목업 상자가 남고, 거기서 '다시 섞기'를 누르면
// 방금 가져온 데이터가 목업으로 덮인다.
function dropMockFlag() {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(MOCK_FLAG, 'off')
}

// 통째로 갈아끼운다. 백업 복원용.
export function importJson(json) {
  const data = parseBackup(json)
  emit({ books: data.books, quotes: data.quotes })
  dropMockFlag()
}

function bookKey(title, author) {
  return `${String(title ?? '').trim()}
${String(author ?? '').trim()}`
}

function textKey(bookId, text) {
  return `${bookId}
${String(text ?? '').trim()}`
}

// 가져온 데이터를 지금 데이터에 얹는다. 있는 것은 건드리지 않는다.
//
// 기기마다 id를 따로 만들기 때문에(crypto.randomUUID), 같은 책이라도
// 양쪽 id가 다르다. 그래서 id가 같거나 제목·저자가 같으면 같은 책으로 본다.
// 문구는 id가 겹치거나 같은 책에 같은 본문이 이미 있으면 건너뛴다.
// 겹칠 때는 언제나 이 기기의 것을 남긴다.
export function mergeJson(json) {
  const data = parseBackup(json)
  const books = snapshot.books.map((book) => ({ ...book }))
  const quotes = snapshot.quotes.map((quote) => ({ ...quote }))

  const byId = new Map(books.map((book) => [book.id, book]))
  const byName = new Map(books.map((book) => [bookKey(book.title, book.author), book]))
  const quoteIds = new Set(quotes.map((quote) => quote.id))
  const seenText = new Set(quotes.map((quote) => textKey(quote.book_id, quote.text)))

  // 책마다 새 문구를 붙일 자리
  const nextPosition = new Map()
  for (const quote of quotes) {
    const used = Number.isFinite(quote.position) ? quote.position + 1 : 0
    nextPosition.set(quote.book_id, Math.max(nextPosition.get(quote.book_id) ?? 0, used))
  }

  const report = { books: 0, quotes: 0, skipped: 0 }
  const resolved = new Map()

  for (const incoming of data.books) {
    if (!incoming?.id) continue
    const title = String(incoming.title ?? '').trim()
    if (!title) continue
    const author = String(incoming.author ?? '').trim()
    const mine = byId.get(incoming.id) ?? byName.get(bookKey(title, author))
    if (mine) {
      resolved.set(incoming.id, mine)
      continue
    }
    const book = {
      id: incoming.id,
      title,
      author,
      created_at: incoming.created_at ?? new Date().toISOString(),
    }
    books.push(book)
    byId.set(book.id, book)
    byName.set(bookKey(title, author), book)
    resolved.set(incoming.id, book)
    report.books += 1
  }

  for (const incoming of data.quotes) {
    const book = resolved.get(incoming?.book_id)
    const body = String(incoming?.text ?? '').trim()
    if (!book || !body || !incoming.id) {
      report.skipped += 1
      continue
    }
    if (quoteIds.has(incoming.id) || seenText.has(textKey(book.id, body))) {
      report.skipped += 1
      continue
    }
    const position = nextPosition.get(book.id) ?? 0
    nextPosition.set(book.id, position + 1)
    quotes.push({
      id: incoming.id,
      book_id: book.id,
      text: incoming.text,
      page: incoming.page ?? '',
      note: incoming.note ?? '',
      raw: incoming.raw ?? '',
      position,
      created_at: incoming.created_at ?? new Date().toISOString(),
    })
    quoteIds.add(incoming.id)
    seenText.add(textKey(book.id, body))
    report.quotes += 1
  }

  emit({ books, quotes })
  dropMockFlag()
  return report
}
