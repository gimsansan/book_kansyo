import { beforeEach, describe, expect, it } from 'vitest'

const mem = {}
globalThis.localStorage = {
  getItem: (key) => (key in mem ? mem[key] : null),
  setItem: (key, value) => {
    mem[key] = String(value)
  },
  removeItem: (key) => {
    delete mem[key]
  },
}

const storage = await import('./storage.js')

describe('quote order and move', () => {
  beforeEach(() => {
    for (const key of Object.keys(mem)) delete mem[key]
    storage.importJson(JSON.stringify({ books: [], quotes: [] }))
  })

  it('같은 책은 입력 순서를 유지하고, 드래그 순서대로 다시 배열한다', () => {
    const first = storage.addQuote({
      title: '책1',
      author: '저자',
      text: '하나',
      raw: '',
    })
    storage.addQuote({ title: '책2', author: '다른', text: '사이', raw: '' })
    storage.addQuote({ title: '책1', author: '저자', text: '둘', raw: '' })
    storage.addQuote({ title: '책1', author: '저자', text: '셋', raw: '' })

    const before = storage.listQuotesByBook(first.book.id).map((quote) => quote.text)
    expect(before).toEqual(['하나', '둘', '셋'])

    const ids = storage.listQuotesByBook(first.book.id).map((quote) => quote.id)
    storage.reorderQuotes(first.book.id, [ids[2], ids[0], ids[1]])
    const after = storage.listQuotesByBook(first.book.id).map((quote) => quote.text)
    expect(after).toEqual(['셋', '하나', '둘'])
  })

  it('같은 제목·저자로 바꾸면 병합하지 않고 저장을 막는다', () => {
    const first = storage.addQuote({ title: '책1', author: '저자', text: '하나', raw: '' })
    const second = storage.addQuote({ title: '책2', author: '다른', text: '둘', raw: '' })

    const result = storage.updateBook(second.book.id, { title: ' 책1 ', author: '저자' })
    expect(result.ok).toBe(false)
    expect(storage.getBook(second.book.id).title).toBe('책2')
    expect(storage.listQuotesByBook(first.book.id)).toHaveLength(1)
    expect(storage.listQuotesByBook(second.book.id)).toHaveLength(1)

    expect(storage.updateBook(second.book.id, { title: '책3', author: '다른' }).ok).toBe(true)
    expect(storage.getBook(second.book.id).title).toBe('책3')
  })

  it('제목이 비면 저장하지 않는다', () => {
    const item = storage.addQuote({ title: '책1', author: '저자', text: '하나', raw: '' })
    expect(storage.updateBook(item.book.id, { title: '  ', author: '' }).ok).toBe(false)
    expect(() => storage.addQuote({ title: '', author: '', text: '본문', raw: '' })).toThrow()
  })

  it('문구를 모두 삭제해도 책(폴더)은 유지된다', () => {
    const item = storage.addQuote({
      title: '보관책',
      author: '작가',
      text: '내용',
      raw: '',
    })
    storage.deleteQuote(item.quote.id)
    expect(storage.getBook(item.book.id)).not.toBeNull()
    expect(storage.listQuotesByBook(item.book.id)).toHaveLength(0)
  })

  it('deleteBook으로 수동 삭제하면 책과 포함된 문구가 삭제된다', () => {
    const item = storage.addQuote({
      title: '삭제대상책',
      author: '작가',
      text: '내용1',
      raw: '',
    })
    storage.addQuote({
      title: '삭제대상책',
      author: '작가',
      text: '내용2',
      raw: '',
    })
    expect(storage.listQuotesByBook(item.book.id)).toHaveLength(2)

    storage.deleteBook(item.book.id)
    expect(storage.getBook(item.book.id)).toBeNull()
    expect(storage.listQuotesByBook(item.book.id)).toHaveLength(0)
  })
})
