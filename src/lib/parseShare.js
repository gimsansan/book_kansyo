const CITE = /^<(.+?)>\s*,\s*(.+?)\s*-\s*밀리의 서재$/

export function parseShare(raw) {
  const cleaned = String(raw ?? '').replace(/\r\n/g, '\n').trim()
  if (!cleaned) {
    return { title: '', author: '', text: '', ok: false }
  }

  const lines = cleaned.split('\n')
  const last = lines[lines.length - 1].trim()
  const match = last.match(CITE)

  if (!match) {
    return { title: '', author: '', text: cleaned, ok: false }
  }

  return {
    title: match[1].trim(),
    author: match[2].trim(),
    text: lines.slice(0, -1).join('\n').trim(),
    ok: true,
  }
}
