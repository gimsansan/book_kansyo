import { describe, expect, it } from 'vitest'
import { parseShare } from './parseShare.js'

const SAMPLE = `민상기 님은 독립출판 유통 플랫폼 ‘인디펍’을 운영하는 1인 사업가다. 14년간 초등학교 교사로 일하다 IT에 흥미를 느껴 인디펍을 창업하고 개발자로 진로를 바꿨다. 그런데 4년간 잘 운영하던 사이트가 갑자기 시한폭탄이 됐다. 기존의 코드들이 복잡하게 꼬여 매일 80개가 넘는 서버 경고 메일이 날아오기 시작한 것이다.
<김미경의 플러스 휴먼>, 김미경 - 밀리의 서재`

describe('parseShare', () => {
  it('밀리의 서재 공유 텍스트를 제목, 저자, 본문으로 나눈다', () => {
    const result = parseShare(SAMPLE)
    expect(result.ok).toBe(true)
    expect(result.title).toBe('김미경의 플러스 휴먼')
    expect(result.author).toBe('김미경')
    expect(result.text.startsWith('민상기 님은')).toBe(true)
    expect(result.text.includes('밀리의 서재')).toBe(false)
  })

  it('본문이 여러 줄이면 마지막 줄만 서지 정보로 본다', () => {
    const result = parseShare('첫 줄\n둘째 줄\n<책>, 저자 - 밀리의 서재')
    expect(result.text).toBe('첫 줄\n둘째 줄')
    expect(result.title).toBe('책')
    expect(result.author).toBe('저자')
  })

  it('저자가 여러 명이면 문자열 그대로 저장한다', () => {
    const result = parseShare('문구\n<어떤 책>, 홍길동, 김철수 - 밀리의 서재')
    expect(result.author).toBe('홍길동, 김철수')
    expect(result.title).toBe('어떤 책')
  })

  it('형식이 아니면 전체를 본문으로 두고 제목은 비워 둔다', () => {
    const result = parseShare('그냥 메모입니다.')
    expect(result.ok).toBe(false)
    expect(result.title).toBe('')
    expect(result.author).toBe('')
    expect(result.text).toBe('그냥 메모입니다.')
  })

  it('앞뒤 공백과 빈 줄을 정리한다', () => {
    const result = parseShare('\n\n  본문  \n\n<책>, 저자 - 밀리의 서재\n\n')
    expect(result.text).toBe('본문')
    expect(result.title).toBe('책')
  })
})
