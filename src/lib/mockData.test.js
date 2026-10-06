import { describe, expect, it } from 'vitest'
import { buildMockLibrary } from './mockData.js'

describe('buildMockLibrary', () => {
  it('같은 제목을 한 책으로 합치지 않고 카드마다 나눠 둔다', () => {
    const { books, quotes } = buildMockLibrary()
    expect(books.length).toBeGreaterThan(5)
    expect(quotes).toHaveLength(books.length)

    const titles = books.map((book) => book.title)
    const unique = new Set(titles)
    expect(unique.size).toBeLessThan(titles.length)
    expect(new Set(books.map((book) => book.id)).size).toBe(books.length)
  })
})