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

  it('문구를 다른 책 맨 뒤로 옮겨 묶는다', () => {
    const first = storage.addQuote({
      title: '책1',
      author: '저자',
      text: '하나',
      raw: '',
    })
    const second = storage.addQuote({
      title: '책2',
      author: '다른',
      text: '둘',
      raw: '',
    })
    storage.addQuote({ title: '책1', author: '저자', text: '셋', raw: '' })

    storage.moveQuoteToBook(second.quote.id, first.book.id)
    expect(storage.listQuotesByBook(first.book.id).map((quote) => quote.text)).toEqual([
      '하나',
      '셋',
      '둘',
    ])
    expect(storage.getBook(second.book.id)).toBeNull()
  })
})
