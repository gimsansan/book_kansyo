import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseShare } from '../lib/parseShare.js'
import { addQuote } from '../lib/storage.js'

export default function PasteBox() {
  const navigate = useNavigate()
  const [raw, setRaw] = useState('')
  const [draft, setDraft] = useState(null)
  const [message, setMessage] = useState('')

  function onChange(value) {
    setRaw(value)
    setMessage('')
    setDraft(value.trim() ? parseShare(value) : null)
  }

  function onSave() {
    if (!draft || !draft.text.trim()) {
      setMessage('본문이 비어 있습니다.')
      return
    }
    const result = addQuote({
      title: draft.title,
      author: draft.author,
      text: draft.text,
      raw,
    })
    if (result.duplicate) {
      setMessage('이미 저장한 문구입니다.')
      return
    }
    setRaw('')
    setDraft(null)
    setMessage('저장했습니다.')
    navigate(`/book/${result.book.id}`)
  }

  return (
    <section className="panel">
      <label className="field">
        <span>밀리의 서재에서 공유한 문구</span>
        <textarea
          value={raw}
          rows={7}
          placeholder="공유 텍스트를 붙여넣으세요."
          onChange={(event) => onChange(event.target.value)}
        />
      </label>

      {draft && (
        <div className="preview">
          <p className="hint">
            {draft.ok
              ? '책과 저자를 찾았습니다. 맞으면 저장하세요.'
              : '형식을 못 찾았습니다. 제목을 직접 고칠 수 있습니다.'}
          </p>
          <label className="field">
            <span>제목</span>
            <input
              value={draft.title}
              onChange={(event) =>
                setDraft({ ...draft, title: event.target.value })
              }
            />
          </label>
          <label className="field">
            <span>저자</span>
            <input
              value={draft.author}
              onChange={(event) =>
                setDraft({ ...draft, author: event.target.value })
              }
            />
          </label>
          <label className="field">
            <span>본문</span>
            <textarea
              rows={5}
              value={draft.text}
              onChange={(event) =>
                setDraft({ ...draft, text: event.target.value })
              }
            />
          </label>
          <button type="button" className="primary" onClick={onSave}>
            저장
          </button>
        </div>
      )}

      {message && <p className="status">{message}</p>}
    </section>
  )
}
