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

describe('mergeJson — 합치기 가져오기', () => {
  beforeEach(() => {
    for (const key of Object.keys(mem)) delete mem[key]
    storage.importJson(JSON.stringify({ books: [], quotes: [] }))
  })

  // 다른 기기에서 내보낸 백업을 흉내 낸다. id는 이 기기와 겹치지 않는다.
  function otherDevice(books, quotes) {
    return JSON.stringify({ books, quotes })
  }

  it('이 기기에 없는 책과 문구만 더한다', () => {
    const mine = storage.addQuote({
      title: '내 책',
      author: '저자',
      text: '내 문구',
      raw: '',
    })
    const report = storage.mergeJson(
      otherDevice(
        [{ id: 'b-other', title: '남의 책', author: '저자', created_at: '2026-01-01T00:00:00.000Z' }],
        [
          {
            id: 'q-other',
            book_id: 'b-other',
            text: '남의 문구',
            position: 0,
            created_at: '2026-01-01T00:00:00.000Z',
          },
        ],
      ),
    )

    expect(report).toEqual({ books: 1, quotes: 1, skipped: 0 })
    expect(storage.listBooks()).toHaveLength(2)
    // 원래 있던 것은 그대로
    expect(storage.listQuotesByBook(mine.book.id).map((q) => q.text)).toEqual(['내 문구'])
  })

  it('id가 달라도 제목·저자가 같으면 같은 책으로 합친다', () => {
    const mine = storage.addQuote({
      title: '같은 책',
      author: '저자',
      text: '이 기기 문구',
      raw: '',
    })
    storage.mergeJson(
      otherDevice(
        [{ id: 'b-other', title: '같은 책', author: '저자', created_at: '2026-01-01T00:00:00.000Z' }],
        [
          {
            id: 'q-other',
            book_id: 'b-other',
            text: '저 기기 문구',
            position: 0,
            created_at: '2026-01-01T00:00:00.000Z',
          },
        ],
      ),
    )

    // 책이 둘로 갈라지지 않는다
    expect(storage.listBooks()).toHaveLength(1)
    expect(storage.listQuotesByBook(mine.book.id).map((q) => q.text)).toEqual([
      '이 기기 문구',
      '저 기기 문구',
    ])
  })

  it('같은 책에 같은 본문이 이미 있으면 건너뛴다', () => {
    storage.addQuote({ title: '책', author: '저자', text: '겹치는 문구', raw: '' })
    const report = storage.mergeJson(
      otherDevice(
        [{ id: 'b-other', title: '책', author: '저자', created_at: '2026-01-01T00:00:00.000Z' }],
        [
          {
            id: 'q-other',
            book_id: 'b-other',
            text: '  겹치는 문구  ',
            position: 0,
            created_at: '2026-01-01T00:00:00.000Z',
          },
        ],
      ),
    )

    expect(report.quotes).toBe(0)
    expect(report.skipped).toBe(1)
    expect(storage.listQuotesByBook(storage.listBooks()[0].id)).toHaveLength(1)
  })

  it('id가 겹치면 이 기기의 문구를 남긴다', () => {
    const mine = storage.addQuote({ title: '책', author: '저자', text: '원본', raw: '' })
    storage.mergeJson(
      otherDevice(
        [{ id: mine.book.id, title: '책', author: '저자', created_at: mine.book.created_at }],
        [
          {
            id: mine.quote.id,
            book_id: mine.book.id,
            text: '다른 기기에서 고친 글',
            position: 0,
            created_at: mine.quote.created_at,
          },
        ],
      ),
    )

    expect(storage.listQuotesByBook(mine.book.id).map((q) => q.text)).toEqual(['원본'])
  })

  it('합쳐 넣은 문구는 그 책의 맨 뒤에 붙고 순서가 겹치지 않는다', () => {
    const mine = storage.addQuote({ title: '책', author: '저자', text: 'A', raw: '' })
    storage.addQuote({ title: '책', author: '저자', text: 'B', raw: '' })
    storage.mergeJson(
      otherDevice(
        [{ id: 'b-other', title: '책', author: '저자', created_at: '2026-01-01T00:00:00.000Z' }],
        [
          { id: 'q1', book_id: 'b-other', text: 'C', position: 0, created_at: '2026-01-01T00:00:00.000Z' },
          { id: 'q2', book_id: 'b-other', text: 'D', position: 1, created_at: '2026-01-01T00:00:00.000Z' },
        ],
      ),
    )

    const ordered = storage.listQuotesByBook(mine.book.id)
    expect(ordered.map((q) => q.text)).toEqual(['A', 'B', 'C', 'D'])
    expect(ordered.map((q) => q.position)).toEqual([0, 1, 2, 3])
  })

  it('덮어쓰기(importJson)와 달리 기존 데이터를 지우지 않는다', () => {
    storage.addQuote({ title: '지키고 싶은 책', author: '저자', text: '문구', raw: '' })
    const backup = otherDevice(
      [{ id: 'b-other', title: '다른 책', author: '저자', created_at: '2026-01-01T00:00:00.000Z' }],
      [],
    )

    storage.mergeJson(backup)
    expect(storage.listBooks()).toHaveLength(2)

    storage.importJson(backup)
    expect(storage.listBooks()).toHaveLength(1)
  })

  it('백업 형식이 아니면 던지고 데이터를 건드리지 않는다', () => {
    storage.addQuote({ title: '책', author: '저자', text: '문구', raw: '' })
    expect(() => storage.mergeJson('{"books":[]}')).toThrow()
    expect(storage.listBooks()).toHaveLength(1)
  })
})
