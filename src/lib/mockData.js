const CATALOG = [
  {
    title: '데미안',
    author: '헤르만 헤세',
    lines: [
      '새는 알에서 나오려고 투쟁한다. 알은 세계다.',
      '두려워하는 그곳으로 가보라.',
    ],
  },
  {
    title: '채식주의자',
    author: '한강',
    lines: [
      '나는 고기가 먹고 싶지 않았어.',
      '나무가 되고 싶다는 꿈을 꾸었다.',
    ],
  },
  {
    title: '코스모스',
    author: '칼 세이건',
    lines: [
      '우리는 별의 물질로 만들어졌다.',
      '어딘가, 믿을 수 없는 무언가가 발견되기를 기다리고 있다.',
    ],
  },
  {
    title: '사피엔스',
    author: '유발 하라리',
    lines: [
      '허구를 공유하는 능력 덕분에 낯선 사람들과 협력할 수 있었다.',
      '밀은 인간을 길들였다.',
    ],
  },
  {
    title: '불편한 편의점',
    author: '김호연',
    lines: [
      '편의점 불빛 아래서 사람은 잠깐 정직해진다.',
      '도와달라는 말을 삼키는 쪽이 더 힘들 때가 있다.',
    ],
  },
]

function shuffle(list) {
  const copy = [...list]
  let seed = 20261007
  for (let index = copy.length - 1; index > 0; index -= 1) {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    const swap = seed % (index + 1)
    ;[copy[index], copy[swap]] = [copy[swap], copy[index]]
  }
  return copy
}

export function buildMockLibrary() {
  const flat = CATALOG.flatMap((book) =>
    book.lines.map((text) => ({
      title: book.title,
      author: book.author,
      text,
    })),
  )
  const mixed = shuffle(flat)
  const books = []
  const quotes = []

  mixed.forEach((item, index) => {
    const bookId = `mock-book-${index}`
    const created_at = new Date(Date.UTC(2026, 0, 1, 0, index)).toISOString()
    books.push({
      id: bookId,
      title: item.title,
      author: item.author,
      created_at,
    })
    quotes.push({
      id: `mock-quote-${index}`,
      book_id: bookId,
      text: item.text,
      page: '',
      note: '',
      raw: '',
      position: 0,
      created_at,
    })
  })

  return { books, quotes }
}
