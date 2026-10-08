import { describe, expect, it } from 'vitest'
import { hasShareParams, rawFromShareParams } from './shareTarget.js'
import { parseShare } from './parseShare.js'

const params = (object) => new URLSearchParams(object)

describe('rawFromShareParams', () => {
  it('공유 메뉴가 넘긴 본문을 그대로 붙여넣기 내용으로 쓴다', () => {
    const raw = rawFromShareParams(
      params({ text: '문구 한 줄\n<어떤 책>, 저자 - 밀리의 서재' }),
    )
    const parsed = parseShare(raw)
    expect(parsed.ok).toBe(true)
    expect(parsed.title).toBe('어떤 책')
    expect(parsed.text).toBe('문구 한 줄')
  })

  it('본문이 없으면 제목을 본문 자리에 쓴다', () => {
    expect(rawFromShareParams(params({ title: '제목만 왔다' }))).toBe('제목만 왔다')
  })

  it('주소를 따로 보내면 본문 끝에 붙인다', () => {
    const raw = rawFromShareParams(
      params({ text: '문구', url: 'https://millie.co.kr/book/1' }),
    )
    expect(raw).toBe('문구\nhttps://millie.co.kr/book/1')
  })

  it('본문에 이미 주소가 있으면 다시 붙이지 않는다', () => {
    const raw = rawFromShareParams(
      params({ text: '문구 https://millie.co.kr/book/1', url: 'https://millie.co.kr/book/1' }),
    )
    expect(raw).toBe('문구 https://millie.co.kr/book/1')
  })

  it('빈 공유는 빈 문자열이 된다', () => {
    expect(rawFromShareParams(params({ text: '  ', url: '' }))).toBe('')
    expect(hasShareParams(params({ text: '  ' }))).toBe(false)
    expect(hasShareParams(params({ text: '문구' }))).toBe(true)
  })
})
