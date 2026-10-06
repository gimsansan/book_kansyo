function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export default function Highlight({ text, query }) {
  const source = text || ''
  const needle = query.trim()
  if (!needle) return source

  const parts = source.split(new RegExp(`(${escapeRegExp(needle)})`, 'ig'))
  return parts.map((part, index) =>
    part.toLowerCase() === needle.toLowerCase() ? (
      <mark key={index}>{part}</mark>
    ) : (
      <span key={index}>{part}</span>
    ),
  )
}
