// 안드로이드 공유 메뉴가 넘겨주는 title/text/url을 붙여넣기 한 덩어리로 되돌린다.
// 앱마다 어디에 무엇을 담는지가 달라서, 본문에 이미 들어 있는 값은 다시 붙이지 않는다.
export function rawFromShareParams(params) {
  const get = (key) => String(params?.get(key) ?? '').replace(/\r\n/g, '\n').trim()
  const title = get('title')
  const text = get('text')
  const url = get('url')

  const parts = []
  if (text) parts.push(text)
  else if (title) parts.push(title)
  if (url && !parts.some((part) => part.includes(url))) parts.push(url)

  return parts.join('\n').trim()
}

export function hasShareParams(params) {
  return ['title', 'text', 'url'].some((key) => String(params?.get(key) ?? '').trim())
}
